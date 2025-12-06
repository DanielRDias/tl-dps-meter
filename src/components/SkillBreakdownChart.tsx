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

  return (
    <div style={{ width: '100%', height: computedHeight }}>
      <ResponsiveContainer>
        <BarChart layout="vertical" data={sorted} margin={{ top: 20, right: 20, left: 80, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis type="category" dataKey="skill" width={220} interval={0}/>
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
