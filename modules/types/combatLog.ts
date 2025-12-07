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
  time: number;
  dps: number;
}

export interface PlayerDPSData {
  playerName: string;
  dataPoints: DPSDataPoint[];
  totalDamage: number;
  duration: number;
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
