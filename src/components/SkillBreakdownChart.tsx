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
  Cell,
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

  return (
    <div style={{ width: '100%', height: 480 }}>
      <ResponsiveContainer>
        <BarChart layout="vertical" data={sorted} margin={{ top: 20, right: 20, left: 80, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis type="category" dataKey="skill" width={220} />
          <Tooltip formatter={(value: any) => [value, 'Hits']} />
          <Legend />
          <Bar dataKey="normalHits" stackId="a" fill="#8884d8" name="Normal" />
          <Bar dataKey="criticalHits" stackId="a" fill="#ff7f50" name="Critical" />
          <Bar dataKey="heavyHits" stackId="a" fill="#82ca9d" name="Heavy" />
          <Bar dataKey="heavyCriticalHits" stackId="a" fill="#ffc658" name="Heavy + Critical" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SkillBreakdownChart;
