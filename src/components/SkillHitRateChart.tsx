import React from 'react';
import type { SkillHitRate } from '../types/combatLog';
import '../styles/DPSMeter.css';

interface SkillHitRateChartProps {
  data: SkillHitRate[];
}

const SkillHitRateChart: React.FC<SkillHitRateChartProps> = ({ data }) => {
  const sorted = [...data].sort((a, b) => b.totalHits - a.totalHits);

  return (
    <div style={{ width: '100%', overflowY: 'auto', maxHeight: 600 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
        <thead>
          <tr style={{ backgroundColor: '#2a2a2a', borderBottom: '2px solid #444' }}>
            <th style={{ padding: '12px', textAlign: 'left', color: '#fff' }}>Skill</th>
            <th style={{ padding: '12px', textAlign: 'right', color: '#fff' }}>Normal Hits</th>
            <th style={{ padding: '12px', textAlign: 'right', color: '#fff' }}>Critical Hits</th>
            <th style={{ padding: '12px', textAlign: 'right', color: '#fff' }}>Heavy Hits</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((skill, idx) => {
            const normalHitRate = 100 - (skill.criticalHitRate + skill.heavyHitRate);
            return (
              <tr key={skill.skill} style={{ backgroundColor: idx % 2 === 0 ? '#1a1a1a' : '#252525', borderBottom: '1px solid #333' }}>
                <td style={{ padding: '12px', color: '#fff' }}>{skill.skill}</td>
                <td style={{ padding: '12px', textAlign: 'right', color: '#fff' }}>
                  {normalHitRate.toFixed(1)}%
                </td>
                <td style={{ padding: '12px', textAlign: 'right', color: '#ff7f50' }}>
                  {skill.criticalHitRate.toFixed(1)}%
                </td>
                <td style={{ padding: '12px', textAlign: 'right', color: '#82ca9d' }}>
                  {skill.heavyHitRate.toFixed(1)}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default SkillHitRateChart;
