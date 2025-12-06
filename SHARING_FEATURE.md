# DPS Meter Sharing Feature Documentation

## Overview

The DPS Meter now includes a sharing feature that allows you to save your combat log results and generate unique shareable links. Other players can access these links to view your detailed combat statistics without needing to upload any files.

## Features

- **One-Click Sharing**: Generate a unique share link with a single click
- **Persistent Storage**: Combat logs are saved to a database for long-term access
- **Unique Share URLs**: Each shared log gets a unique, short-form URL (e.g., `http://localhost:5173/share/a1b2c3d4`)
- **Full Statistics View**: Shared links display all DPS metrics, charts, and breakdowns
- **Copy to Clipboard**: Easy copy-to-clipboard functionality for share URLs

## Architecture

### Frontend Components

1. **ShareModal** (`src/components/ShareModal.tsx`)
   - Modal dialog for initiating the share process
   - Displays summary statistics before sharing
   - Shows the generated share URL
   - Copy-to-clipboard functionality

2. **SharedView** (`src/components/SharedView.tsx`)
   - Displays shared combat log data
   - Shows DPS charts, player stats, skill breakdown, and damage-by-target
   - Fetches data from the backend API

3. **App Router Updates** (`src/App.tsx`)
   - Added routing for `/share/:shareId` path
   - Routes to SharedView component when share link is accessed

### Backend API

The backend is a Node.js/Express server (`server/index.ts`) with the following endpoints:

1. **POST /api/share**
   - Creates a new shared log entry
   - Generates a unique share ID
   - Returns the share URL

   Request body:
   ```json
   {
     "playerName": "PlayerName",
     "totalDamage": 50000,
     "damagePerSecond": 100.5,
     "duration": 500,
     "timestamp": 1700000000,
     "logData": "[...array of combat log entries...]"
   }
   ```

   Response:
   ```json
   {
     "success": true,
     "shareId": "a1b2c3d4",
     "shareUrl": "http://localhost:5173/share/a1b2c3d4"
   }
   ```

2. **GET /api/share/:shareId**
   - Retrieves a previously shared log
   - Returns full combat statistics

   Response:
   ```json
   {
     "success": true,
     "data": {
       "playerName": "PlayerName",
       "totalDamage": 50000,
       "damagePerSecond": 100.5,
       "duration": 500,
       "timestamp": 1700000000,
       "logData": "[...array of combat log entries...]",
       "createdAt": "2024-12-06T10:30:00Z"
     }
   }
   ```

### Database

SQLite database (`dps_shares.db`) with a single table:

```sql
CREATE TABLE shared_logs (
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
```

## Getting Started

### Installation

1. Install dependencies for both frontend and backend:
   ```bash
   npm install
   ```

2. Backend dependencies are included in the main `package.json` (express, cors, sqlite3, etc.)

3. Install server-specific dependencies:
   ```bash
   cd server
   npm install
   cd ..
   ```

### Configuration

Edit `.env` file in the root directory:

```env
# Frontend API URL
VITE_API_URL=http://localhost:3001

# Backend Configuration
PORT=3001
BASE_URL=http://localhost:5173
```

For production, update `BASE_URL` to your production domain and `VITE_API_URL` to your API server URL.

### Running the Application

#### Development Mode (Local)

**Terminal 1 - Frontend:**
```bash
npm run dev
# Runs on http://localhost:5173
```

**Terminal 2 - Backend Server:**
```bash
npm run dev:server
# Runs on http://localhost:3001
```

#### Production Build

**Build Frontend:**
```bash
npm run build
```

**Build Server:**
```bash
npm run build:server
```

**Run Server:**
```bash
npm run start:server
```

## Usage

### Sharing Your Results

1. Upload a combat log file in the DPS Meter
2. View your combat statistics
3. Click the **🔗 Share Results** button
4. Review the statistics in the modal
5. Click **Generate Share Link**
6. Copy the generated link and share it with others

### Viewing Shared Results

1. Receive a share link: `http://your-domain/share/a1b2c3d4`
2. Open the link in a browser
3. View full combat statistics without needing to upload files
4. Explore DPS charts, player stats, and skill breakdowns

## API Configuration

The frontend communicates with the backend via the `src/utils/api.ts` utility:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
```

Update `VITE_API_URL` in `.env` to point to your API server.

## Security Considerations

1. **Unique Share IDs**: Short 8-character UUIDs make shared logs discoverable but not guessable
2. **Database Storage**: SQLite stores all shared logs persistently
3. **CORS**: Backend has CORS enabled for cross-origin requests
4. **Input Validation**: API validates all incoming requests

For production:
- Use environment variables for sensitive data
- Implement authentication for managing shared logs
- Add rate limiting to prevent abuse
- Consider implementing log expiration
- Use HTTPS for all connections
- Move database to a production-grade solution (PostgreSQL, MongoDB)

## File Structure

```
workspace/
├── src/
│   ├── components/
│   │   ├── ShareModal.tsx          # Share dialog component
│   │   ├── SharedView.tsx          # Shared results view
│   │   └── ... (other components)
│   ├── utils/
│   │   ├── api.ts                  # API client functions
│   │   └── ... (other utilities)
│   ├── styles/
│   │   ├── ShareModal.css          # Share modal styles
│   │   ├── SharedView.css          # Shared view styles
│   │   └── ... (other styles)
│   └── App.tsx                     # Updated with routing
├── server/
│   ├── index.ts                    # Express server
│   ├── db.ts                       # Database manager
│   ├── package.json                # Server dependencies
│   └── tsconfig.json               # Server TypeScript config
├── .env                            # Environment variables
└── package.json                    # Root dependencies
```

## Troubleshooting

### "Failed to share log" Error
- Ensure the backend server is running (`npm run dev:server`)
- Check that `VITE_API_URL` in `.env` matches your API server URL
- Check browser console for detailed error messages

### Share Link Not Working
- Verify the `BASE_URL` in `.env` matches your application URL
- Ensure the share ID is correct in the URL
- Check that the database file (`dps_shares.db`) is accessible

### Port Already in Use
- Backend defaults to port 3001. Change in `.env` if needed:
  ```env
  PORT=3002
  ```
- Frontend defaults to port 5173. Change in `vite.config.ts` if needed

## Future Enhancements

- [ ] User accounts and log management
- [ ] Log expiration/deletion
- [ ] Share permissions and password protection
- [ ] Advanced analytics on shared logs
- [ ] Export shared logs as PDF/CSV
- [ ] Public leaderboards
- [ ] Social sharing integration

## Support

For issues or questions, please refer to the main README.md or create an issue in the repository.
