import { type Request, type Response, type NextFunction } from 'express';
import pool from '../db.js';
import { logger } from '../utils/logger.js';
import { AppError } from '../middlewares/errorMiddleware.js';
import type { Member } from '../types/index.js';

export const createMember = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const { mem_name, mem_phone, mem_email } = req.body;

        if (!mem_name) {
            throw new AppError(400, 'Missing required field: mem_name');
        }

        const result = await pool.query(
            'INSERT INTO member (mem_name, mem_phone, mem_email) VALUES ($1, $2, $3) RETURNING *',
            [mem_name, mem_phone || null, mem_email || null],
        );

        const member: Member = result.rows[0];
        logger.info('Member created successfully', { mem_id: member.mem_id });
        res.status(201).json({ status: 'success', data: member });
    } catch (err) {
        logger.error('Error creating member', { error: err instanceof Error ? err.message : String(err) });
        next(err);
    }
};

export const getMemberById = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const { memberId } = req.params;

        const result = await pool.query('SELECT * FROM member WHERE mem_id = $1', [memberId]);

        if (result.rows.length === 0) {
            throw new AppError(404, `Member with ID ${memberId} not found`);
        }

        const member: Member = result.rows[0];
        logger.info(`Member retrieved successfully`, { memberId });
        res.status(200).json({ status: 'success', data: member });
    } catch (err) {
        logger.error(`Error fetching member ${req.params.memberId}`, { error: err instanceof Error ? err.message : String(err) });
        next(err);
    }
};

export const getAllMembers = async (
    _req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const result = await pool.query('SELECT * FROM member ORDER BY mem_id');
        const members: Member[] = result.rows;

        logger.info('Members retrieved successfully', { count: members.length });
        res.status(200).json({ status: 'success', data: members });
    } catch (err) {
        logger.error('Error fetching members', { error: err instanceof Error ? err.message : String(err) });
        next(err);
    }
};

export const updateMember = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const { memberId } = req.params;
        const { mem_name, mem_phone, mem_email } = req.body;

        const existingResult = await pool.query('SELECT * FROM member WHERE mem_id = $1', [memberId]);

        if (existingResult.rows.length === 0) {
            throw new AppError(404, `Member with ID ${memberId} not found`);
        }

        const existing = existingResult.rows[0];

        // I used COALESCE logic here to ensure partial updates do not overwrite existing member contact information with null values.
        const updatedName = mem_name !== undefined ? mem_name : existing.mem_name;
        const updatedPhone = mem_phone !== undefined ? mem_phone : existing.mem_phone;
        const updatedEmail = mem_email !== undefined ? mem_email : existing.mem_email;

        const result = await pool.query(
            'UPDATE member SET mem_name = $1, mem_phone = $2, mem_email = $3 WHERE mem_id = $4 RETURNING *',
            [updatedName, updatedPhone, updatedEmail, memberId],
        );

        const member: Member = result.rows[0];
        logger.info('Member updated successfully', { memberId });
        res.status(200).json({ status: 'success', data: member });
    } catch (err) {
        logger.error(`Error updating member ${req.params.memberId}`, { error: err instanceof Error ? err.message : String(err) });
        next(err);
    }
};

export const deleteMember = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const { memberId } = req.params;

        const result = await pool.query('DELETE FROM member WHERE mem_id = $1 RETURNING mem_id', [memberId]);

        if (result.rows.length === 0) {
            throw new AppError(404, `Member with ID ${memberId} not found`);
        }

        logger.info('Member deleted successfully', { memberId });
        res.status(200).json({ status: 'success', message: `Member ${memberId} deleted successfully` });
    } catch (err) {
        logger.error(`Error deleting member ${req.params.memberId}`, { error: err instanceof Error ? err.message : String(err) });
        next(err);
    }
};
