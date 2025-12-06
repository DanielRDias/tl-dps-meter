import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DB_PATH = path.join(__dirname, 'dps_shares.db');

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

class SqliteDatabase {
  private db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('SQLite connection error:', err);
      } else {
        console.log('Connected to SQLite database');
      }
    });
  }

  initialize() {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS shared_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        shareId TEXT UNIQUE NOT NULL,
        playerName TEXT NOT NULL,
        totalDamage INTEGER NOT NULL,
        damagePerSecond REAL NOT NULL,
        duration INTEGER NOT NULL,
        timestamp INTEGER NOT NULL,
        logData TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Error creating SQLite table:', err);
      } else {
        console.log('SQLite Database initialized');
      }
    });
  }

  saveLog(
    shareId: string,
    playerName: string,
    totalDamage: number,
    dps: number,
    duration: number,
    timestamp: number,
    logData: string
  ): Promise<SharedLog> {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO shared_logs (shareId, playerName, totalDamage, damagePerSecond, duration, timestamp, logData)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [shareId, playerName, totalDamage, dps, duration, timestamp, logData],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({
              id: this.lastID,
              shareId,
              playerName,
              totalDamage,
              damagePerSecond: dps,
              duration,
              timestamp,
              logData,
              createdAt: new Date(),
            });
          }
        }
      );
    });
  }

  getLogByShareId(shareId: string): Promise<SharedLog | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM shared_logs WHERE shareId = ?',
        [shareId],
        (err, row: any) => {
          if (err) {
            reject(err);
          } else {
            resolve(row || null);
          }
        }
      );
    });
  }

  getAllLogs(): Promise<SharedLog[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM shared_logs ORDER BY createdAt DESC LIMIT 100',
        (err, rows: any[]) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows || []);
          }
        }
      );
    });
  }

  close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

export default new SqliteDatabase();
