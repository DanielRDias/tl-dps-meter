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

// Deterministic color by string (stable across renders)
const stringToColor = (s: string) => {
  // simple hash
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    // eslint-disable-next-line no-bitwise
    hash = s.charCodeAt(i) + ((hash << 5) - hash);
    // keep in 32-bit int
    // eslint-disable-next-line no-bitwise
    hash = hash & hash;
  }
  // Use HSL for broad palette
  const hue = Math.abs(hash) % 360;
  const saturation = 65;
  const lightness = 50;
  return `hsl(${hue} ${saturation}% ${lightness}%)`;
};

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
      if (dataPoint) {
        point.actualTime = dataPoint.actualTime; // Store actual timestamp for formatting
      }
      point[`${player.playerName}`] = dataPoint?.dps || 0; // Cumulative average DPS
      point[`${player.playerName} (Instant)`] = dataPoint?.instantDps || 0; // Instantaneous DPS
    });
    mergedData.push(point);
  }

  // Helper to format timestamp as HH:MM:SS
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="dps-chart-wrapper">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={mergedData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            label={{ value: 'Time', position: 'insideBottomRight', offset: -5 }}
            tickFormatter={(value) => {
              const dataPoint = mergedData.find(d => d.time === value);
              return dataPoint?.actualTime ? formatTime(dataPoint.actualTime) : `${value}s`;
            }}
          />
          <YAxis
            label={{ value: 'DPS', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            formatter={(value: any) => (typeof value === 'number' ? value.toFixed(2) : value)}
            labelFormatter={(label) => {
              const dataPoint = mergedData.find(d => d.time === label);
              return dataPoint?.actualTime ? formatTime(dataPoint.actualTime) : `${label}s`;
            }}
          />
          <Legend />
          {data.map((player, index) => {
            const baseColor = index < COLORS.length ? COLORS[index] : stringToColor(player.playerName);
            return (
              <React.Fragment key={player.playerName}>
                {/* Cumulative average DPS line */}
                <Line
                  type="monotone"
                  dataKey={player.playerName}
                  stroke={baseColor}
                  dot={false}
                  isAnimationActive={false}
                  strokeWidth={2}
                  name={`${player.playerName} (Average)`}
                />
                {/* Instantaneous DPS line */}
                <Line
                  type="monotone"
                  dataKey={`${player.playerName} (Instant)`}
                  stroke={baseColor}
                  dot={false}
                  isAnimationActive={false}
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  name={`${player.playerName} (Per Second)`}
                  opacity={0.6}
                />
              </React.Fragment>
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DPSChart;
