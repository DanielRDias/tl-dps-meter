import React, { useState } from 'react';
import type { SkillHitRate } from '../types/combatLog';
import '../styles/DPSMeter.css';

interface SkillHitRateChartProps {
  data: SkillHitRate[];
}

const SkillHitRateChart: React.FC<SkillHitRateChartProps> = ({ data }) => {
  const [openCasters, setOpenCasters] = useState<Record<string, boolean>>({});

  const toggleCaster = (caster: string) => {
    setOpenCasters(prev => ({ ...prev, [caster]: !prev[caster] }));
  };

  // Group data by caster
  const groupedByCaster = data.reduce((acc, skill) => {
    if (!acc[skill.caster]) {
      acc[skill.caster] = [];
    }
    acc[skill.caster].push(skill);
    return acc;
  }, {} as Record<string, SkillHitRate[]>);

  // Calculate totals for each caster (excluding skills with only normal hits)
  const calculateCasterTotals = (skills: SkillHitRate[]) => {
    // Filter out skills that only have normal hits
    const skillsWithSpecialHits = skills.filter(s => 
      s.criticalHits > 0 || s.heavyHits > 0 || s.heavyCriticalHits > 0
    );

    const totals = skillsWithSpecialHits.reduce((acc, skill) => {
      acc.totalHits += skill.totalHits;
      acc.normalHits += skill.normalHits;
      acc.criticalHits += skill.criticalHits;
      acc.heavyHits += skill.heavyHits;
      acc.heavyCriticalHits += skill.heavyCriticalHits;
      return acc;
    }, { totalHits: 0, normalHits: 0, criticalHits: 0, heavyHits: 0, heavyCriticalHits: 0 });

    return totals;
  };

  const formatHitInfo = (count: number, total: number) => {
    if (total === 0) return '0.0% (0)';
    const percentage = ((count / total) * 100).toFixed(1);
    return `${percentage}% (${count.toLocaleString()})`;
  };

  const casterNames = Object.keys(groupedByCaster).sort();

  return (
    <div style={{ width: '100%', overflowY: 'auto', maxHeight: 800 }}>
      {casterNames.map(caster => {
        const skills = groupedByCaster[caster];
        const totals = calculateCasterTotals(skills);
        const sortedSkills = [...skills].sort((a, b) => b.totalHits - a.totalHits);

        return (
          <div key={caster} style={{ marginBottom: '20px', backgroundColor: '#1a1a1a', borderRadius: '8px', overflow: 'hidden' }}>
            <div 
              style={{ 
                padding: '16px', 
                backgroundColor: '#2a2a2a', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                borderBottom: openCasters[caster] ? '2px solid #444' : 'none'
              }}
              onClick={() => toggleCaster(caster)}
            >
              <button 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: '#fff', 
                  fontSize: '18px',
                  cursor: 'pointer',
                  padding: 0,
                  width: '24px'
                }}
              >
                {openCasters[caster] ? '▾' : '▸'}
              </button>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, color: '#fff', fontSize: '16px' }}>{caster}</h3>
                <div style={{ marginTop: '8px', fontSize: '13px', color: '#d0d0d0', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                  <span>Total Hits: <strong>{totals.totalHits.toLocaleString()}</strong></span>
                  <span>Normal: <strong style={{ color: '#fff' }}>{formatHitInfo(totals.normalHits, totals.totalHits)}</strong></span>
                  <span>Critical: <strong style={{ color: '#ff7f50' }}>{formatHitInfo(totals.criticalHits, totals.totalHits)}</strong></span>
                  <span>Heavy: <strong style={{ color: '#82ca9d' }}>{formatHitInfo(totals.heavyHits, totals.totalHits)}</strong></span>
                  <span>Heavy + Crit: <strong style={{ color: '#ffc658' }}>{formatHitInfo(totals.heavyCriticalHits, totals.totalHits)}</strong></span>
                </div>
              </div>
            </div>

            {openCasters[caster] && (
              <div style={{ padding: '16px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #444' }}>
                      <th style={{ padding: '12px', textAlign: 'left', color: '#fff' }}>Skill</th>
                      <th style={{ padding: '12px', textAlign: 'right', color: '#fff' }}>Total Hits</th>
                      <th style={{ padding: '12px', textAlign: 'right', color: '#fff' }}>Normal</th>
                      <th style={{ padding: '12px', textAlign: 'right', color: '#fff' }}>Critical</th>
                      <th style={{ padding: '12px', textAlign: 'right', color: '#fff' }}>Heavy</th>
                      <th style={{ padding: '12px', textAlign: 'right', color: '#fff' }}>Heavy + Crit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedSkills.map((row, idx) => (
                      <tr key={`${row.caster}:${row.skill}`} style={{ backgroundColor: idx % 2 === 0 ? '#1a1a1a' : '#252525', borderBottom: '1px solid #333' }}>
                        <td style={{ padding: '12px', color: '#fff' }}>{row.skill}</td>
                        <td style={{ padding: '12px', textAlign: 'right', color: '#fff' }}>
                          {row.totalHits.toLocaleString()}
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
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SkillHitRateChart;
