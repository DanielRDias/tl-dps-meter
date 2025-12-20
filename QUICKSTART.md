# Quick Start Guide - Throne and Liberty DPS Meter

## 🚀 Getting Started

### Prerequisites
- Node.js 20.18+ and npm
- A web browser (Chrome, Firefox, Safari, or Edge)

### Installation & Running

```bash
# Navigate to workspace
cd tl-dps-meter

# Install dependencies (already done)
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173/`

## 📊 Using the DPS Meter

### Step 1: Prepare Your Combat Log
Your Throne and Liberty combat log must follow this format:
```
[HH:MM:SS] PlayerName -> TargetName: ActionName Damage (DamageType)
```

Example log entries:
```
[12:34:56] Warrior1 -> Boss: Slash 1500 (Physical)
[12:34:57] Mage1 -> Boss: Fireball 1200 (Magic)
[12:34:58] Archer1 -> Boss: Pierce 800 (Physical)
```

### Step 2: Upload Log File
1. Open the DPS Meter at http://localhost:5173/
2. Either:
   - Click the upload box to browse for a file
   - Drag and drop your `.txt` log file into the box
3. The app automatically parses the file

### Step 3: View Results
Once uploaded, you'll see:

- **DPS Chart**: Interactive line graph showing damage per second over time
- **Statistics Table**: Ranked players with detailed metrics:
  - DPS (Damage Per Second)
  - Total Damage
  - Hit Count
  - Average Damage
  - Maximum Hit
  - Combat Duration

## 🔧 Customizing the Parser

If your log format differs from the default, edit `src/utils/logParser.ts`:

```typescript
// Line ~12
const logPattern = /\[(\d{2}):(\d{2}):(\d{2})\]\s+(.+?)\s+->\s+(.+?):\s+(.+?)\s+(\d+)\s+\((.+?)\)/;
```

Regex groups:
1. Hours (HH)
2. Minutes (MM)
3. Seconds (SS)
4. Source (player name)
5. Target
6. Action
7. Damage (number)
8. Damage type

## 🎨 Customizing Appearance

Edit `src/styles/DPSMeter.css` to change:

```css
:root {
  --primary-color: #FF6B6B;      /* Main red */
  --secondary-color: #4ECDC4;    /* Teal accent */
  --background-dark: #1a1a2e;    /* Dark background */
  --background-light: #16213e;   /* Slightly lighter */
  --text-primary: #eaeaea;       /* Main text */
}
```

## 📦 Building for Production

```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run preview
```

Output files will be in the `dist/` folder.

## 🧪 Testing

### Sample Data
A sample combat log is included at `public/sample-log.txt` with 30 test entries for 3 players.

### Test Steps
1. Start dev server: `npm run dev`
2. Upload the sample log file
3. Verify all 3 players appear in rankings
4. Check chart displays DPS curves for all players

## 🐛 Troubleshooting

### No entries parsed
- Verify log format is CSV with columns: Timestamp,LogType,SkillName,SkillId,DamageAmount,CriticalHit,HeavyHit,DamageType,CasterName,TargetName
- Check timestamps are valid (00:00:00 to 23:59:59)
- Ensure damage values are integers

### Chart not showing
- Confirm at least 2 entries were parsed (need at least 1 second of combat)
- Check browser console (F12 > Console) for errors

### Performance slow with large logs
- Logs with 100,000+ entries may be slow
- Consider splitting into smaller time windows
- Use the browser's Performance tab to debug

## 📚 Project Structure

```
workspace/
├── src/
│   ├── components/
│   │   ├── DPSMeter.tsx        # Main component
│   │   ├── DPSChart.tsx        # Recharts wrapper
│   │   ├── StatsTable.tsx      # Results table
│   │   └── FileUpload.tsx      # Upload handler
│   ├── utils/
│   │   └── logParser.ts        # Parsing logic
│   ├── types/
│   │   └── combatLog.ts        # TypeScript interfaces
│   ├── styles/
│   │   └── DPSMeter.css        # All styles
│   └── App.tsx                 # Root component
├── public/
│   └── sample-log.txt          # Test data
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🔗 Useful Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint (if configured)
```

## 💡 Tips

1. **Multiple files**: Upload multiple logs separately to analyze different combat sessions
2. **Export data**: Statistics can be copied from the table and pasted into Excel
3. **DPS tracking**: Watch the chart to identify damage spikes and patterns
4. **Player ranking**: Table automatically sorts by DPS (descending)

## 📝 Example Workflow

```bash
# 1. Start the app
npm run dev

# 2. Open http://localhost:5173/
# Browser opens automatically or manually visit

# 3. Upload your TL combat log (or use sample-log.txt)

# 4. Analyze results:
#    - Check who dealt the most DPS
#    - Identify damage patterns over time
#    - Review max hits and averages

# 5. Export/share results if needed
```

## 🆘 Need Help?

1. Check the README.md for detailed documentation
2. Review sample-log.txt for correct log format
3. Check browser console (F12) for error messages
4. Verify your Node.js version: `node --version`

---

Enjoy analyzing your Throne and Liberty combat! 🎮⚔️
