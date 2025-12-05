import React, { useState } from 'react';
import { CombatLogParser } from '../utils/logParser';
import type { CombatLogEntry, PlayerStats, PlayerDPSData, SkillDamage, SkillBreakdown, SkillHitRate } from '../types/combatLog';
import DPSChart from './DPSChart';
import StatsTable from './StatsTable';
import FileUpload from './FileUpload';
import SkillChart from './SkillChart';
import SkillBreakdownChart from './SkillBreakdownChart';
import SkillHitRateChart from './SkillHitRateChart';
import DamageByTarget from './DamageByTarget';
import '../styles/DPSMeter.css';

interface UploadedFile {
  id: string;
  fileName: string;
  entries: CombatLogEntry[];
  uploadedAt: Date;
}

interface DamageByTargetSkill {
  skill: string;
  damage: number;
  hits: number;
}

interface DamageByCaster {
  caster: string;
  totalDamage: number;
  skills: DamageByTargetSkill[];
}

interface DamageByTargetType {
  target: string;
  casters: DamageByCaster[];
}

const DPSMeter: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([]);
  const [dpsData, setDpsData] = useState<PlayerDPSData[]>([]);
  const [skillDamage, setSkillDamage] = useState<SkillDamage[]>([]);
  const [skillBreakdown, setSkillBreakdown] = useState<SkillBreakdown[]>([]);
  const [skillHitRates, setSkillHitRates] = useState<SkillHitRate[]>([]);
  const [damageByTarget, setDamageByTarget] = useState<DamageByTargetType[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Recompute stats whenever uploadedFiles changes
  const recalculateStats = (files: UploadedFile[]) => {
    const allEntries = files.flatMap(f => f.entries);
    
    if (allEntries.length === 0) {
      setPlayerStats([]);
      setDpsData([]);
      setSkillDamage([]);
      setSkillBreakdown([]);
      setSkillHitRates([]);
      setIsLoaded(false);
      return;
    }

    setPlayerStats(CombatLogParser.getPlayerStats(allEntries));
    setDpsData(CombatLogParser.calculatePlayerDPS(allEntries));

    // Aggregate damage by skill/ability
    const skillMap: Record<string, { damage: number; hits: number }> = {};
    allEntries.forEach((e) => {
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
    allEntries.forEach((e) => {
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

    // Compute hit rates per skill and caster
    const hitRateMap: Record<string, { caster: string; skill: string; totalHits: number; normalHits: number; criticalHits: number; heavyHits: number; heavyCriticalHits: number }> = {};
    allEntries.forEach((e) => {
      const caster = e.source || 'Unknown';
      const skill = e.action || 'Unknown';
      const key = `${caster}:${skill}`;
      if (!hitRateMap[key]) {
        hitRateMap[key] = { caster, skill, totalHits: 0, normalHits: 0, criticalHits: 0, heavyHits: 0, heavyCriticalHits: 0 };
      }
      hitRateMap[key].totalHits += 1;
      if (e.isCritical && e.isHeavyHit) {
        hitRateMap[key].heavyCriticalHits += 1;
        hitRateMap[key].criticalHits += 1;
        hitRateMap[key].heavyHits += 1;
      } else if (e.isCritical) {
        hitRateMap[key].criticalHits += 1;
      } else if (e.isHeavyHit) {
        hitRateMap[key].heavyHits += 1;
      } else {
        hitRateMap[key].normalHits += 1;
      }
    });

    const hitRateArr: SkillHitRate[] = Object.keys(hitRateMap).map((k) => hitRateMap[k]);
    setSkillHitRates(hitRateArr);
    
    // Build damage-by-target aggregation: target -> caster -> skills
    const targetMap: Record<string, Record<string, { totalDamage: number; skills: Record<string, { damage: number; hits: number }> }>> = {};
    allEntries.forEach((e) => {
      const target = e.target || 'Unknown';
      const caster = e.source || 'Unknown';
      const skill = e.action || 'Unknown';
      if (!targetMap[target]) targetMap[target] = {};
      if (!targetMap[target][caster]) targetMap[target][caster] = { totalDamage: 0, skills: {} };
      targetMap[target][caster].totalDamage += e.damage || 0;
      if (!targetMap[target][caster].skills[skill]) targetMap[target][caster].skills[skill] = { damage: 0, hits: 0 };
      targetMap[target][caster].skills[skill].damage += e.damage || 0;
      targetMap[target][caster].skills[skill].hits += 1;
    });

    const damageByTargetArr: DamageByTargetType[] = Object.keys(targetMap).map((t) => ({
      target: t,
      casters: Object.keys(targetMap[t]).map((c) => ({
        caster: c,
        totalDamage: targetMap[t][c].totalDamage,
        skills: Object.keys(targetMap[t][c].skills).map((s) => ({
          skill: s,
          damage: targetMap[t][c].skills[s].damage,
          hits: targetMap[t][c].skills[s].hits,
        })).sort((a, b) => b.damage - a.damage),
      })).sort((a, b) => b.totalDamage - a.totalDamage),
    }));
    setDamageByTarget(damageByTargetArr);
    setIsLoaded(true);
  };
  // Handle multiple files uploaded - accumulate logs
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
      const newUploadedFiles: UploadedFile[] = [];

      results.forEach(({ fileName: fName, content }) => {
        const parsed = CombatLogParser.parseLog(content);
        if (parsed.length > 0) {
          newUploadedFiles.push({
            id: `${fName}-${Date.now()}-${Math.random()}`,
            fileName: fName,
            entries: parsed,
            uploadedAt: new Date(),
          });
        } else {
          console.warn(`No entries parsed from ${fName}`);
          console.debug('First 5 lines of file:', content.split('\n').slice(0, 5));
        }
      });

      if (newUploadedFiles.length > 0) {
        // Accumulate files instead of replacing
        const updatedFiles = [...uploadedFiles, ...newUploadedFiles];
        setUploadedFiles(updatedFiles);
        recalculateStats(updatedFiles);
      } else {
        const totalLines = results.reduce((acc, r) => acc + r.content.split('\n').length, 0);
        alert(`No combat entries found in the uploaded files.\n\nFiles: ${files.length} | Total lines: ${totalLines}.\nCheck browser console for details.`);
      }
    } catch (err) {
      console.error('Failed to read uploaded files', err);
      alert('Failed to read uploaded files. See console for details.');
    }
  };

  // Remove a file from the list
  const handleRemoveFile = (fileId: string) => {
    const updated = uploadedFiles.filter(f => f.id !== fileId);
    setUploadedFiles(updated);
    recalculateStats(updated);
  };

  // Clear all files
  const handleClearAll = () => {
    if (uploadedFiles.length === 0) return;
    if (window.confirm('Are you sure you want to clear all uploaded files?')) {
      setUploadedFiles([]);
      recalculateStats([]);
    }
  };

  return (
    <div className="dps-meter-container">
      <header className="dps-meter-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div>
            <h1>🗡️ Throne and Liberty DPS Meter</h1>
            <p>Upload and analyze combat logs</p>
          </div>
          <a href="https://buymeacoffee.com/droprate" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
            <button style={{ padding: '10px 16px', background: '#FFDD00', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold', color: '#000' }}>
              ☕ Buy Me a Coffee
            </button>
          </a>
        </div>
      </header>

      <FileUpload onFilesUpload={handleFilesUpload} />

      {!isLoaded && (
        <div style={{ width: '100%', maxWidth: 1200, margin: '20px auto', aspectRatio: '16 / 9' }}>
          <iframe
            width="100%"
            height="100%"
            src="https://www.youtube.com/embed/xwcH8_fV97k"
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            style={{ borderRadius: 8, border: 'none' }}
          />
        </div>
      )}

      {isLoaded && (
        <div className="meter-content">
          <div className="file-info">
            <div className="file-info-header">
              <div className="file-summary">
                <span className="entry-count">
                  📊 {uploadedFiles.length} file(s) · {uploadedFiles.reduce((sum, f) => sum + f.entries.length, 0)} combat entries | {playerStats.length} players
                </span>
              </div>
              {uploadedFiles.length > 0 && (
                <button className="btn-clear-all" onClick={handleClearAll}>
                  Clear All
                </button>
              )}
            </div>
            
            {uploadedFiles.length > 0 && (
              <div className="uploaded-files-list">
                <h3>Uploaded Files:</h3>
                <ul>
                  {uploadedFiles.map((file) => (
                    <li key={file.id} className="file-item">
                      <div className="file-item-info">
                        <span className="file-name">📄 {file.fileName}</span>
                        <span className="file-entries">({file.entries.length} entries)</span>
                        <span className="file-time">
                          {file.uploadedAt.toLocaleTimeString()}
                        </span>
                      </div>
                      <button
                        className="btn-remove"
                        onClick={() => handleRemoveFile(file.id)}
                        title="Remove this file"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
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
            <h2>Damage To Targets</h2>
            <DamageByTarget data={damageByTarget} />
          </div>

          <div className="charts-section">
            <h2>Skill Hits Breakdown by Hit Type</h2>
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
