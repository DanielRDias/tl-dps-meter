# Quick Start: DPS Meter Sharing Feature

## What's New?

Your DPS Meter now has a **sharing feature** that lets you:
- ✅ Save your combat logs
- ✅ Generate unique shareable links
- ✅ Share results with others without them needing to upload files

## Setup (One-Time)

### 1. Install Server Dependencies
```bash
cd server
npm install
cd ..
```

### 2. Configure Environment
Create/update `.env` file:
```env
VITE_API_URL=http://localhost:3001
PORT=3001
BASE_URL=http://localhost:5173
```

## Running the App

### Terminal 1: Start Frontend
```bash
npm run dev
```
- Opens: `http://localhost:5173`

### Terminal 2: Start Backend Server
```bash
npm run dev:server
```
- Runs on: `http://localhost:3001`

## Using the Share Feature

### Step 1: Upload Combat Log
1. Open `http://localhost:5173`
2. Upload your combat log file
3. Wait for stats to load

### Step 2: Share Results
1. Click the **🔗 Share Results** button (top right)
2. Review your stats in the modal
3. Click **Generate Share Link**
4. Copy the generated URL

### Step 3: Share with Others
- Send the link to friends/guildmates
- They can open it directly in a browser
- They'll see all your stats, charts, and breakdowns
- No file upload needed!

### Example Share Link
```
http://localhost:5173/share/a1b2c3d4
```

## What Gets Shared

When you share, these are included:
- ✅ Player name
- ✅ Total damage
- ✅ DPS (Damage Per Second)
- ✅ Combat duration
- ✅ All combat log entries
- ✅ Interactive charts
- ✅ Skill breakdown
- ✅ Damage-by-target stats

## Production Deployment

### Update Environment for Production
Edit `.env`:
```env
VITE_API_URL=https://api.yourdomain.com
BASE_URL=https://yourdomain.com
PORT=3001
```

### Build for Production
```bash
npm run build
npm run build:server
```

### Run Server in Production
```bash
npm run start:server
```

## Database

The backend uses **SQLite** to store shared logs.

**File location:** `server/dps_shares.db` (auto-created)

**What's stored:**
- Share ID (unique identifier)
- Player name
- Combat statistics
- Raw combat log data
- Creation timestamp

## Troubleshooting

### Share button doesn't appear
- Ensure combat log is loaded and stats are calculated
- Check browser console for errors

### "Failed to share log" error
- Verify backend is running (`npm run dev:server`)
- Check `.env` file has correct `VITE_API_URL`
- Look at terminal output for backend errors

### Share link gives "Not Found"
- Verify share ID is correct in URL
- Ensure backend is running
- Check database file exists (`server/dps_shares.db`)

### Port conflicts
- Frontend: Change port in `vite.config.ts`
- Backend: Change `PORT` in `.env`

## File Structure

```
workspace/
├── server/              # Backend API
│   ├── index.ts         # Express server
│   ├── db.ts            # SQLite database
│   └── package.json
├── src/
│   ├── components/
│   │   ├── ShareModal.tsx       # Share dialog
│   │   ├── SharedView.tsx       # View shared results
│   │   └── DPSMeter.tsx         # Main component (updated)
│   ├── utils/
│   │   ├── api.ts               # API client
│   │   └── logParser.ts
│   └── App.tsx                  # Routing added
├── .env                 # Configuration
└── SHARING_FEATURE.md  # Full documentation
```

## What Happens Behind the Scenes

1. **User clicks "Share Results"** → Modal opens
2. **User generates link** → Frontend sends data to backend
3. **Backend creates entry** → Generates unique share ID, saves to database
4. **Returns share URL** → Frontend shows URL to user
5. **User shares link** → Sends URL to others
6. **Others open link** → React routes to `/share/:shareId`
7. **Frontend fetches data** → Calls backend API to retrieve saved data
8. **Display results** → Shows full DPS analysis without needing file

## Next Steps

- Review `SHARING_FEATURE.md` for detailed API documentation
- Set up proper HTTPS for production
- Consider adding user authentication for managing shared logs
- Implement log expiration/deletion features

---

**Happy sharing!** 🚀
