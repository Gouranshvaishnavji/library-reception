import express, { type Application, type Request, type Response } from 'express';
import dotenv from 'dotenv';
import pool from './db.js';
import { logger } from './utils/logger.js';
import { errorMiddleware, requestLoggerMiddleware } from './middlewares/errorMiddleware.js';
import bookRoutes from './routes/bookRoutes.js';
import issuanceRoutes from './routes/issuanceRoutes.js';
import memberRoutes from './routes/memberRoutes.js';
import referenceRoutes from './routes/referenceRoutes.js';

dotenv.config();

const app: Application = express();
const PORT: number = Number.parseInt(process.env.PORT || '3000', 10);

app.use(express.json());
app.use(requestLoggerMiddleware);

app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'API is running, TS is compiled.' });
});

// I am organizing all business logic routes under their respective path prefixes to maintain a clean and scalable API structure.
app.use('/api/books', bookRoutes);
app.use('/api/issuances', issuanceRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/reference', referenceRoutes);

// Error handling middleware (must be last)
app.use(errorMiddleware);

app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});