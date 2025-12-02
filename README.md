# Throne and Liberty DPS Meter

An interactive React application for parsing and analyzing Throne and Liberty combat logs. Upload your combat log files and get real-time DPS statistics with interactive charts.

## Features

- **Combat Log Parser**: Automatically parses TL combat log files in the format: `[HH:MM:SS] Source -> Target: Action Damage (Type)`
- **Interactive DPS Charts**: Real-time visualization of DPS over time for all players
- **Player Statistics**: Detailed statistics including:
  - DPS (Damage Per Second)
  - Total Damage
  - Hit Count
  - Average Damage per Hit
  - Maximum Hit
  - Combat Duration

- **Drag & Drop Upload**: Easily upload combat log files with drag and drop or click to browse
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Dark Theme**: Eye-friendly dark UI optimized for gaming

## Getting Started

### Prerequisites

- Node.js 18+ (works with 20.18.0)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd workspace
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

### Uploading Combat Logs

1. Click the upload area or drag and drop a combat log file
2. The app accepts `.txt` files from Throne and Liberty
3. The parser will automatically extract:
   - Player names
   - Damage amounts
   - Damage types
   - Timestamps

### Viewing Results

After uploading a log file, you'll see:

1. **DPS Chart**: Line graph showing DPS progression for each player over time
2. **Statistics Table**: Ranked table with detailed stats for each player
3. **File Information**: Total entries and number of players in the log

## Combat Log Format

The parser expects logs in the following format:

```
[HH:MM:SS] SourceName -> TargetName: ActionName DamageNumber (DamageType)
```

Example:
```
[12:34:56] Player1 -> Boss: Attack 1500 (Physical)
[12:34:57] Player2 -> Boss: Spell 1200 (Magic)
[12:34:58] Player3 -> Boss: Skill 800 (Special)
```

## Technologies Used

- **React 18** - UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool
- **Recharts** - Interactive charts
- **CSS3** - Styling

## Project Structure

```
src/
├── components/
│   ├── DPSMeter.tsx      - Main meter component
│   ├── DPSChart.tsx      - Chart visualization
│   ├── StatsTable.tsx    - Statistics table
│   └── FileUpload.tsx    - File upload handler
├── utils/
│   └── logParser.ts      - Combat log parser logic
├── types/
│   └── combatLog.ts      - TypeScript type definitions
├── styles/
│   └── DPSMeter.css      - Application styles
└── App.tsx               - Main app component
```

## Available Scripts

### Development
```bash
npm run dev
```
Runs the app in development mode with hot reload.

### Build
```bash
npm run build
```
Builds the app for production to the `dist` folder.

### Preview
```bash
npm run preview
```
Previews the production build locally.

## Customization

### Adding New Damage Types

Edit the color array in `src/components/DPSChart.tsx`:
```typescript
const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', // ... more colors
];
```

### Modifying Parser Logic

Update the regex pattern in `src/utils/logParser.ts` to match your log format:
```typescript
const logPattern = /\[(\d{2}):(\d{2}):(\d{2})\]\s+(.+?)\s+->\s+(.+?):\s+(.+?)\s+(\d+)\s+\((.+?)\)/;
```

### Styling

All styles are in `src/styles/DPSMeter.css`. Customize colors using CSS variables:
```css
:root {
  --primary-color: #FF6B6B;
  --secondary-color: #4ECDC4;
  /* ... more variables ... */
}
```

## Performance Optimization

The app handles large combat logs efficiently:
- Parses entries in O(n) time
- Generates DPS data points incrementally
- Lazy renders chart data
- Responsive UI updates

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Future Enhancements

- [ ] Export statistics as CSV/JSON
- [ ] Multi-file comparison
- [ ] Damage type breakdown charts
- [ ] Session recording and playback
- [ ] Real-time log streaming
- [ ] Raid/Guild statistics

## Troubleshooting

### No entries found in log file

Ensure your combat log matches the expected format:
```
[HH:MM:SS] PlayerName -> TargetName: ActionName Damage (Type)
```

### Charts not displaying

Check that at least one combat entry was successfully parsed. Look at the file info section to verify entry count.

### Performance issues with large files

For logs with 100,000+ entries, consider:
- Using the preview feature
- Splitting logs into smaller time windows
- Closing other applications

## License

MIT License - See LICENSE file for details

## Support

For issues and feature requests, please create an issue on GitHub.

## Credits

Built with React, TypeScript, and Recharts for the Throne and Liberty community.
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
