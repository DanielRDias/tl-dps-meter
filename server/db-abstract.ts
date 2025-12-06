/**
 * Database Abstraction Layer
 * 
 * This module provides a unified interface for both SQLite (local development)
 * and PostgreSQL (AWS RDS production). Automatically selects based on environment.
 */

export interface SharedLog {
  id: number | string;
  shareId: string;
  playerName: string;
  totalDamage: number;
  damagePerSecond: number;
  duration: number;
  timestamp: number;
  logData: string;
  createdAt: Date | string;
}

class DatabaseAbstraction {
  private db: any;
  private type: 'sqlite' | 'postgres' = 'sqlite';

  async initialize() {
    // Determine which database to use
    if (process.env.DB_HOST && process.env.DB_USER && process.env.DB_PASSWORD) {
      console.log('Using PostgreSQL (AWS RDS)...');
      this.type = 'postgres';
      const { default: pgDb } = await import('./db-postgres.js');
      this.db = pgDb;
      await this.db.initialize();
    } else {
      console.log('Using SQLite (local development)...');
      this.type = 'sqlite';
      const { default: sqliteDb } = await import('./db-sqlite.js');
      this.db = sqliteDb;
      this.db.initialize();
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
    return this.db.saveLog(shareId, playerName, totalDamage, dps, duration, timestamp, logData);
  }

  async getLogByShareId(shareId: string): Promise<SharedLog | null> {
    return this.db.getLogByShareId(shareId);
  }

  async getAllLogs(): Promise<SharedLog[]> {
    return this.db.getAllLogs();
  }

  async close(): Promise<void> {
    return this.db.close();
  }

  getType(): string {
    return this.type;
  }
}

export default new DatabaseAbstraction();
