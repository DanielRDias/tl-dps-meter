# API Documentation - DPS Meter Components

This document describes the public APIs for extending the DPS Meter application.

## TypeScript Types

### CombatLogEntry
Individual combat action entry parsed from the log file.

```typescript
interface CombatLogEntry {
  timestamp: number;      // Seconds since start of combat
  source: string;         // Player/attacker name
  action: string;         // Type of action (Attack, Spell, etc)
  target: string;         // Target name (usually boss)
  damage: number;         // Damage dealt
  damageType: string;     // Damage type (Physical, Magic, etc)
}
```

### PlayerStats
Summary statistics for a single player.

```typescript
interface PlayerStats {
  name: string;
  totalDamage: number;      // Total damage dealt
  damagePerSecond: number;  // Average DPS
  hitCount: number;         // Number of attacks
  averageDamage: number;    // Damage per attack
  maxHit: number;           // Highest single hit
  startTime: number;        // Combat start time (seconds)
  endTime: number;          // Combat end time (seconds)
}
```

### PlayerDPSData
DPS progression data for charting.

```typescript
interface PlayerDPSData {
  playerName: string;
  dataPoints: DPSDataPoint[];  // Time-series DPS values
  totalDamage: number;
  duration: number;            // Combat duration in seconds
}
```

### DPSDataPoint
Single point in DPS time-series data.

```typescript
interface DPSDataPoint {
  time: number;    // Seconds elapsed in combat
  dps: number;     // Current DPS at this time
}
```

## CombatLogParser Class

Main parsing and calculation engine.

### Methods

#### `parseLog(fileContent: string): CombatLogEntry[]`
Parses raw log file content into structured entries.

**Parameters:**
- `fileContent` - Raw text content from combat log file

**Returns:** Array of parsed combat entries

**Example:**
```typescript
const content = fs.readFileSync('combat.log', 'utf-8');
const entries = CombatLogParser.parseLog(content);
```

#### `calculatePlayerDPS(entries: CombatLogEntry[]): PlayerDPSData[]`
Calculates per-second DPS progression for all players.

**Parameters:**
- `entries` - Parsed combat log entries

**Returns:** Array of player DPS time-series data

**Example:**
```typescript
const dpsData = CombatLogParser.calculatePlayerDPS(entries);
dpsData.forEach(player => {
  console.log(`${player.playerName}: ${player.totalDamage} total`);
});
```

#### `getPlayerStats(entries: CombatLogEntry[]): PlayerStats[]`
Generates summary statistics for all players (sorted by DPS).

**Parameters:**
- `entries` - Parsed combat log entries

**Returns:** Array of player statistics, sorted by DPS descending

**Example:**
```typescript
const stats = CombatLogParser.getPlayerStats(entries);
// First element is highest DPS player
console.log(`Top DPS: ${stats[0].name} (${stats[0].damagePerSecond.toFixed(2)} DPS)`);
```

## Component APIs

### DPSMeter (Main Component)
Root component managing file upload and state.

**Props:** None

**State:**
- `entries`: Parsed combat log entries
- `playerStats`: Calculated player statistics
- `dpsData`: DPS progression data
- `isLoaded`: Boolean indicating successful file upload
- `fileName`: Uploaded file name

**Methods:**
- `handleFileUpload(file: File)`: Process uploaded file

### DPSChart (Chart Component)
Displays interactive DPS progression chart.

**Props:**
```typescript
interface DPSChartProps {
  data: PlayerDPSData[];  // DPS data for all players
}
```

**Features:**
- Interactive line chart with Recharts
- Customizable colors per player
- Hover tooltips with exact values
- Legend showing all players

### StatsTable (Statistics Component)
Displays ranked player statistics.

**Props:**
```typescript
interface StatsTableProps {
  stats: PlayerStats[];  // Player statistics
}
```

**Features:**
- Rank badge (Gold/Silver/Bronze for top 3)
- DPS highlighted in red
- Max hit in badge format
- Sortable data

### FileUpload (Upload Component)
Handles file selection and drag-drop.

**Props:**
```typescript
interface FileUploadProps {
  onFileUpload: (file: File) => void;  // Callback on file selected
}
```

**Features:**
- Drag-and-drop support
- Click to browse
- File type validation (.txt only)

## Extending the Parser

### Custom Log Format

To support a different log format, modify the regex in `src/utils/logParser.ts`:

```typescript
// Current pattern
const logPattern = /\[(\d{2}):(\d{2}):(\d{2})\]\s+(.+?)\s+->\s+(.+?):\s+(.+?)\s+(\d+)\s+\((.+?)\)/;

// Regex groups:
// 1. Hours
// 2. Minutes  
// 3. Seconds
// 4. Source (player)
// 5. Target
// 6. Action
// 7. Damage (must be number)
// 8. Damage type
```

### Adding New Statistics

To add a new statistic metric, extend `PlayerStats`:

```typescript
interface PlayerStats {
  // ... existing fields
  criticalHits?: number;
  missCount?: number;
}
```

Then update `getPlayerStats()` to calculate the new fields.

### Custom Chart

To use a different chart library:

1. Replace Recharts imports in `DPSChart.tsx`
2. Transform data using existing `PlayerDPSData` format
3. Maintain same component interface for compatibility

## Error Handling

### Parse Errors
The parser silently ignores lines that don't match the regex pattern. Add logging to debug:

```typescript
// In logParser.ts parseLog method
if (!match) {
  console.warn(`Failed to parse: ${line}`);
}
```

### Empty Results
If no entries are parsed, `handleFileUpload()` shows an alert:
```
"No combat entries found in the log file. Please check the format."
```

## Performance Considerations

- **Parse time:** O(n) where n = number of log lines
- **DPS calculation:** O(n × m) where m = combat duration in seconds
- **Chart rendering:** Limited by Recharts (handles 1000s of data points)

### Optimization Tips

For large logs (100k+ entries):
1. Reduce chart resolution (sample every Nth second)
2. Pre-calculate summary statistics
3. Use React.memo() for chart components
4. Consider virtualization for table rows

## Testing

### Unit Test Example

```typescript
import { CombatLogParser } from './logParser';

const testLog = `[00:00:01] Player1 -> Boss: Attack 100 (Physical)
[00:00:02] Player1 -> Boss: Attack 150 (Physical)`;

const entries = CombatLogParser.parseLog(testLog);
console.assert(entries.length === 2, 'Should parse 2 entries');
console.assert(entries[0].damage === 100, 'First damage should be 100');

const stats = CombatLogParser.getPlayerStats(entries);
console.assert(stats[0].totalDamage === 250, 'Total should be 250');
```

## Future API Expansions

Planned features and their potential APIs:

### Export
```typescript
interface ExportOptions {
  format: 'csv' | 'json';
  includeChart?: boolean;
}

export function exportStats(stats: PlayerStats[], options: ExportOptions): string
```

### Real-time Streaming
```typescript
interface StreamOptions {
  logFile: string;
  onNewEntry: (entry: CombatLogEntry) => void;
  pollInterval: number;  // ms
}

export function streamCombatLog(options: StreamOptions): void
```

### Multi-file Comparison
```typescript
interface ComparisonResult {
  sessions: PlayerStats[][];
  improvementPercent: number[];
}

export function compareLogs(logs: string[]): ComparisonResult
```

---

For questions or contribution ideas, please refer to the project README.md
