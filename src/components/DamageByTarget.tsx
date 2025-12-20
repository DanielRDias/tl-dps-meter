import React, { useState } from 'react';
import { getSkillIconPath } from '../utils/skillIcons';

interface SkillRow {
  skill: string;
  damage: number;
  hits: number;
}

interface CasterRow {
  caster: string;
  totalDamage: number;
  dps: number;
  duration: number;
  skills: SkillRow[];
}

interface TargetBlock {
  target: string;
  casters: CasterRow[];
}

interface Props {
  data: TargetBlock[];
}

const DamageByTarget: React.FC<Props> = ({ data }) => {
  const [openTargets, setOpenTargets] = useState<Record<string, boolean>>({});

  const toggleTarget = (t: string) => {
    setOpenTargets((s) => ({ ...s, [t]: !s[t] }));
  };

  if (!data || data.length === 0) {
    return <div className="empty-state">No damage-by-target data available.</div>;
  }

  return (
    <div className="damage-by-target">
      {data.map((t) => (
        <div key={t.target} className="target-card">
          <div className="target-header">
            <button className="target-toggle" onClick={() => toggleTarget(t.target)}>
              {openTargets[t.target] ? '▾' : '▸'}
            </button>
            <h3 className="target-name">{t.target}</h3>
            <div className="target-summary">Casters: {t.casters.length}</div>
          </div>

          {openTargets[t.target] && (
            <div className="target-body">
              {t.casters.map((c) => (
                <div key={`${t.target}-${c.caster}`} className="caster-block">
                  <div className="caster-header">
                    <strong className="caster-name">{c.caster}</strong>
                    <span className="caster-damage">
                      {Math.round(c.totalDamage).toLocaleString()} dmg · {Math.round(c.dps).toLocaleString()} dps
                      <span style={{ opacity: 0.7 }}> ({Math.round(c.duration)}s)</span>
                    </span>
                  </div>
                  <div className="caster-skills">
                    <table className="skills-table">
                      <thead>
                        <tr>
                          <th>Skill</th>
                          <th style={{ textAlign: 'right' }}>Damage</th>
                          <th style={{ textAlign: 'right' }}>Hits</th>
                        </tr>
                      </thead>
                      <tbody>
                        {c.skills.map((s) => {
                          const iconPath = getSkillIconPath(s.skill);
                          return (
                            <tr key={`${c.caster}-${s.skill}`}>
                              <td className="skill-name" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {iconPath && (
                                  <img 
                                    src={iconPath} 
                                    alt={s.skill}
                                    style={{ 
                                      width: '24px', 
                                      height: '24px', 
                                      borderRadius: '4px',
                                      objectFit: 'cover'
                                    }} 
                                  />
                                )}
                                <span>{s.skill}</span>
                              </td>
                              <td style={{ textAlign: 'right' }}>{Math.round(s.damage).toLocaleString()}</td>
                              <td style={{ textAlign: 'right' }}>{s.hits}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default DamageByTarget;
