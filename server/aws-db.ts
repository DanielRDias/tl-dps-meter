import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  user: process.env.DB_USER || 'dpsadmin',
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'dpsmeter_db',
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle client', err);
});

pool.on('connect', () => {
  console.log('Client connected to database');
});

pool.on('remove', () => {
  console.log('Client removed from pool');
});

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { 
      text: text.substring(0, 50) + '...', 
      duration, 
      rows: result.rowCount 
    });
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

export const close = async () => {
  await pool.end();
  console.log('Database connection pool closed');
};

export default pool;
