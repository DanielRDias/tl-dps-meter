import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'dps_shares.db');
class Database {
    constructor() {
        this.db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                console.error('Database connection error:', err);
            }
            else {
                console.log('Connected to SQLite database');
            }
        });
        this.init();
    }
    init() {
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
                console.error('Error creating table:', err);
            }
            else {
                console.log('Database initialized');
            }
        });
    }
    saveLog(shareId, playerName, totalDamage, dps, duration, timestamp, logData) {
        return new Promise((resolve, reject) => {
            this.db.run(`INSERT INTO shared_logs (shareId, playerName, totalDamage, damagePerSecond, duration, timestamp, logData)
         VALUES (?, ?, ?, ?, ?, ?, ?)`, [shareId, playerName, totalDamage, dps, duration, timestamp, logData], function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve({
                        id: this.lastID.toString(),
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
            });
        });
    }
    getLogByShareId(shareId) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM shared_logs WHERE shareId = ?', [shareId], (err, row) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(row || null);
                }
            });
        });
    }
    getAllLogs() {
        return new Promise((resolve, reject) => {
            this.db.all('SELECT * FROM shared_logs ORDER BY createdAt DESC LIMIT 100', (err, rows) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(rows || []);
                }
            });
        });
    }
    close() {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }
}
export default new Database();
