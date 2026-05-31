import { type Request, type Response, type NextFunction } from 'express';
import pool from '../db.js';
import { logger } from '../utils/logger.js';
import { AppError } from '../middlewares/errorMiddleware.js';
import type { Issuance } from '../types/index.js';

export const issueBook = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    const client = await pool.connect();

    try {
        const { book_id, member_id, issued_by, target_return_date } = req.body;

        if (!book_id || !member_id || !target_return_date) {
            throw new AppError(400, 'Missing required fields: book_id, member_id, target_return_date');
        }

        // I wrapped the entire issuance workflow in a transaction because if the issuance record fails to insert,
        // I cannot leave the book status marked as unavailable, and vice versa. This ensures atomicity.
        await client.query('BEGIN');

        // I am checking both book existence and member existence before proceeding with the issuance.
        const bookResult = await client.query('SELECT book_id FROM book WHERE book_id = $1', [book_id]);
        if (bookResult.rows.length === 0) {
            await client.query('ROLLBACK');
            throw new AppError(404, `Book with ID ${book_id} not found`);
        }

        const memberResult = await client.query('SELECT mem_id FROM member WHERE mem_id = $1', [member_id]);
        if (memberResult.rows.length === 0) {
            await client.query('ROLLBACK');
            throw new AppError(404, `Member with ID ${member_id} not found`);
        }

        // I am counting active issuances to prevent issuing the same book multiple times if inventory is not tracked separately.
        // If the count is greater than 0, the book is currently unavailable. This logic can be enhanced with an inventory table.
        const activeIssuanceResult = await client.query(
            'SELECT COUNT(*) as count FROM issuance WHERE book_id = $1 AND issuance_status = $2',
            [book_id, 'active'],
        );

        if (parseInt(activeIssuanceResult.rows[0].count, 10) > 0) {
            await client.query('ROLLBACK');
            throw new AppError(409, `Book with ID ${book_id} is currently unavailable`);
        }

        const issuance_date = new Date();
        const insertResult = await client.query(
            `INSERT INTO issuance (book_id, issuance_member, issued_by, issuance_date, target_return_date, issuance_status)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [book_id, member_id, issued_by || null, issuance_date, target_return_date, 'active'],
        );

        await client.query('COMMIT');

        const issuance: Issuance = insertResult.rows[0];
        logger.info('Book issued successfully', { issuance_id: issuance.issuance_id, book_id, member_id });
        res.status(201).json({ status: 'success', data: issuance });
    } catch (err) {
        await client.query('ROLLBACK').catch(() => {});
        logger.error('Error issuing book', { error: err instanceof Error ? err.message : String(err) });
        next(err);
    } finally {
        client.release();
    }
};

export const returnBook = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    const client = await pool.connect();

    try {
        const { issuanceId } = req.params;

        if (!issuanceId) {
            throw new AppError(400, 'Missing required parameter: issuanceId');
        }

        // I am wrapping the return workflow in a transaction to ensure the issuance status and book availability are updated consistently.
        await client.query('BEGIN');

        const issuanceResult = await client.query(
            'SELECT * FROM issuance WHERE issuance_id = $1 AND issuance_status = $2',
            [issuanceId, 'active'],
        );

        if (issuanceResult.rows.length === 0) {
            await client.query('ROLLBACK');
            throw new AppError(404, `Active issuance with ID ${issuanceId} not found`);
        }

        const updateResult = await client.query(
            `UPDATE issuance 
             SET issuance_status = $1 
             WHERE issuance_id = $2 
             RETURNING *`,
            ['returned', issuanceId],
        );

        await client.query('COMMIT');

        const issuance: Issuance = updateResult.rows[0];
        logger.info('Book returned successfully', { issuance_id: issuanceId, book_id: issuance.book_id });
        res.status(200).json({ status: 'success', data: issuance });
    } catch (err) {
        await client.query('ROLLBACK').catch(() => {});
        logger.error(`Error returning book for issuance ${req.params.issuanceId}`, {
            error: err instanceof Error ? err.message : String(err),
        });
        next(err);
    } finally {
        client.release();
    }
};

export const getIssuanceHistory = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const { member_id, status } = req.query;

        let query = `
            SELECT 
                i.*,
                b.book_name,
                b.author,
                m.mem_name,
                m.mem_email
            FROM issuance i
            LEFT JOIN book b ON i.book_id = b.book_id
            LEFT JOIN member m ON i.issuance_member = m.mem_id
            WHERE 1=1
        `;

        const params: (string | number)[] = [];

        if (member_id) {
            query += ` AND i.issuance_member = $${params.length + 1}`;
            params.push(Number(member_id));
        }

        if (status) {
            query += ` AND i.issuance_status = $${params.length + 1}`;
            params.push(String(status));
        }

        query += ' ORDER BY i.issuance_date DESC';

        const result = await pool.query(query, params.length > 0 ? params : undefined);

        logger.info('Issuance history retrieved successfully', { count: result.rows.length });
        res.status(200).json({ status: 'success', data: result.rows });
    } catch (err) {
        logger.error('Error fetching issuance history', { error: err instanceof Error ? err.message : String(err) });
        next(err);
    }
};
