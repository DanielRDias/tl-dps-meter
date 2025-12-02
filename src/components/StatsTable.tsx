import React from 'react';
import type { PlayerStats } from '../types/combatLog';

interface StatsTableProps {
  stats: PlayerStats[];
}

const StatsTable: React.FC<StatsTableProps> = ({ stats }) => {
  if (stats.length === 0) {
    return <div className="empty-state">No player statistics available</div>;
  }

  return (
    <div className="stats-table-wrapper">
      <table className="stats-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Player Name</th>
            <th>DPS</th>
            <th>Total Damage</th>
            <th>Hit Count</th>
            <th>Avg Hit</th>
            <th>Max Hit</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((stat, index) => (
            <tr key={stat.name} className={index === 0 ? 'rank-1' : ''}>
              <td className="rank-cell">
                <span className={`rank-badge rank-${index + 1}`}>#{index + 1}</span>
              </td>
              <td className="player-name">{stat.name}</td>
              <td className="dps-value">
                <strong>{stat.damagePerSecond.toFixed(2)}</strong>
              </td>
              <td className="damage-value">{stat.totalDamage.toLocaleString()}</td>
              <td className="hit-count">{stat.hitCount}</td>
              <td className="avg-damage">{stat.averageDamage.toFixed(0)}</td>
              <td className="max-damage">
                <span className="max-badge">{stat.maxHit.toLocaleString()}</span>
              </td>
              <td className="duration">{stat.endTime - stat.startTime}s</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StatsTable;
