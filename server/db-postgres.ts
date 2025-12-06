import { query } from './aws-db.js';

export interface SharedLog {
  id: number;
  shareId: string;
  playerName: string;
  totalDamage: number;
  damagePerSecond: number;
  duration: number;
  timestamp: number;
  logData: string;
  createdAt: Date;
}

class PostgresDatabase {
  async initialize() {
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS shared_logs (
          id SERIAL PRIMARY KEY,
          shareId VARCHAR(8) UNIQUE NOT NULL,
          playerName VARCHAR(255) NOT NULL,
          totalDamage BIGINT NOT NULL,
          damagePerSecond DECIMAL(10, 2) NOT NULL,
          duration INTEGER NOT NULL,
          timestamp BIGINT NOT NULL,
          logData TEXT NOT NULL,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create index for faster queries
      await query(`
        CREATE INDEX IF NOT EXISTS idx_shareId ON shared_logs(shareId)
      `);

      console.log('PostgreSQL Database initialized successfully');
    } catch (err) {
      console.error('Error initializing PostgreSQL database:', err);
      throw err;
    }
  }

  async saveLog(
    shareId: string,
    playerName: string,
    totalDamage: number,
    dps: number,
    duration: number,
    timestamp: number,
    logData: string
  ): Promise<SharedLog> {
    try {
      const result = await query(
        `INSERT INTO shared_logs (shareId, playerName, totalDamage, damagePerSecond, duration, timestamp, logData)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, shareId, playerName, totalDamage, damagePerSecond, duration, timestamp, logData, createdAt`,
        [shareId, playerName, totalDamage, dps, duration, timestamp, logData]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error saving log to PostgreSQL:', error);
      throw error;
    }
  }

  async getLogByShareId(shareId: string): Promise<SharedLog | null> {
    try {
      const result = await query(
        'SELECT id, shareId, playerName, totalDamage, damagePerSecond, duration, timestamp, logData, createdAt FROM shared_logs WHERE shareId = $1',
        [shareId]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error retrieving log from PostgreSQL:', error);
      throw error;
    }
  }

  async getAllLogs(): Promise<SharedLog[]> {
    try {
      const result = await query(
        'SELECT id, shareId, playerName, totalDamage, damagePerSecond, duration, timestamp, logData, createdAt FROM shared_logs ORDER BY createdAt DESC LIMIT 100'
      );

      return result.rows;
    } catch (error) {
      console.error('Error retrieving all logs from PostgreSQL:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    try {
      // Connection pool doesn't need explicit close in most cases
      // but you can drain it if needed
      console.log('PostgreSQL connection pool ready for graceful shutdown');
    } catch (error) {
      console.error('Error closing PostgreSQL connection:', error);
      throw error;
    }
  }
}

export default new PostgresDatabase();
