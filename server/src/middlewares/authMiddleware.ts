import { type Request,type Response,type NextFunction } from 'express';
import { logger } from '../utils/logger.js';

const ASSIGNMENT_API_KEY = process.env.API_KEY || 'altlife-devops-key-2026';

export const requireApiKey = (req: Request, res: Response, next: NextFunction): void => {
    const providedKey = req.header('x-api-key');

    if (!providedKey || providedKey !== ASSIGNMENT_API_KEY) {
        logger.warn(`Unauthorized access attempt. Provided key: ${providedKey || 'None'}`, {
            path: req.path,
            method: req.method,
            ip: req.ip
        });
        
        res.status(401).json({
            status: 'error',
            message: 'Unauthorized: Invalid or missing API Key',
            statusCode: 401
        });
        return;
    }

    next();
};