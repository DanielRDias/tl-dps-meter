import React from 'react';
import type { SkillHitRate } from '../types/combatLog';
import '../styles/DPSMeter.css';

interface SkillHitRateChartProps {
  data: SkillHitRate[];
}

const SkillHitRateChart: React.FC<SkillHitRateChartProps> = ({ data }) => {
  const sorted = [...data].sort((a, b) => {
    if (a.caster !== b.caster) return a.caster.localeCompare(b.caster);
    return b.totalHits - a.totalHits;
  });

  const formatHitInfo = (count: number, total: number) => {
    const percentage = ((count / total) * 100).toFixed(1);
    return `${percentage}% (${count})`;
  };

  return (
    <div style={{ width: '100%', overflowY: 'auto', maxHeight: 600 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
        <thead>
          <tr style={{ backgroundColor: '#2a2a2a', borderBottom: '2px solid #444' }}>
            <th style={{ padding: '12px', textAlign: 'left', color: '#fff' }}>Caster</th>
            <th style={{ padding: '12px', textAlign: 'left', color: '#fff' }}>Skill</th>
            <th style={{ padding: '12px', textAlign: 'right', color: '#fff' }}>Total Hits</th>
            <th style={{ padding: '12px', textAlign: 'right', color: '#fff' }}>Normal</th>
            <th style={{ padding: '12px', textAlign: 'right', color: '#fff' }}>Critical</th>
            <th style={{ padding: '12px', textAlign: 'right', color: '#fff' }}>Heavy</th>
            <th style={{ padding: '12px', textAlign: 'right', color: '#fff' }}>Heavy + Crit</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, idx) => (
            <tr key={`${row.caster}:${row.skill}`} style={{ backgroundColor: idx % 2 === 0 ? '#1a1a1a' : '#252525', borderBottom: '1px solid #333' }}>
              <td style={{ padding: '12px', color: '#fff' }}>{row.caster}</td>
              <td style={{ padding: '12px', color: '#fff' }}>{row.skill}</td>
              <td style={{ padding: '12px', textAlign: 'right', color: '#fff' }}>
                {row.totalHits}
              </td>
              <td style={{ padding: '12px', textAlign: 'right', color: '#fff' }}>
                {formatHitInfo(row.normalHits, row.totalHits)}
              </td>
              <td style={{ padding: '12px', textAlign: 'right', color: '#ff7f50' }}>
                {formatHitInfo(row.criticalHits, row.totalHits)}
              </td>
              <td style={{ padding: '12px', textAlign: 'right', color: '#82ca9d' }}>
                {formatHitInfo(row.heavyHits, row.totalHits)}
              </td>
              <td style={{ padding: '12px', textAlign: 'right', color: '#ffc658' }}>
                {formatHitInfo(row.heavyCriticalHits, row.totalHits)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SkillHitRateChart;
