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
import { getSkillIconPath } from '../utils/skillIcons';

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
        {iconPath && (
          <image
            href={iconPath}
            x={-90}
            y={-10}
            width={20}
            height={20}
            style={{ borderRadius: '4px' }}
          />
        )}
        <text
          x={iconPath ? -65 : -10}
          y={0}
          dy={4}
          textAnchor="start"
          fill="#d0d0d0"
          fontSize={12}
        >
          {payload.value.length > 25 ? payload.value.substring(0, 25) + '...' : payload.value}
        </text>
      </g>
    );
  };

  return (
    <div style={{ width: '100%', height: computedHeight }}>
      <ResponsiveContainer>
        <BarChart layout="vertical" data={sorted} margin={{ top: 20, right: 20, left: 100, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" tick={{ fill: '#d0d0d0' }} />
          <YAxis 
            type="category" 
            dataKey="skill" 
            width={240} 
            interval={0} 
            tick={<CustomYAxisTick />}
          />
          <Tooltip 
            formatter={(value: any, name: string) => {
              const hitTypeMap: Record<string, string> = {
                normalHits: 'Normal',
                criticalHits: 'Critical',
                heavyHits: 'Heavy',
                heavyCriticalHits: 'Heavy + Critical',
              };
              return [value, hitTypeMap[name] || name];
            }} 
          />
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
