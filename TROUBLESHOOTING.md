# Troubleshooting: "Failed to fetch" Error

## Quick Fix

If you're getting a "Failed to fetch" error when trying to share DPS results, the backend server is not running. Here's how to fix it:

### Step 1: Install Backend Dependencies
```bash
cd server
npm install
cd ..
```

### Step 2: Start Backend Server
Open a new terminal and run:
```bash
cd server
node index.js
```

You should see:
```
DPS Meter API server running on http://localhost:3001
Connected to SQLite database
Database initialized
```

### Step 3: Verify Frontend is Running
Make sure your frontend is running on a port (usually 5173, 5174, or 5175):
```bash
npm run dev
```

### Step 4: Update Environment
Verify your `.env` file has the correct settings:
```env
VITE_API_URL=http://localhost:3001
BASE_URL=http://localhost:5175
PORT=3001
```

## The Easy Way: Use the Startup Script

We've created `start-dev.bat` to run both servers at once:

```bash
./start-dev.bat
```

This will:
1. Start the backend server on port 3001
2. Start the frontend server on port 5173+

## Detailed Troubleshooting

### Issue: "Failed to fetch" when clicking Share

**Cause:** Backend server is not running

**Solution:**
```bash
cd server
node index.js
```

Then try sharing again.

### Issue: Backend won't start - "Cannot find module"

**Cause:** Node modules not installed for server

**Solution:**
```bash
cd server
npm install
cd ..
```

Then run:
```bash
cd server
node index.js
```

### Issue: Port 3001 already in use

**Cause:** Another process is using port 3001

**Solution:** 
Option 1 - Find what's using the port:
```bash
netstat -ano | findstr :3001
```

Option 2 - Use a different port by updating `.env`:
```env
PORT=3002
VITE_API_URL=http://localhost:3002
```

### Issue: CORS error in browser console

**Cause:** Frontend and backend URLs don't match

**Solution:** 
Make sure `.env` has correct URLs:
```env
VITE_API_URL=http://localhost:3001
BASE_URL=http://localhost:5173  # or whatever port frontend is on
```

### Issue: Share data not saving to database

**Cause:** SQLite database path issue

**Solution:**
1. Check that `server/dps_shares.db` exists
2. Verify permissions on server directory
3. Check server console for errors

To clear the database:
```bash
rm server/dps_shares.db
```

It will be recreated on next server start.

## Ports in Use

When running locally:

| Service | Port | URL |
|---------|------|-----|
| Frontend | 5173+ | http://localhost:5173 |
| Backend | 3001 | http://localhost:3001 |
| Database | N/A | server/dps_shares.db |

If ports are in use, Vite will automatically use next available port (5174, 5175, etc.)

## Testing the API

You can test if the backend is working:

```bash
# From any terminal
curl http://localhost:3001/health
```

Should return:
```json
{"status":"ok"}
```

## Complete Setup Instructions

### Fresh Start

```bash
# 1. Install all dependencies
npm install

# 2. Install server dependencies  
cd server
npm install
cd ..

# 3. Terminal 1: Start Frontend
npm run dev

# 4. Terminal 2: Start Backend
cd server
node index.js

# 5. Open browser
# http://localhost:5173 (or whatever port shows)

# 6. Upload a log and try Share button
```

## Still Having Issues?

Check these files:

1. **.env** - Make sure `VITE_API_URL=http://localhost:3001` is set
2. **server/package.json** - Ensure dependencies are listed
3. **src/utils/api.ts** - Check API_BASE_URL uses VITE_API_URL
4. **Browser Console** - Look for exact error message

## Logs to Check

### Backend Logs
Check terminal where you run `node index.js`:
```
DPS Meter API server running on http://localhost:3001  ← Server started
Connected to SQLite database                           ← DB connected
Database initialized                                   ← Tables created
POST /api/share - 200 OK                              ← Share created
GET /api/share/a1b2c3d4 - 200 OK                      ← Share retrieved
```

### Frontend Console (Browser DevTools)
Press F12 → Console tab → Look for:
```
Failed to fetch ...     ← Network error (backend not running)
No error = Success!     ← Shared successfully
```

### Network Tab (Browser DevTools)
Press F12 → Network tab:
1. Upload log
2. Click "Share Results"
3. Look for request to `http://localhost:3001/api/share`
4. Check if it's pending, successful (200), or failed (error)

## Quick Reference

| Problem | Command |
|---------|---------|
| Backend won't start | `cd server && npm install && node index.js` |
| Port in use | `netstat -ano \| findstr :3001` |
| Clear database | `rm server/dps_shares.db` |
| Test backend | `curl http://localhost:3001/health` |
| Check deps | `npm list && cd server && npm list && cd ..` |

---

**Got it working?** Great! Now enjoy sharing your DPS results! 🎉

If you're still stuck, check the detailed logs and error messages in:
- Browser console (F12)
- Backend terminal output
- `.env` file configuration
