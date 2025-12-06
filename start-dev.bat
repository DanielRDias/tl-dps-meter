@echo off
REM DPS Meter - Start Both Servers
REM Run this batch file to start frontend and backend in one command

echo.
echo ============================================
echo  DPS Meter - Development Server Launcher
echo ============================================
echo.
echo Starting Frontend (Port 5173+) and Backend (Port 3001)...
echo.

REM Start backend in a new window
echo Starting Backend Server...
start /d "%~dp0server" "Backend - DPS Meter" cmd /k "node index.js"

REM Give backend time to start
timeout /t 2 /nobreak

REM Start frontend
echo Starting Frontend Server...
cd /d "%~dp0"
npm run dev

pause
