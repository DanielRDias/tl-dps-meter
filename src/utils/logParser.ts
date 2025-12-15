import type { CombatLogEntry, PlayerStats, PlayerDPSData, DPSDataPoint } from '../types/combatLog';

export class CombatLogParser {
  // Parse the Throne and Liberty combat log CSV format
  static parseLog(fileContent: string): CombatLogEntry[] {
    const entries: CombatLogEntry[] = [];
    const lines = fileContent.split('\n');
    
    lines.forEach((line) => {
      if (!line.trim()) return;
      
      // Skip header lines
      if (line.includes('CombatLogVersion')) return;
      
      // TL CSV Format: Timestamp,EventType,Ability,ID,Damage,IsCrit,IsSpecial,HitType,PlayerName,TargetName
      // Example: 20251202-04:34:24:465,DamageDone,Manaball,948361757,396,1,0,kMaxDamageByCriticalDecision,Gw3nn,Practice Dummy
      const parts = line.split(',');
      
      if (parts.length >= 10 && parts[1].trim() === 'DamageDone') {
        try {
          const timestamp = this.parseTimestamp(parts[0].trim());
          const damage = parseInt(parts[4].trim());
          const isCritical = parseInt(parts[5].trim()) === 1;
          const isHeavyHit = parseInt(parts[6].trim()) === 1;
          const abilityName = parts[2].trim();
          const playerName = parts[8].trim();
          const targetName = parts[9].trim();
          const hitType = parts[7].trim();
          
          // Skip miss hits (damage = 0 and hitType = kMiss)
          if (damage === 0 && hitType === 'kMiss') return;
          
          entries.push({
            timestamp,
            source: playerName,
            action: abilityName,
            target: targetName,
            damage,
            damageType: isCritical ? 'Critical' : 'Normal',
            isCritical,
            isHeavyHit,
          });
        } catch (e) {
          console.debug('Failed to parse line:', line);
        }
      }
    });
    
    console.debug(`Parsed ${entries.length} entries from ${lines.length} total lines`);
    return entries;
  }

  // Parse a chunk of lines (for async processing)
  static parseLogChunk(lines: string[], _startIndex?: number): CombatLogEntry[] {
    const entries: CombatLogEntry[] = [];
    
    lines.forEach((line) => {
      if (!line.trim()) return;
      if (line.includes('CombatLogVersion')) return;
      
      const parts = line.split(',');
      
      if (parts.length >= 10 && parts[1].trim() === 'DamageDone') {
        try {
          const timestamp = this.parseTimestamp(parts[0].trim());
          const damage = parseInt(parts[4].trim());
          const isCritical = parseInt(parts[5].trim()) === 1;
          const isHeavyHit = parseInt(parts[6].trim()) === 1;
          const abilityName = parts[2].trim();
          const playerName = parts[8].trim();
          const targetName = parts[9].trim();
          const hitType = parts[7].trim();
          
          if (damage === 0 && hitType === 'kMiss') return;
          
          entries.push({
            timestamp,
            source: playerName,
            action: abilityName,
            target: targetName,
            damage,
            damageType: isCritical ? 'Critical' : 'Normal',
            isCritical,
            isHeavyHit,
          });
        } catch (e) {
          // Silently skip bad lines in chunks
        }
      }
    });
    
    return entries;
  }

  // Parse TL timestamp format: 20251202-04:34:24:465 -> milliseconds since epoch
  private static parseTimestamp(timestampStr: string): number {
    // Format: YYYYMMDD-HH:MM:SS:mmm
    const [datePart, timePart] = timestampStr.split('-');
    if (!datePart || !timePart) return 0;
    
    // Parse date: YYYYMMDD
    const year = parseInt(datePart.substring(0, 4));
    const month = parseInt(datePart.substring(4, 6)) - 1; // JS months are 0-indexed
    const day = parseInt(datePart.substring(6, 8));
    
    // Parse time: HH:MM:SS:mmm
    const [hours, minutes, seconds, milliseconds] = timePart.split(':').map(x => parseInt(x) || 0);
    
    // Create Date object and return timestamp in seconds (for compatibility with existing code)
    const date = new Date(year, month, day, hours, minutes, seconds, milliseconds);
    return date.getTime() / 1000; // Convert to seconds
  }

  // Calculate DPS for each player
  static calculatePlayerDPS(entries: CombatLogEntry[]): PlayerDPSData[] {
    const playerMap = new Map<string, CombatLogEntry[]>();
    
    // Group entries by source (player)
    entries.forEach(entry => {
      if (!playerMap.has(entry.source)) {
        playerMap.set(entry.source, []);
      }
      playerMap.get(entry.source)!.push(entry);
    });
    
    const dpsDataArray: PlayerDPSData[] = [];
    
    playerMap.forEach((playerEntries, playerName) => {
      const sortedEntries = playerEntries.sort((a, b) => a.timestamp - b.timestamp);
      const startTime = sortedEntries[0].timestamp;
      const endTime = sortedEntries[sortedEntries.length - 1].timestamp;
      const duration = endTime - startTime || 1;
      
      // Use loop instead of reduce to avoid stack overflow
      let totalDamage = 0;
      for (const entry of playerEntries) {
        totalDamage += entry.damage;
      }
      
      const dataPoints: DPSDataPoint[] = [];
      
      // Create data points every second for smooth DPS curve
      let currentTime = startTime;
      while (currentTime <= endTime) {
        // Use loop instead of filter().reduce() to avoid stack overflow
        let damageInWindow = 0;
        for (const e of playerEntries) {
          if (e.timestamp <= currentTime) {
            damageInWindow += e.damage;
          }
        }
        
        const elapsedTime = Math.max(currentTime - startTime, 1);
        dataPoints.push({
          time: currentTime - startTime,
          dps: damageInWindow / elapsedTime,
        });
        
        currentTime += 1;
      }
      
      dpsDataArray.push({
        playerName,
        dataPoints,
        totalDamage,
        duration,
      });
    });
    
    return dpsDataArray;
  }

  // Get summary statistics for all players
  static getPlayerStats(entries: CombatLogEntry[]): PlayerStats[] {
    const playerMap = new Map<string, CombatLogEntry[]>();
    
    entries.forEach(entry => {
      if (!playerMap.has(entry.source)) {
        playerMap.set(entry.source, []);
      }
      playerMap.get(entry.source)!.push(entry);
    });
    
    const stats: PlayerStats[] = [];
    
    playerMap.forEach((playerEntries, playerName) => {
      const sortedEntries = playerEntries.sort((a, b) => a.timestamp - b.timestamp);
      const startTime = sortedEntries[0].timestamp;
      const endTime = sortedEntries[sortedEntries.length - 1].timestamp;
      const duration = endTime - startTime || 1;
      
      // Use loops instead of reduce/spread to avoid stack overflow
      let totalDamage = 0;
      let maxHit = 0;
      for (const e of playerEntries) {
        totalDamage += e.damage;
        if (e.damage > maxHit) maxHit = e.damage;
      }
      
      stats.push({
        name: playerName,
        totalDamage,
        damagePerSecond: totalDamage / duration,
        hitCount: playerEntries.length,
        averageDamage: totalDamage / playerEntries.length,
        maxHit,
        startTime,
        endTime,
      });
    });
    
    return stats.sort((a, b) => b.damagePerSecond - a.damagePerSecond);
  }
}
