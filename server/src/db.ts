import { Pool } from 'pg';
import dotenv from 'dotenv';

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
    .then(() => console.log('Successfully connected to the PostgreSQL database.'))
    .catch((err: Error) => console.error('Database connection error:', err.message));

export default pool;