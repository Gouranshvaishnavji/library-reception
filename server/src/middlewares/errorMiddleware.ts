import { type Request, type Response, type NextFunction } from 'express';
import { logger } from '../utils/logger.js';

export class AppError extends Error {
    constructor(
        public statusCode: number,
        message: string,
    ) {
        super(message);
        this.name = 'AppError';
    }
}

export const errorMiddleware = (
    err: Error | AppError,
    _req: Request,
    res: Response,
    _next: NextFunction,
): void => {
    if (err instanceof AppError) {
        logger.error(`AppError: ${err.message}`, {
            statusCode: err.statusCode,
            stack: err.stack,
        });
        res.status(err.statusCode).json({
            status: 'error',
            message: err.message,
            statusCode: err.statusCode,
        });
    } else {
        logger.error(`Unexpected error: ${err.message}`, {
            stack: err.stack,
        });
        res.status(500).json({
            status: 'error',
            message: 'Internal Server Error',
            statusCode: 500,
        });
    }
};

export const requestLoggerMiddleware = (
    req: Request,
    _res: Response,
    next: NextFunction,
): void => {
    const start = Date.now();

    // Log request details
    logger.info(`Incoming request: ${req.method} ${req.path}`, {
        method: req.method,
        path: req.path,
        query: req.query,
    });

    // Capture the original send function
    const originalSend = _res.send;

    // Override send to log response
    _res.send = function (data: unknown) {
        const duration = Date.now() - start;
        logger.info(`Response sent: ${req.method} ${req.path}`, {
            method: req.method,
            path: req.path,
            statusCode: _res.statusCode,
            duration: `${duration}ms`,
        });

        // Call the original send
        return originalSend.call(this, data);
    };

    next();
};
