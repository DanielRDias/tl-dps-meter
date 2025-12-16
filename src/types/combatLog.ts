export interface CombatLogEntry {
  timestamp: number;
  source: string;
  action: string;
  target: string;
  damage: number;
  damageType: string;
  isCritical: boolean;
  isHeavyHit: boolean;
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
  time: number; // Relative time in seconds from start
  actualTime: number; // Actual timestamp in seconds since epoch
  dps: number; // Cumulative average DPS
  instantDps: number; // DPS at this specific second
  target?: string; // Current target at this time point (if changed and hit for >1s)
}

export interface TargetChange {
  time: number; // Relative time when target changed
  target: string; // New target name
}

export interface PlayerDPSData {
  playerName: string;
  dataPoints: DPSDataPoint[];
  totalDamage: number;
  duration: number;
  targetChanges: TargetChange[]; // Points where target changed (>1s duration)
}

export interface SkillDamage {
  skill: string;
  damage: number;
  hits: number;
}

export interface SkillBreakdown {
  skill: string;
  normalHits: number;
  criticalHits: number;
  heavyCriticalHits: number;
  heavyHits: number;
}

export interface SkillHitRate {
  caster: string;
  skill: string;
  totalHits: number;
  normalHits: number;
  criticalHits: number;
  heavyHits: number;
  heavyCriticalHits: number;
}
