export interface CombatLogEntry {
  timestamp: number;
  source: string;
  action: string;
  target: string;
  damage: number;
  damageType: string;
}

export interface PlayerStats {
  name: string;
  totalDamage: number;
  damagePerSecond: number;
  hitCount: number;
  averageDamage: number;
  maxHit: number;
  startTime: number;
  endTime: number;
}

export interface DPSDataPoint {
  time: number;
  dps: number;
}

export interface PlayerDPSData {
  playerName: string;
  dataPoints: DPSDataPoint[];
  totalDamage: number;
  duration: number;
}
