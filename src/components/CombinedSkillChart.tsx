import React from 'react';
import type { SkillDamage, SkillBreakdown } from '../types/combatLog';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { getSkillIconPath, getSkillMetadata } from '../utils/skillIcons';

interface CombinedSkillChartProps {
  damageData: SkillDamage[];
  breakdownData: SkillBreakdown[];
}

interface CombinedSkillData {
  skill: string;
  damage: number;
  hits: number;
  normalHits: number;
  criticalHits: number;
  heavyHits: number;
  heavyCriticalHits: number;
  normalDamage: number;
  criticalDamage: number;
  heavyDamage: number;
  heavyCriticalDamage: number;
}

const CombinedSkillChart: React.FC<CombinedSkillChartProps> = ({ damageData, breakdownData }) => {
  // Merge damage and breakdown data
  const combinedData = damageData.map(dmg => {
    const breakdown = breakdownData.find(b => b.skill === dmg.skill);
    const normalHits = breakdown?.normalHits || 0;
    const criticalHits = breakdown?.criticalHits || 0;
    const heavyHits = breakdown?.heavyHits || 0;
    const heavyCriticalHits = breakdown?.heavyCriticalHits || 0;
    const totalHits = normalHits + criticalHits + heavyHits + heavyCriticalHits;
    
    // Estimate damage contribution from each hit type proportionally
    const normalDamage = totalHits > 0 ? (normalHits / totalHits) * dmg.damage : 0;
    const criticalDamage = totalHits > 0 ? (criticalHits / totalHits) * dmg.damage : 0;
    const heavyDamage = totalHits > 0 ? (heavyHits / totalHits) * dmg.damage : 0;
    const heavyCriticalDamage = totalHits > 0 ? (heavyCriticalHits / totalHits) * dmg.damage : 0;
    
    return {
      skill: dmg.skill,
      damage: dmg.damage,
      hits: dmg.hits,
      normalHits,
      criticalHits,
      heavyHits,
      heavyCriticalHits,
      normalDamage,
      criticalDamage,
      heavyDamage,
      heavyCriticalDamage,
    };
  });

  // Sort by damage descending and take top 30
  const sorted = [...combinedData].sort((a, b) => b.damage - a.damage).slice(0, 30);

  const BAR_THICKNESS = 20;
  const ROW_GAP = 6;
  const VERTICAL_PADDING = 80;
  const minHeight = 240;
  const computedHeight = Math.max(minHeight, sorted.length * (BAR_THICKNESS + ROW_GAP) + VERTICAL_PADDING);

  const CustomYAxisTick = (props: any) => {
    const { x, y, payload } = props;
    const iconPath = getSkillIconPath(payload.value);
    
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={-30}
          y={0}
          dy={4}
          textAnchor="end"
          fill="#d0d0d0"
          fontSize={12}
        >
          {payload.value}
        </text>
        {iconPath && (
          <image
            href={iconPath}
            x={-25}
            y={-10}
            width={20}
            height={20}
            style={{ 
              borderRadius: '4px',
              pointerEvents: 'none'
            }}
          />
        )}
      </g>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload as CombinedSkillData;
    const skillName = data.skill;
    const metadata = getSkillMetadata(skillName);

    const totalHits = data.normalHits + data.criticalHits + data.heavyHits + data.heavyCriticalHits;
    const formatPercent = (count: number) => totalHits > 0 ? ((count / totalHits) * 100).toFixed(1) : '0.0';

    return (
      <div style={{
        backgroundColor: '#1a1a1a',
        border: '2px solid #444',
        borderRadius: '8px',
        padding: '12px',
        minWidth: '240px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ 
          fontWeight: 'bold', 
          color: '#fff', 
          marginBottom: '8px',
          fontSize: '14px'
        }}>
          {skillName}
        </div>
        {metadata && (
          <div style={{ fontSize: '12px', color: '#d0d0d0', marginBottom: '8px' }}>
            {metadata.weapon && (
              <div style={{ marginBottom: '4px' }}>
                <span style={{ color: '#888' }}>Weapon:</span>{' '}
                <span style={{ color: '#82ca9d' }}>{metadata.weapon}</span>
              </div>
            )}
            {metadata.type && (
              <div style={{ marginBottom: '4px' }}>
                <span style={{ color: '#888' }}>Type:</span>{' '}
                <span style={{ color: '#8884d8', textTransform: 'capitalize' }}>{metadata.type}</span>
              </div>
            )}
          </div>
        )}
        <div style={{ 
          borderTop: '1px solid #444', 
          paddingTop: '8px',
          marginBottom: '8px'
        }}>
          <div style={{ fontSize: '13px', marginBottom: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ color: '#888' }}>Total Damage:</span>
              <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '16px' }}>
                {data.damage.toLocaleString()}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#888' }}>Total Hits:</span>
              <span style={{ color: '#fff', fontWeight: 'bold' }}>{totalHits.toLocaleString()}</span>
            </div>
          </div>
        </div>
        {totalHits > 0 && (
          <div style={{ 
            borderTop: '1px solid #444',
            paddingTop: '8px',
            fontSize: '12px'
          }}>
            <div style={{ color: '#888', marginBottom: '6px' }}>Hit Breakdown:</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span style={{ color: '#8884d8' }}>Normal:</span>
              <span style={{ color: '#fff' }}>
                {data.normalHits.toLocaleString()} ({formatPercent(data.normalHits)}%)
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span style={{ color: '#ff7f50' }}>Critical:</span>
              <span style={{ color: '#fff' }}>
                {data.criticalHits.toLocaleString()} ({formatPercent(data.criticalHits)}%)
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span style={{ color: '#82ca9d' }}>Heavy:</span>
              <span style={{ color: '#fff' }}>
                {data.heavyHits.toLocaleString()} ({formatPercent(data.heavyHits)}%)
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#ffc658' }}>Heavy + Crit:</span>
              <span style={{ color: '#fff' }}>
                {data.heavyCriticalHits.toLocaleString()} ({formatPercent(data.heavyCriticalHits)}%)
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ width: '100%', height: computedHeight }}>
      <ResponsiveContainer>
        <BarChart layout="vertical" data={sorted} margin={{ top: 20, right: 20, left: 180, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" tick={{ fill: '#d0d0d0' }} />
          <YAxis 
            type="category" 
            dataKey="skill" 
            width={160} 
            interval={0} 
            tick={<CustomYAxisTick />}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="normalDamage" stackId="a" fill="#8884d8" name="Normal" barSize={BAR_THICKNESS} />
          <Bar dataKey="criticalDamage" stackId="a" fill="#ff7f50" name="Critical" barSize={BAR_THICKNESS} />
          <Bar dataKey="heavyDamage" stackId="a" fill="#82ca9d" name="Heavy" barSize={BAR_THICKNESS} />
          <Bar dataKey="heavyCriticalDamage" stackId="a" fill="#ffc658" name="Heavy + Critical" barSize={BAR_THICKNESS} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CombinedSkillChart;
