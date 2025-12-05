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

  return (
    <div style={{ width: '100%', height: computedHeight }}>
      <ResponsiveContainer>
        {/* layout="vertical" makes Y the category axis (skills) and X the numeric axis (damage) */}
        <BarChart layout="vertical" data={sorted} margin={{ top: 20, right: 20, left: 80, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis type="category" dataKey="skill" width={220} interval={0}/>
          <Tooltip formatter={(value: any) => [value, 'Damage']} />
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
