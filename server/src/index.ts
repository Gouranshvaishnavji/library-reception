import express, { type Application, type Request, type Response } from 'express';
import dotenv from 'dotenv';
import pool from './db.js';
import { logger } from './utils/logger.js';
import { errorMiddleware, requestLoggerMiddleware } from './middlewares/errorMiddleware.js';

dotenv.config();

const app: Application = express();
const PORT: number = Number.parseInt(process.env.PORT || '3000', 10);

app.use(express.json());
app.use(requestLoggerMiddleware);

app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'API is running, TS is compiled.' });
});

// Error handling middleware (must be last)
app.use(errorMiddleware);

app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});