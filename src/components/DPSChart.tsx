import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  Label,
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
  const [showTargetSections, setShowTargetSections] = useState(false);

  if (data.length === 0) {
    return <div className="empty-state">No DPS data available</div>;
  }

  // Find the global earliest start time across all players
  const globalStartTime = Math.min(
    ...data.map(player => 
      player.dataPoints.length > 0 ? player.dataPoints[0].actualTime - player.dataPoints[0].time : Infinity
    )
  );

  // Transform data for recharts - combine all player data points
  const maxDuration = Math.max(...data.map(d => d.duration));
  const mergedData: any[] = [];

  for (let i = 0; i <= maxDuration; i++) {
    const point: any = { time: i };
    // Calculate the actual time for this relative time point based on global start
    point.actualTime = globalStartTime + i;
    
    data.forEach(player => {
      const dataPoint = player.dataPoints.find(dp => dp.time === i);
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

  // Only calculate target periods if the feature is enabled
  let targetPeriods: Array<{ target: string; start: number; end: number }> = [];
  let targetColors = new Map<string, string>();

  if (showTargetSections) {
    // Create target engagement periods from target changes
    // Combine all players' target changes to show overall combat flow
    const allTargetChanges: Array<{ time: number; target: string }> = [];
    data.forEach(player => {
      player.targetChanges.forEach(tc => {
        // Only add if not already present at this time
        if (!allTargetChanges.find(existing => 
          Math.abs(existing.time - tc.time) < 0.5 && existing.target === tc.target
        )) {
          allTargetChanges.push(tc);
        }
      });
    });
    
    // Sort by time
    allTargetChanges.sort((a, b) => a.time - b.time);
    
    // Create engagement periods with start and end times
    // Round to match the integer time values in mergedData
    const rawPeriods = allTargetChanges.map((change, index) => {
      const nextChange = allTargetChanges[index + 1];
      return {
        target: change.target,
        start: Math.floor(change.time),
        end: nextChange ? Math.floor(nextChange.time) : Math.floor(maxDuration),
      };
    });

    // Merge consecutive periods with the same target only if they're within 30 seconds
    rawPeriods.forEach(period => {
      const lastPeriod = targetPeriods[targetPeriods.length - 1];
      const timeSinceLastPeriod = lastPeriod ? period.start - lastPeriod.end : Infinity;
      
      if (lastPeriod && lastPeriod.target === period.target && timeSinceLastPeriod <= 30) {
        // Extend the last period to include this one (same target, less than 30 seconds gap)
        lastPeriod.end = period.end;
      } else {
        // Add new period (different target or gap > 30 seconds)
        targetPeriods.push({ ...period });
      }
    });

    // Assign colors to unique targets
    const uniqueTargets = Array.from(new Set(targetPeriods.map(p => p.target)));
    uniqueTargets.forEach((target) => {
      targetColors.set(target, stringToColor(target));
    });
  }

  return (
    <div className="dps-chart-wrapper">
      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={showTargetSections}
            onChange={(e) => setShowTargetSections(e.target.checked)}
          />
          <span>Show Target Sections</span>
        </label>
      </div>

      {/* Average DPS Chart */}
      <h3 style={{ color: '#d0d0d0', marginTop: '20px', marginBottom: '10px' }}>Average DPS Over Time</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={mergedData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          
          {/* Background shading for each target engagement period */}
          {targetPeriods.map((period, index) => (
            <ReferenceArea
              key={`target-period-${index}`}
              x1={period.start}
              x2={period.end}
              fill={targetColors.get(period.target)}
              fillOpacity={0.3}
              stroke={targetColors.get(period.target)}
              strokeOpacity={0.5}
              label={{
                value: period.target,
                position: 'insideTop',
                fill: '#d0d0d0',
                fontSize: 10,
                offset: 5,
              }}
            />
          ))}
          <XAxis
            dataKey="time"
            label={{ value: 'Time', position: 'insideBottomRight', offset: -5, fill: '#d0d0d0' }}
            tick={{ fill: '#d0d0d0' }}
            tickFormatter={(value) => {
              const dataPoint = mergedData.find(d => d.time === value);
              return dataPoint?.actualTime ? formatTime(dataPoint.actualTime) : `${value}s`;
            }}
          />
          <YAxis
            label={{ value: 'Average DPS', angle: -90, position: 'insideLeft', fill: '#d0d0d0' }}
            tick={{ fill: '#d0d0d0' }}
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
              <Line
                key={player.playerName}
                type="monotone"
                dataKey={player.playerName}
                stroke={baseColor}
                dot={false}
                isAnimationActive={false}
                strokeWidth={2}
                name={player.playerName}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>

      {/* Instantaneous DPS Chart */}
      <h3 style={{ color: '#d0d0d0', marginTop: '40px', marginBottom: '10px' }}>Instantaneous DPS (Per Second)</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={mergedData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          
          {/* Background shading for each target engagement period */}
          {targetPeriods.map((period, index) => (
            <ReferenceArea
              key={`inst-target-period-${index}`}
              x1={period.start}
              x2={period.end}
              fill={targetColors.get(period.target)}
              fillOpacity={0.3}
              stroke={targetColors.get(period.target)}
              strokeOpacity={0.5}
              label={{
                value: period.target,
                position: 'insideTop',
                fill: '#d0d0d0',
                fontSize: 10,
                offset: 5,
              }}
            />
          ))}
          <XAxis
            dataKey="time"
            label={{ value: 'Time', position: 'insideBottomRight', offset: -5, fill: '#d0d0d0' }}
            tick={{ fill: '#d0d0d0' }}
            tickFormatter={(value) => {
              const dataPoint = mergedData.find(d => d.time === value);
              return dataPoint?.actualTime ? formatTime(dataPoint.actualTime) : `${value}s`;
            }}
          />
          <YAxis
            label={{ value: 'Instantaneous DPS', angle: -90, position: 'insideLeft', fill: '#d0d0d0' }}
            tick={{ fill: '#d0d0d0' }}
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
              <Line
                key={player.playerName}
                type="monotone"
                dataKey={`${player.playerName} (Instant)`}
                stroke={baseColor}
                dot={false}
                isAnimationActive={false}
                strokeWidth={2}
                name={player.playerName}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DPSChart;
