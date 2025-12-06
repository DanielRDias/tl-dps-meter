import express, { Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import db from './db.js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Routes

// Save a combat log and get a share ID
app.post('/api/share', async (req: Request, res: Response) => {
  try {
    const { playerName, totalDamage, damagePerSecond, duration, timestamp, logData } = req.body;

    if (!playerName || totalDamage === undefined || damagePerSecond === undefined || duration === undefined || !logData) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const shareId = uuidv4().substring(0, 8); // Short share ID
    const saved = await db.saveLog(shareId, playerName, totalDamage, damagePerSecond, duration, timestamp, logData);

    res.json({
      success: true,
      shareId: saved.shareId,
      shareUrl: `${process.env.BASE_URL || 'http://localhost:5173'}/share/${saved.shareId}`,
    });
  } catch (error) {
    console.error('Error saving log:', error);
    res.status(500).json({ error: 'Failed to save log' });
  }
});

// Retrieve a shared log
app.get('/api/share/:shareId', async (req: Request, res: Response) => {
  try {
    const { shareId } = req.params;

    if (!shareId) {
      return res.status(400).json({ error: 'Share ID is required' });
    }

    const log = await db.getLogByShareId(shareId);

    if (!log) {
      return res.status(404).json({ error: 'Share not found' });
    }

    res.json({
      success: true,
      data: {
        playerName: log.playerName,
        totalDamage: log.totalDamage,
        damagePerSecond: log.damagePerSecond,
        duration: log.duration,
        timestamp: log.timestamp,
        logData: JSON.parse(log.logData),
        createdAt: log.createdAt,
      },
    });
  } catch (error) {
    console.error('Error retrieving log:', error);
    res.status(500).json({ error: 'Failed to retrieve log' });
  }
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
  console.log(`DPS Meter API server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down...');
  await db.close();
  process.exit(0);
});
