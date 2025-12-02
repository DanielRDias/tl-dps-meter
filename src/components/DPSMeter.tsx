import React, { useState } from 'react';
import { CombatLogParser } from '../utils/logParser';
import type { CombatLogEntry, PlayerStats, PlayerDPSData, SkillDamage, SkillBreakdown, SkillHitRate } from '../types/combatLog';
import DPSChart from './DPSChart';
import StatsTable from './StatsTable';
import FileUpload from './FileUpload';
import SkillChart from './SkillChart';
import SkillBreakdownChart from './SkillBreakdownChart';
import SkillHitRateChart from './SkillHitRateChart';
import '../styles/DPSMeter.css';

const DPSMeter: React.FC = () => {
  const [entries, setEntries] = useState<CombatLogEntry[]>([]);
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([]);
  const [dpsData, setDpsData] = useState<PlayerDPSData[]>([]);
  const [skillDamage, setSkillDamage] = useState<SkillDamage[]>([]);
  const [skillBreakdown, setSkillBreakdown] = useState<SkillBreakdown[]>([]);
  const [skillHitRates, setSkillHitRates] = useState<SkillHitRate[]>([]);
  const [sessions, setSessions] = useState<Array<{ fileName: string; entries: CombatLogEntry[] }>>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  // Handle multiple files uploaded
  const handleFilesUpload = async (files: File[]) => {
    // Read all files in parallel
    const readers = files.map(
      (file) =>
        new Promise<{ fileName: string; content: string }>((resolve, reject) => {
          const r = new FileReader();
          r.onload = (e) => resolve({ fileName: file.name, content: e.target?.result as string });
          r.onerror = (e) => reject(e);
          r.readAsText(file);
        })
    );

    try {
      const results = await Promise.all(readers);

      const fileSessions: Array<{ fileName: string; entries: CombatLogEntry[] }> = [];
      results.forEach(({ fileName: fName, content }) => {
        const parsed = CombatLogParser.parseLog(content);
        fileSessions.push({ fileName: fName, entries: parsed });
        if (parsed.length === 0) {
          console.warn(`No entries parsed from ${fName}`);
          console.debug('First 5 lines of file:', content.split('\n').slice(0, 5));
        }
      });

      // Merge entries from all sessions
      const merged = fileSessions.flatMap((s) => s.entries);

      if (merged.length > 0) {
        setSessions(fileSessions);
        setEntries(merged);
        setPlayerStats(CombatLogParser.getPlayerStats(merged));
        setDpsData(CombatLogParser.calculatePlayerDPS(merged));
        // Aggregate damage by skill/ability
        const skillMap: Record<string, { damage: number; hits: number }> = {};
        merged.forEach((e) => {
          const key = e.action || 'Unknown';
          if (!skillMap[key]) skillMap[key] = { damage: 0, hits: 0 };
          skillMap[key].damage += e.damage || 0;
          skillMap[key].hits += 1;
        });

        const skillArr: SkillDamage[] = Object.keys(skillMap).map((k) => ({
          skill: k,
          damage: skillMap[k].damage,
          hits: skillMap[k].hits,
        }));
        setSkillDamage(skillArr);

        // Compute skill breakdown by hit type
        const breakdownMap: Record<string, { normalHits: number; criticalHits: number; heavyHits: number; heavyCriticalHits: number }> = {};
        merged.forEach((e) => {
          const key = e.action || 'Unknown';
          if (!breakdownMap[key]) {
            breakdownMap[key] = { normalHits: 0, criticalHits: 0, heavyHits: 0, heavyCriticalHits: 0 };
          }
          if (e.isCritical && e.isHeavyHit) {
            breakdownMap[key].heavyCriticalHits += 1;
          } else if (e.isCritical) {
            breakdownMap[key].criticalHits += 1;
          } else if (e.isHeavyHit) {
            breakdownMap[key].heavyHits += 1;
          } else {
            breakdownMap[key].normalHits += 1;
          }
        });

        const breakdownArr: SkillBreakdown[] = Object.keys(breakdownMap).map((k) => ({
          skill: k,
          ...breakdownMap[k],
        }));
        setSkillBreakdown(breakdownArr);

        // Compute hit rates per skill
        const hitRateMap: Record<string, { totalHits: number; criticalHitCount: number; heavyHitCount: number }> = {};
        merged.forEach((e) => {
          const key = e.action || 'Unknown';
          if (!hitRateMap[key]) {
            hitRateMap[key] = { totalHits: 0, criticalHitCount: 0, heavyHitCount: 0 };
          }
          hitRateMap[key].totalHits += 1;
          if (e.isCritical) hitRateMap[key].criticalHitCount += 1;
          if (e.isHeavyHit) hitRateMap[key].heavyHitCount += 1;
        });

        const hitRateArr: SkillHitRate[] = Object.keys(hitRateMap).map((k) => ({
          skill: k,
          totalHits: hitRateMap[k].totalHits,
          criticalHitCount: hitRateMap[k].criticalHitCount,
          heavyHitCount: hitRateMap[k].heavyHitCount,
          criticalHitRate: (hitRateMap[k].criticalHitCount / hitRateMap[k].totalHits) * 100,
          heavyHitRate: (hitRateMap[k].heavyHitCount / hitRateMap[k].totalHits) * 100,
        }));
        setSkillHitRates(hitRateArr);
        setFileName(fileSessions.map(s => s.fileName).join(', '));
        setIsLoaded(true);
      } else {
        const totalLines = results.reduce((acc, r) => acc + r.content.split('\n').length, 0);
        alert(`No combat entries found in the uploaded files.\n\nFiles: ${files.length} | Total lines: ${totalLines}.\nCheck browser console for details.`);
      }
    } catch (err) {
      console.error('Failed to read uploaded files', err);
      alert('Failed to read uploaded files. See console for details.');
    }
  };

  return (
    <div className="dps-meter-container">
      <header className="dps-meter-header">
        <h1>🗡️ Throne and Liberty DPS Meter</h1>
        <p>Upload and analyze combat logs</p>
      </header>

      <FileUpload onFilesUpload={handleFilesUpload} />

      {isLoaded && (
        <div className="meter-content">
          <div className="file-info">
            <span className="file-name">📄 {fileName}</span>
            <span className="entry-count">
              {sessions.length > 0 ? `${sessions.length} file(s) · ` : ''}{entries.length} combat entries | {playerStats.length} players
            </span>
          </div>

          <div className="charts-section">
            <h2>DPS Over Time</h2>
            <DPSChart data={dpsData} />
          </div>

          <div className="charts-section">
            <h2>Damage By Skill</h2>
            <SkillChart data={skillDamage} />
          </div>

          <div className="charts-section">
            <h2>Skill Damage Breakdown by Hit Type</h2>
            <SkillBreakdownChart data={skillBreakdown} />
          </div>

          <div className="charts-section">
            <h2>Critical and Heavy Hit Rates by Skill</h2>
            <SkillHitRateChart data={skillHitRates} />
          </div>

          <div className="stats-section">
            <h2>Player Statistics</h2>
            <StatsTable stats={playerStats} />
          </div>
        </div>
      )}
    </div>
  );
};

export default DPSMeter;
