import express, { type Application, type Request, type Response } from 'express';
import dotenv from 'dotenv';
import pool from './db.js';

dotenv.config();

const app: Application = express();
const PORT: number = Number.parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'API is running, TS is compiled.' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});