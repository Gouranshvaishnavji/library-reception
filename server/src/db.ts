import { Pool } from 'pg';
import dotenv from 'dotenv';
import { logger } from './utils/logger.js';

dotenv.config();

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: '127.0.0.1',
    port: 5435,
    database: process.env.DB_NAME,
    ssl: false, 
});

pool.connect()
    .then(() => logger.info('Successfully connected to the PostgreSQL database.'))
    .catch((err: Error) => logger.error('Database connection error:', { message: err.message }));

export default pool;