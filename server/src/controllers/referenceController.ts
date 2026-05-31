import { type Request, type Response, type NextFunction } from 'express';
import pool from '../db.js';
import { logger } from '../utils/logger.js';
import { AppError } from '../middlewares/errorMiddleware.js';
import type { Category, Collection } from '../types/index.js';

export const getAllCategories = async (
    _req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const result = await pool.query('SELECT * FROM category ORDER BY cat_id');
        const categories: Category[] = result.rows;

        logger.info('Categories retrieved successfully', { count: categories.length });
        res.status(200).json({ status: 'success', data: categories });
    } catch (err) {
        logger.error('Error fetching categories', { error: err instanceof Error ? err.message : String(err) });
        next(err);
    }
};

export const getAllCollections = async (
    _req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const result = await pool.query('SELECT * FROM collection ORDER BY collection_id');
        const collections: Collection[] = result.rows;

        logger.info('Collections retrieved successfully', { count: collections.length });
        res.status(200).json({ status: 'success', data: collections });
    } catch (err) {
        logger.error('Error fetching collections', { error: err instanceof Error ? err.message : String(err) });
        next(err);
    }
};
