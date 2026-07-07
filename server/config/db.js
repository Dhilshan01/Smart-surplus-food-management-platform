import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.connect()
    .then((client) => {
        console.log('PostgreSQL connected successfully');
        client.release();
    })
    .catch((err) => console.error('Database connection error:', err));

export default pool;
