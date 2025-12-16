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
import RawLogViewer from './RawLogViewer';
import '../styles/DPSMeter.css';

interface UploadedFile {
  id: string;
  fileName: string;
  entries: CombatLogEntry[];
  rawContent: string;
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
  dps: number;
  duration: number;
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState({ current: 0, total: 0, stage: '' });
  const [zoomTimeRange, setZoomTimeRange] = useState<{ left: number; right: number } | null>(null);

  // Recompute stats whenever uploadedFiles changes
  const recalculateStats = async (files: UploadedFile[], timeRange: { left: number; right: number } | null = null) => {
    setIsProcessing(true);
    let allEntries = files.flatMap(f => f.entries);
    
    // Filter entries by time range if zoom is active
    if (timeRange && allEntries.length > 0) {
      const minTimestamp = Math.min(...allEntries.map(e => e.timestamp));
      const leftTimestamp = minTimestamp + timeRange.left;
      const rightTimestamp = minTimestamp + timeRange.right;
      allEntries = allEntries.filter(e => e.timestamp >= leftTimestamp && e.timestamp <= rightTimestamp);
    }
    
    // Helper to yield to browser
    const yieldToMain = () => new Promise(resolve => setTimeout(resolve, 0));
    const CHUNK_SIZE = 5000;
    
    if (allEntries.length === 0) {
      setPlayerStats([]);
      setDpsData([]);
      setSkillDamage([]);
      setSkillBreakdown([]);
      setSkillHitRates([]);
      setDamageByTarget([]);
      setIsLoaded(false);
      setIsProcessing(false);
      return;
    }

    setProcessingProgress({ current: 1, total: 6, stage: 'Calculating player stats...' });
    setPlayerStats(CombatLogParser.getPlayerStats(allEntries));
    await yieldToMain();
    
    setProcessingProgress({ current: 2, total: 6, stage: 'Calculating DPS...' });
    setDpsData(CombatLogParser.calculatePlayerDPS(allEntries));
    await yieldToMain();

    // Aggregate damage by skill/ability
    setProcessingProgress({ current: 3, total: 6, stage: 'Analyzing skill damage...' });
    const skillMap: Record<string, { damage: number; hits: number }> = {};
    
    for (let i = 0; i < allEntries.length; i += CHUNK_SIZE) {
      const chunk = allEntries.slice(i, i + CHUNK_SIZE);
      chunk.forEach((e) => {
        const key = e.action || 'Unknown';
        if (!skillMap[key]) skillMap[key] = { damage: 0, hits: 0 };
        skillMap[key].damage += e.damage || 0;
        skillMap[key].hits += 1;
      });
      
      if (i % (CHUNK_SIZE * 4) === 0 && i > 0) {
        await yieldToMain();
      }
    }

    const skillArr: SkillDamage[] = Object.keys(skillMap).map((k) => ({
      skill: k,
      damage: skillMap[k].damage,
      hits: skillMap[k].hits,
    }));
    setSkillDamage(skillArr);
    await yieldToMain();

    // Compute skill breakdown by hit type
    setProcessingProgress({ current: 4, total: 6, stage: 'Processing skill breakdown...' });
    const breakdownMap: Record<string, { normalHits: number; criticalHits: number; heavyHits: number; heavyCriticalHits: number }> = {};
    
    for (let i = 0; i < allEntries.length; i += CHUNK_SIZE) {
      const chunk = allEntries.slice(i, i + CHUNK_SIZE);
      chunk.forEach((e) => {
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
      
      if (i % (CHUNK_SIZE * 4) === 0 && i > 0) {
        await yieldToMain();
      }
    }

    const breakdownArr: SkillBreakdown[] = Object.keys(breakdownMap).map((k) => ({
      skill: k,
      ...breakdownMap[k],
    }));
    setSkillBreakdown(breakdownArr);
    await yieldToMain();

    // Compute hit rates per skill and caster
    setProcessingProgress({ current: 5, total: 6, stage: 'Calculating hit rates...' });
    const hitRateMap: Record<string, { caster: string; skill: string; totalHits: number; normalHits: number; criticalHits: number; heavyHits: number; heavyCriticalHits: number }> = {};
    
    for (let i = 0; i < allEntries.length; i += CHUNK_SIZE) {
      const chunk = allEntries.slice(i, i + CHUNK_SIZE);
      chunk.forEach((e) => {
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
      
      if (i % (CHUNK_SIZE * 4) === 0 && i > 0) {
        await yieldToMain();
      }
    }

    const hitRateArr: SkillHitRate[] = Object.keys(hitRateMap).map((k) => hitRateMap[k]);
    setSkillHitRates(hitRateArr);
    await yieldToMain();
    
    // Build damage-by-target aggregation: target -> caster -> skills
    setProcessingProgress({ current: 6, total: 6, stage: 'Analyzing damage by target...' });
    const targetMap: Record<string, Record<string, { totalDamage: number; skills: Record<string, { damage: number; hits: number }>; start: number; end: number }>> = {};
    
    for (let i = 0; i < allEntries.length; i += CHUNK_SIZE) {
      const chunk = allEntries.slice(i, i + CHUNK_SIZE);
      chunk.forEach((e) => {
        const target = e.target || 'Unknown';
        const caster = e.source || 'Unknown';
        const skill = e.action || 'Unknown';
        if (!targetMap[target]) targetMap[target] = {};
        if (!targetMap[target][caster]) {
          targetMap[target][caster] = {
            totalDamage: 0,
            skills: {},
            start: e.timestamp,
            end: e.timestamp,
          };
        }

        const bucket = targetMap[target][caster];
        bucket.totalDamage += e.damage || 0;
        bucket.start = Math.min(bucket.start, e.timestamp);
        bucket.end = Math.max(bucket.end, e.timestamp);

        if (!bucket.skills[skill]) bucket.skills[skill] = { damage: 0, hits: 0 };
        bucket.skills[skill].damage += e.damage || 0;
        bucket.skills[skill].hits += 1;
      });
      
      if (i % (CHUNK_SIZE * 4) === 0 && i > 0) {
        await yieldToMain();
      }
    }

    const damageByTargetArr: DamageByTargetType[] = Object.keys(targetMap).map((t) => ({
      target: t,
      casters: Object.keys(targetMap[t]).map((c) => ({
        caster: c,
        totalDamage: targetMap[t][c].totalDamage,
        duration: Math.max(targetMap[t][c].end - targetMap[t][c].start, 1),
        dps: targetMap[t][c].totalDamage / Math.max(targetMap[t][c].end - targetMap[t][c].start, 1),
        skills: Object.keys(targetMap[t][c].skills).map((s) => ({
          skill: s,
          damage: targetMap[t][c].skills[s].damage,
          hits: targetMap[t][c].skills[s].hits,
        })).sort((a, b) => b.damage - a.damage),
      })).sort((a, b) => b.totalDamage - a.totalDamage),
    }));
    setDamageByTarget(damageByTargetArr);
    setIsLoaded(true);
    setIsProcessing(false);
  };
  // Handle multiple files uploaded - accumulate logs
  const handleFilesUpload = async (files: File[]) => {
    setIsProcessing(true);
    const newUploadedFiles: UploadedFile[] = [];
    let totalLines = 0;

    try {
      // Read files sequentially to avoid memory spikes
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProcessingProgress({ 
          current: i + 1, 
          total: files.length + 1, 
          stage: `Reading ${file.name}...` 
        });

        const content = await new Promise<string>((resolve, reject) => {
          const r = new FileReader();
          r.onload = (e) => resolve(e.target?.result as string);
          r.onerror = (e) => reject(e);
          r.readAsText(file);
        });

        totalLines += content.split('\n').length;
        const parsed = CombatLogParser.parseLog(content);
        if (parsed.length > 0) {
          newUploadedFiles.push({
            id: `${file.name}-${Date.now()}-${Math.random()}`,
            fileName: file.name,
            entries: parsed,
            rawContent: content,
            uploadedAt: new Date(),
          });
        } else {
          console.warn(`No entries parsed from ${file.name}`);
          console.debug('First 5 lines of file:', content.split('\n').slice(0, 5));
        }
      }

      if (newUploadedFiles.length > 0) {
        // Accumulate files instead of replacing
        const updatedFiles = [...uploadedFiles, ...newUploadedFiles];
        setUploadedFiles(updatedFiles);
        await recalculateStats(updatedFiles, zoomTimeRange);
      } else {
        setIsProcessing(false);
        alert(`No combat entries found in the uploaded files.\n\nFiles: ${files.length} | Total lines: ${totalLines}.\nCheck browser console for details.`);
      }
    } catch (err) {
      console.error('Failed to read uploaded files', err);
      setIsProcessing(false);
      alert('Failed to read uploaded files. See console for details.');
    }
  };

  // Remove a file from the list
  const handleRemoveFile = (fileId: string) => {
    const updated = uploadedFiles.filter(f => f.id !== fileId);
    setUploadedFiles(updated);
    recalculateStats(updated, zoomTimeRange);
  };

  // Clear all files
  const handleClearAll = () => {
    if (uploadedFiles.length === 0) return;
    if (window.confirm('Are you sure you want to clear all uploaded files?')) {
      setUploadedFiles([]);
      setZoomTimeRange(null);
      recalculateStats([]);
    }
  };

  return (
    <div className="dps-meter-container">

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
                  {uploadedFiles.map((file) => {
                    // Get first 4 lines (skip first line, show next 3)
                    const lines = file.rawContent.split('\n');
                    const previewLines = lines.slice(1, 4).filter(line => line.trim());
                    
                    return (
                      <li key={file.id} className="file-item">
                        <div className="file-item-info">
                          <button
                            className="btn-remove-inline"
                            onClick={() => handleRemoveFile(file.id)}
                            title="Remove this file"
                          >
                            🗑️
                          </button>
                          <span className="file-name">📄 {file.fileName}</span>
                          <span className="file-entries">({file.entries.length} entries)</span>
                          <span className="file-time">
                            {file.uploadedAt.toLocaleTimeString()}
                          </span>
                        </div>
                        {previewLines.length > 0 && (
                          <div className="file-preview">
                            {previewLines.map((line, idx) => (
                              <div key={idx} className="preview-line">{line}</div>
                            ))}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          <div className="charts-section">
            <h2>DPS Over Time</h2>
            <DPSChart 
              data={dpsData} 
              onZoomChange={async (range) => {
                setZoomTimeRange(range);
                await recalculateStats(uploadedFiles, range);
              }}
            />
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

          <div className="charts-section">
            <RawLogViewer files={uploadedFiles} />
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="processing-overlay">
          <div className="processing-modal">
            <div className="processing-spinner"></div>
            <h3>Processing Combat Logs</h3>
            <p className="processing-stage">{processingProgress.stage}</p>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${processingProgress.total > 0 ? (processingProgress.current / processingProgress.total) * 100 : 0}%` }}
              />
            </div>
            <p className="processing-count">{processingProgress.current} / {processingProgress.total}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DPSMeter;
