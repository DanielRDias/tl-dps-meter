import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { PlayerDPSData } from '../types/combatLog';

interface DPSChartProps {
  data: PlayerDPSData[];
}

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52C19B',
];

const DPSChart: React.FC<DPSChartProps> = ({ data }) => {
  if (data.length === 0) {
    return <div className="empty-state">No DPS data available</div>;
  }

  // Transform data for recharts - combine all player data points
  const maxDuration = Math.max(...data.map(d => d.duration));
  const mergedData: any[] = [];

  for (let i = 0; i <= maxDuration; i++) {
    const point: any = { time: i };
    data.forEach(player => {
      const dataPoint = player.dataPoints.find(dp => dp.time === i);
      point[player.playerName] = dataPoint?.dps || 0;
    });
    mergedData.push(point);
  }

  return (
    <div className="dps-chart-wrapper">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={mergedData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            label={{ value: 'Time (seconds)', position: 'insideBottomRight', offset: -5 }}
          />
          <YAxis
            label={{ value: 'DPS', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            formatter={(value: any) => (typeof value === 'number' ? value.toFixed(2) : value)}
            labelFormatter={(label) => `${label}s`}
          />
          <Legend />
          {data.map((player, index) => (
            <Line
              key={player.playerName}
              type="monotone"
              dataKey={player.playerName}
              stroke={COLORS[index % COLORS.length]}
              dot={false}
              isAnimationActive={false}
              strokeWidth={2}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DPSChart;
