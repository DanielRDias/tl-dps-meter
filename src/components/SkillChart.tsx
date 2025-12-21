import React from 'react';
import type { SkillDamage } from '../types/combatLog';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { getSkillIconPath, getSkillMetadata } from '../utils/skillIcons';

interface SkillChartProps {
  data: SkillDamage[];
}

const SkillChart: React.FC<SkillChartProps> = ({ data }) => {
  // Sort descending by damage for nicer visualization and take top N
  const sorted = [...data].sort((a, b) => b.damage - a.damage).slice(0, 30);

  // Keep each bar a fixed thickness and grow chart height with number of skills
  const BAR_THICKNESS = 20; // px per bar (requested)
  const ROW_GAP = 6; // gap between bars in px
  const VERTICAL_PADDING = 80; // top+bottom padding
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

    return (
      <div style={{
        backgroundColor: '#1a1a1a',
        border: '2px solid #444',
        borderRadius: '8px',
        padding: '12px',
        minWidth: '200px',
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
          fontSize: '13px'
        }}>
          <div style={{ color: '#888' }}>Damage:</div>
          <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '16px' }}>
            {data.damage.toLocaleString()}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ width: '100%', height: computedHeight }}>
      <ResponsiveContainer>
        {/* layout="vertical" makes Y the category axis (skills) and X the numeric axis (damage) */}
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
          {/* Assign a color per bar using Cell. Use a small palette, then fallback to deterministic HSL based on skill name. */}
          <Bar dataKey="damage" barSize={BAR_THICKNESS}>
            {sorted.map((entry, idx) => {
              // small palette for first N
              const PALETTE = ['#8884d8', '#82ca9d', '#ff7f50', '#a28fd0', '#f7b267', '#4ecdc4', '#ff6b6b', '#6a9fb5'];
              const color = idx < PALETTE.length ? PALETTE[idx] : stringToColor(entry.skill);
              return <Cell key={`cell-${idx}`} fill={color} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// deterministic color generation from string
const stringToColor = (s: string) => {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    // eslint-disable-next-line no-bitwise
    hash = s.charCodeAt(i) + ((hash << 5) - hash);
    // eslint-disable-next-line no-bitwise
    hash = hash & hash;
  }
  const hue = Math.abs(hash) % 360;
  const saturation = 65;
  const lightness = 50;
  return `hsl(${hue} ${saturation}% ${lightness}%)`;
};

export default SkillChart;
