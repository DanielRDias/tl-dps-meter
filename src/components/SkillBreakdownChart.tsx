import React from 'react';
import type { SkillBreakdown } from '../types/combatLog';
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

interface SkillBreakdownChartProps {
  data: SkillBreakdown[];
}

const SkillBreakdownChart: React.FC<SkillBreakdownChartProps> = ({ data }) => {
  const sorted = [...data].sort((a, b) => {
    const totalA = a.normalHits + a.criticalHits + a.heavyCriticalHits + a.heavyHits;
    const totalB = b.normalHits + b.criticalHits + b.heavyCriticalHits + b.heavyHits;
    return totalB - totalA;
  }).slice(0, 30);

  // Keep each stacked bar's thickness fixed and grow height with number of skills
  const BAR_THICKNESS = 20; // px
  const ROW_GAP = 6;
  const VERTICAL_PADDING = 80;
  const minHeight = 240;
  const computedHeight = Math.max(minHeight, sorted.length * (BAR_THICKNESS + ROW_GAP) + VERTICAL_PADDING);

  // Custom tick component to render skill icons
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

    const data = payload[0].payload;
    const skillName = data.skill;
    const metadata = getSkillMetadata(skillName);

    const totalHits = data.normalHits + data.criticalHits + data.heavyHits + data.heavyCriticalHits;

    return (
      <div style={{
        backgroundColor: '#1a1a1a',
        border: '2px solid #444',
        borderRadius: '8px',
        padding: '12px',
        minWidth: '220px',
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
          fontSize: '12px'
        }}>
          <div style={{ color: '#888', marginBottom: '6px' }}>Hit Breakdown:</div>
          {payload.map((entry: any, index: number) => (
            <div key={index} style={{ marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: entry.color }}>{entry.name}:</span>
              <span style={{ color: '#fff', fontWeight: 'bold' }}>
                {entry.value.toLocaleString()} ({((entry.value / totalHits) * 100).toFixed(1)}%)
              </span>
            </div>
          ))}
          <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid #444' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#888' }}>Total Hits:</span>
              <span style={{ color: '#fff', fontWeight: 'bold' }}>{totalHits.toLocaleString()}</span>
            </div>
          </div>
        </div>
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
          <Bar dataKey="normalHits" stackId="a" fill="#8884d8" name="Normal" barSize={BAR_THICKNESS} />
          <Bar dataKey="criticalHits" stackId="a" fill="#ff7f50" name="Critical" barSize={BAR_THICKNESS} />
          <Bar dataKey="heavyHits" stackId="a" fill="#82ca9d" name="Heavy" barSize={BAR_THICKNESS} />
          <Bar dataKey="heavyCriticalHits" stackId="a" fill="#ffc658" name="Heavy + Critical" barSize={BAR_THICKNESS} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SkillBreakdownChart;
