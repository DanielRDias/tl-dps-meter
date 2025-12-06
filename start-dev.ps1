# DPS Meter - Start Development Servers
# Run with: powershell -ExecutionPolicy Bypass -File start-dev.ps1

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  DPS Meter - Development Server Launcher" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Get script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "📦 Starting Backend Server..." -ForegroundColor Yellow
# Start backend in a new PowerShell window
$backendPath = Join-Path $scriptDir "server\index.js"
Start-Process powershell -ArgumentList "-NoExit -Command cd '$scriptDir\server'; node index.js" -WindowStyle Normal

# Give backend time to start
Start-Sleep -Seconds 2

Write-Host "🚀 Starting Frontend Server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Frontend will open shortly at http://localhost:5173+" -ForegroundColor Green
Write-Host ""

# Start frontend
cd $scriptDir
npm run dev
