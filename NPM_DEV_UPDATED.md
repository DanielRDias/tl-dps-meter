# ✅ Updated: npm run dev Now Starts Both Servers!

## What Changed

The `npm run dev` command now automatically starts:
- ✅ **Frontend** (Vite dev server on port 5173)
- ✅ **Backend API** (Express server on port 3001)
- ✅ **Database** (SQLite automatically initialized)

All in one command!

## Quick Start

```bash
npm run dev
```

That's it! Both servers will start together.

### Output You'll See

```
[0] VITE v7.2.6  ready in XXX ms
[0]   ➜  Local:   http://localhost:5173/
[1] DPS Meter API server running on http://localhost:3001
[1] Connected to SQLite database
[1] Database initialized
```

## Available Commands

| Command | What It Does |
|---------|--------------|
| `npm run dev` | Start frontend + backend together (NEW!) |
| `npm run dev:frontend` | Start only the frontend |
| `npm run dev:server` | Start only the backend |
| `npm run build` | Build frontend for production |
| `npm run build:server` | Build backend |
| `npm run preview` | Preview production build |

## How It Works

The `npm run dev` command uses `concurrently` to run both:
1. Vite frontend development server
2. Node.js backend API server

Both run in parallel in the same terminal with prefixed output (`[0]` for frontend, `[1]` for backend).

## Stop the Servers

Press `Ctrl+C` to stop both servers at once.

## If One Server Crashes

If the backend crashes, the frontend will continue running. You can:
1. Stop with `Ctrl+C`
2. Check error messages in the terminal
3. Fix the issue
4. Run `npm run dev` again

## Troubleshooting

**If ports are in use:**
- Vite will auto-switch to 5174, 5175, etc.
- Change backend port in `.env`: `PORT=3002`

**If you want to run servers separately:**
```bash
# Terminal 1
npm run dev:frontend

# Terminal 2
npm run dev:server
```

**If concurrently won't stop:**
```bash
# Windows
taskkill /F /IM node.exe

# macOS/Linux
pkill -f node
```

## Next Steps

1. Run `npm run dev`
2. Open http://localhost:5173
3. Upload a combat log
4. Click "Share Results"
5. Your shared feature is ready! 🎉

---

**Status:** ✅ Single command now starts everything!
