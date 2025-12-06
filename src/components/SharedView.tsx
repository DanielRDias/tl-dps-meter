import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { retrieveSharedLog } from '../utils/api';
import type { SharedLogData } from '../utils/api';
import { CombatLogParser } from '../utils/logParser';
import type { CombatLogEntry, PlayerStats } from '../types/combatLog';
import DPSChart from './DPSChart';
import StatsTable from './StatsTable';
import DamageByTarget from './DamageByTarget';
import SkillChart from './SkillChart';
import '../styles/SharedView.css';

interface SharedViewProps {
  shareId: string;
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

const SharedView: React.FC<SharedViewProps> = ({ shareId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sharedData, setSharedData] = useState<SharedLogData | null>(null);
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([]);
  const [dpsChartData, setDpsChartData] = useState<any[]>([]);
  const [skillData, setSkillData] = useState<any[]>([]);
  const [damageByTarget, setDamageByTarget] = useState<DamageByTargetType[]>([]);

  useEffect(() => {
    const fetchSharedLog = async () => {
      try {
        setLoading(true);
        const response = await retrieveSharedLog(shareId);

        if (!response.success) {
          setError('Failed to load shared log');
          return;
        }

        const data = response.data;
        setSharedData(data);

        // Parse and process the log data
        const entries = data.logData as CombatLogEntry[];

        if (entries.length === 0) {
          setError('No combat data in this shared log');
          return;
        }

        // Calculate stats
        const stats = CombatLogParser.getPlayerStats(entries);
        setPlayerStats(stats);

        const dpsData = CombatLogParser.calculatePlayerDPS(entries);
        const chartData = dpsData.map((d) => ({
          playerName: d.playerName,
          dataPoints: d.dataPoints,
          totalDamage: d.totalDamage,
          duration: d.duration,
        }));
        setDpsChartData(chartData);

        // Aggregate damage by skill
        const skillMap: Record<string, { damage: number; hits: number }> = {};
        entries.forEach((e) => {
          const key = e.action || 'Unknown';
          if (!skillMap[key]) skillMap[key] = { damage: 0, hits: 0 };
          skillMap[key].damage += e.damage || 0;
          skillMap[key].hits += 1;
        });

        const skillArr = Object.keys(skillMap)
          .map((k) => ({
            skill: k,
            damage: skillMap[k].damage,
            hits: skillMap[k].hits,
          }))
          .sort((a, b) => b.damage - a.damage);

        setSkillData(skillArr);

        // Build damage-by-target aggregation
        const targetMap: Record<string, Record<string, { totalDamage: number; skills: Record<string, { damage: number; hits: number }> }>> = {};
        entries.forEach((e) => {
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
          casters: Object.keys(targetMap[t])
            .map((c) => ({
              caster: c,
              totalDamage: targetMap[t][c].totalDamage,
              skills: Object.keys(targetMap[t][c].skills)
                .map((s) => ({
                  skill: s,
                  damage: targetMap[t][c].skills[s].damage,
                  hits: targetMap[t][c].skills[s].hits,
                }))
                .sort((a, b) => b.damage - a.damage),
            }))
            .sort((a, b) => b.totalDamage - a.totalDamage),
        }));

        setDamageByTarget(damageByTargetArr);
        setError(null);
      } catch (err) {
        console.error('Error fetching shared log:', err);
        setError(err instanceof Error ? err.message : 'Failed to load shared log');
      } finally {
        setLoading(false);
      }
    };

    fetchSharedLog();
  }, [shareId]);

  if (loading) {
    return (
      <div className="shared-view">
        <div className="loading">Loading shared combat log...</div>
      </div>
    );
  }

  if (error || !sharedData) {
    return (
      <div className="shared-view">
        <div className="error">{error || 'Failed to load shared log'}</div>
      </div>
    );
  }

  return (
    <div className="shared-view">
      <div className="shared-header">
        <div className="shared-header-top">
          <div>
            <h1>🗡️ Combat Log Results</h1>
          </div>
          <div className="shared-header-buttons">
            <Link to="/" style={{ textDecoration: 'none' }}>
              <button className="btn-home">
                📊 Analyze Your Own Logs
              </button>
            </Link>
            <a href="https://buymeacoffee.com/droprate" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <button className="btn-coffee">
                ☕ Buy Me a Coffee
              </button>
            </a>
          </div>
        </div>
        <div className="shared-info">
          <p>
            <strong>Player:</strong> {sharedData.playerName}
          </p>
          <p>
            <strong>Shared:</strong> {new Date(sharedData.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="shared-content">
        <div className="stats-summary">
          <div className="stat-card">
            <div className="stat-label">Total Damage</div>
            <div className="stat-value">{sharedData.totalDamage.toLocaleString()}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">DPS</div>
            <div className="stat-value">{sharedData.damagePerSecond.toFixed(2)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Duration</div>
            <div className="stat-value">{sharedData.duration}s</div>
          </div>
        </div>

        {playerStats.length > 0 && (
          <>
            <div className="chart-section">
              <h2>DPS Over Time</h2>
              <DPSChart data={dpsChartData} />
            </div>

            <div className="chart-section">
              <h2>Player Statistics</h2>
              <StatsTable stats={playerStats} />
            </div>

            {skillData.length > 0 && (
              <div className="chart-section">
                <h2>Damage by Skill</h2>
                <SkillChart data={skillData} />
              </div>
            )}

            {damageByTarget.length > 0 && (
              <div className="chart-section">
                <h2>Damage by Target</h2>
                <DamageByTarget data={damageByTarget} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SharedView;
