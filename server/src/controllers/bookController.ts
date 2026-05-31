import { type Request, type Response, type NextFunction } from 'express';
import pool from '../db.js';
import { logger } from '../utils/logger.js';
import { AppError } from '../middlewares/errorMiddleware.js';
import type { BookDetail } from '../types/index.js';

export const getBooks = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const { category, collection, author, genre } = req.query;

        // I am using a LEFT join to category and collection so books without these associations are still returned.
        // I am also LEFT joining to issuance with a WHERE clause on issuance_status to count only active issuances.
        // This single query avoids the N+1 query problem and provides all necessary data in one database round trip.
        const query = `
            SELECT 
                b.book_id,
                b.book_name,
                b.author,
                b.book_cat_id,
                b.book_collection_id,
                b.book_launch_date,
                b.book_publisher,
                c.cat_id,
                c.cat_name,
                c.sub_cat_name,
                coll.collection_id,
                coll.collection_name,
                COUNT(i.issuance_id) FILTER (WHERE i.issuance_status = 'active') as active_issuances
            FROM book b
            LEFT JOIN category c ON b.book_cat_id = c.cat_id
            LEFT JOIN collection coll ON b.book_collection_id = coll.collection_id
            LEFT JOIN issuance i ON b.book_id = i.book_id
            WHERE 
                (${category ? 'c.cat_name ILIKE $' + (Object.keys({ category, collection, author, genre }).indexOf('category') + 1) : '1=1'})
                AND (${collection ? 'coll.collection_name ILIKE $' + (Object.keys({ category, collection, author, genre }).indexOf('collection') + 1) : '1=1'})
                AND (${author ? 'b.author ILIKE $' + (Object.keys({ category, collection, author, genre }).indexOf('author') + 1) : '1=1'})
                AND (${genre ? 'c.sub_cat_name ILIKE $' + (Object.keys({ category, collection, author, genre }).indexOf('genre') + 1) : '1=1'})
            GROUP BY b.book_id, c.cat_id, coll.collection_id
            ORDER BY b.book_id
        `;

        const params: (string | undefined)[] = [];
        if (category) params.push(`%${category}%`);
        if (collection) params.push(`%${collection}%`);
        if (author) params.push(`%${author}%`);
        if (genre) params.push(`%${genre}%`);

        const result = await pool.query(query, params.length > 0 ? params : undefined);

        // I am transforming the flat query result into a hierarchical structure to return well-formatted book details with nested category and collection objects.
        const books: BookDetail[] = result.rows.map((row) => ({
            book_id: row.book_id,
            book_name: row.book_name,
            author: row.author,
            book_cat_id: row.book_cat_id,
            book_collection_id: row.book_collection_id,
            book_launch_date: row.book_launch_date,
            book_publisher: row.book_publisher,
            category: row.cat_id
                ? {
                      cat_id: row.cat_id,
                      cat_name: row.cat_name,
                      sub_cat_name: row.sub_cat_name,
                  }
                : null,
            collection: row.collection_id
                ? {
                      collection_id: row.collection_id,
                      collection_name: row.collection_name,
                  }
                : null,
            active_issuances: parseInt(row.active_issuances, 10),
        }));

        logger.info('Books retrieved successfully', { count: books.length });
        res.status(200).json({ status: 'success', data: books });
    } catch (err) {
        logger.error('Error fetching books', { error: err instanceof Error ? err.message : String(err) });
        next(err);
    }
};

export const getBookById = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const { bookId } = req.params;

        const query = `
            SELECT 
                b.book_id,
                b.book_name,
                b.author,
                b.book_cat_id,
                b.book_collection_id,
                b.book_launch_date,
                b.book_publisher,
                c.cat_id,
                c.cat_name,
                c.sub_cat_name,
                coll.collection_id,
                coll.collection_name,
                COUNT(i.issuance_id) FILTER (WHERE i.issuance_status = 'active') as active_issuances
            FROM book b
            LEFT JOIN category c ON b.book_cat_id = c.cat_id
            LEFT JOIN collection coll ON b.book_collection_id = coll.collection_id
            LEFT JOIN issuance i ON b.book_id = i.book_id
            WHERE b.book_id = $1
            GROUP BY b.book_id, c.cat_id, coll.collection_id
        `;

        const result = await pool.query(query, [bookId]);

        if (result.rows.length === 0) {
            throw new AppError(404, `Book with ID ${bookId} not found`);
        }

        const row = result.rows[0];
        const book: BookDetail = {
            book_id: row.book_id,
            book_name: row.book_name,
            author: row.author,
            book_cat_id: row.book_cat_id,
            book_collection_id: row.book_collection_id,
            book_launch_date: row.book_launch_date,
            book_publisher: row.book_publisher,
            category: row.cat_id
                ? {
                      cat_id: row.cat_id,
                      cat_name: row.cat_name,
                      sub_cat_name: row.sub_cat_name,
                  }
                : null,
            collection: row.collection_id
                ? {
                      collection_id: row.collection_id,
                      collection_name: row.collection_name,
                  }
                : null,
            active_issuances: parseInt(row.active_issuances, 10),
        };

        logger.info(`Book retrieved successfully`, { bookId });
        res.status(200).json({ status: 'success', data: book });
    } catch (err) {
        logger.error(`Error fetching book ${req.params.bookId}`, { error: err instanceof Error ? err.message : String(err) });
        next(err);
    }
};
