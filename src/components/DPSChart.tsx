import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceArea,
} from 'recharts';
import type { PlayerDPSData } from '../types/combatLog';

interface DPSChartProps {
  data: PlayerDPSData[];
  onZoomChange?: (range: { left: number; right: number } | null) => void;
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

const DPSChart: React.FC<DPSChartProps> = ({ data, onZoomChange }) => {
  const [showTargetSections, setShowTargetSections] = useState(false);
  const [refAreaLeft, setRefAreaLeft] = useState<number | null>(null);
  const [refAreaRight, setRefAreaRight] = useState<number | null>(null);
  const [zoomDomain, setZoomDomain] = useState<{ left: number; right: number } | null>(null);

  if (data.length === 0) {
    return <div className="empty-state">No DPS data available</div>;
  }

  // Memoize merged data to avoid recalculation on every render
  const mergedData = useMemo(() => {
    if (data.length === 0) return [];
    
    // Find the global earliest start time across all players efficiently
    let globalStartTime = Infinity;
    for (const player of data) {
      if (player.dataPoints.length > 0) {
        const startTime = player.dataPoints[0].actualTime - player.dataPoints[0].time;
        if (startTime < globalStartTime) {
          globalStartTime = startTime;
        }
      }
    }

    // Find max duration efficiently
    let maxDuration = 0;
    for (const player of data) {
      if (player.duration > maxDuration) {
        maxDuration = player.duration;
      }
    }

    // Pre-build data point maps for faster lookups
    const playerDataMaps = data.map(player => {
      const map = new Map();
      player.dataPoints.forEach(dp => {
        map.set(dp.time, dp);
      });
      return { playerName: player.playerName, dataMap: map };
    });

    // Collect all unique time points where at least one player has data
    const timePointsSet = new Set<number>();
    data.forEach(player => {
      player.dataPoints.forEach(dp => {
        timePointsSet.add(dp.time);
      });
    });
    const timePoints = Array.from(timePointsSet).sort((a, b) => a - b);

    // Transform data for recharts - only create points for seconds with data
    const result: any[] = [];
    timePoints.forEach(time => {
      const point: any = { time };
      point.actualTime = globalStartTime + time;
      
      playerDataMaps.forEach(({ playerName, dataMap }) => {
        const dataPoint = dataMap.get(time);
        point[playerName] = dataPoint?.dps || 0;
        point[`${playerName} (Instant)`] = dataPoint?.instantDps || 0;
      });
      result.push(point);
    });
    return result;
  }, [data]);

  // Helper to format timestamp as HH:MM:SS
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  // Memoize target periods calculation
  const { targetPeriods, targetColors } = useMemo(() => {
    const periods: Array<{ target: string; start: number; end: number }> = [];
    const colors = new Map<string, string>();
    
    if (!showTargetSections || data.length === 0) {
      return { targetPeriods: periods, targetColors: colors };
    }

    // Use a Set for O(1) duplicate detection instead of array.find
    const seenChanges = new Set<string>();
    const allTargetChanges: Array<{ time: number; endTime: number; target: string }> = [];
    
    data.forEach(player => {
      player.targetChanges.forEach(tc => {
        const key = `${tc.time.toFixed(1)}-${tc.target}`;
        if (!seenChanges.has(key)) {
          seenChanges.add(key);
          allTargetChanges.push(tc);
        }
      });
    });
    
    // Sort by time
    allTargetChanges.sort((a, b) => a.time - b.time);
    
    // Create engagement periods directly (use exact times to match sparse data points)
    allTargetChanges.forEach(change => {
      periods.push({
        target: change.target,
        start: change.time,
        end: change.endTime,
      });
    });

    // Assign colors to unique targets
    const uniqueTargets = Array.from(new Set(periods.map(p => p.target)));
    uniqueTargets.forEach((target) => {
      colors.set(target, stringToColor(target));
    });
    
    return { targetPeriods: periods, targetColors: colors };
  }, [data, showTargetSections]);

  const zoom = () => {
    if (refAreaLeft === null || refAreaRight === null) return;
    
    const left = Math.min(refAreaLeft, refAreaRight);
    const right = Math.max(refAreaLeft, refAreaRight);
    
    // Require minimum drag distance to avoid accidental zooms
    if (right - left < 2) {
      setRefAreaLeft(null);
      setRefAreaRight(null);
      return;
    }
    
    const newZoomDomain = { left, right };
    setZoomDomain(newZoomDomain);
    setRefAreaLeft(null);
    setRefAreaRight(null);
    
    // Notify parent component of zoom change
    if (onZoomChange) {
      onZoomChange(newZoomDomain);
    }
  };

  const resetZoom = () => {
    setZoomDomain(null);
    setRefAreaLeft(null);
    setRefAreaRight(null);
    
    // Notify parent component of zoom reset
    if (onZoomChange) {
      onZoomChange(null);
    }
  };

  return (
    <div className="dps-chart-wrapper">
      <div style={{ marginBottom: '10px', display: 'flex', gap: '20px', alignItems: 'center' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={showTargetSections}
            onChange={(e) => setShowTargetSections(e.target.checked)}
          />
          <span>Show Target Sections</span>
        </label>
        {zoomDomain && (
          <button
            onClick={resetZoom}
            style={{
              padding: '4px 12px',
              backgroundColor: '#4ECDC4',
              color: '#1a1a1a',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Reset Zoom
          </button>
        )}
      </div>

      {/* Average DPS Chart */}
      <h3 style={{ color: '#d0d0d0', marginTop: '20px', marginBottom: '10px' }}>
        Average DPS Over Time
        <span style={{ fontSize: '12px', marginLeft: '10px', opacity: 0.7 }}>
          {refAreaLeft !== null ? '(Release to zoom in)' : '(Click and drag to zoom)'}
        </span>
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart 
          data={mergedData} 
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          onMouseDown={(e: any) => e && e.activeLabel !== undefined && setRefAreaLeft(e.activeLabel)}
          onMouseMove={(e: any) => refAreaLeft !== null && e && e.activeLabel !== undefined && setRefAreaRight(e.activeLabel)}
          onMouseUp={zoom}
          style={{ cursor: refAreaLeft !== null ? 'col-resize' : 'crosshair' }}
        >
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
            label={{ value: 'Time (seconds)', position: 'insideBottomRight', offset: -5, fill: '#d0d0d0' }}
            tick={{ fill: '#d0d0d0' }}
            tickFormatter={(value) => `${Math.round(value)}s`}
            domain={zoomDomain ? [zoomDomain.left, zoomDomain.right] : ['dataMin', 'dataMax']}
            allowDataOverflow={true}
          />
          <YAxis
            label={{ value: 'Average DPS', angle: -90, position: 'insideLeft', fill: '#d0d0d0' }}
            tick={{ fill: '#d0d0d0' }}
          />
          <Tooltip
            formatter={(value: any) => (typeof value === 'number' ? Math.round(value).toLocaleString() : value)}
            labelFormatter={(label) => {
              const dataPoint = mergedData.find(d => d.time === label);
              return dataPoint?.actualTime ? formatTime(dataPoint.actualTime) : `${label}s`;
            }}
          />
          <Legend />
          
          {refAreaLeft !== null && refAreaRight !== null && (
            <ReferenceArea
              x1={refAreaLeft}
              x2={refAreaRight}
              strokeOpacity={0.8}
              stroke="#4ECDC4"
              strokeWidth={2}
              fill="#4ECDC4"
              fillOpacity={0.2}
            />
          )}
          
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
      <h3 style={{ color: '#d0d0d0', marginTop: '40px', marginBottom: '10px' }}>
        Instantaneous DPS (Per Second)
        <span style={{ fontSize: '12px', marginLeft: '10px', opacity: 0.7 }}>
          {refAreaLeft !== null ? '(Release to zoom in)' : '(Click and drag to zoom)'}
        </span>
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart 
          data={mergedData} 
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          onMouseDown={(e: any) => e && e.activeLabel !== undefined && setRefAreaLeft(e.activeLabel)}
          onMouseMove={(e: any) => refAreaLeft !== null && e && e.activeLabel !== undefined && setRefAreaRight(e.activeLabel)}
          onMouseUp={zoom}
          style={{ cursor: refAreaLeft !== null ? 'col-resize' : 'crosshair' }}
        >
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
            label={{ value: 'Time (seconds)', position: 'insideBottomRight', offset: -5, fill: '#d0d0d0' }}
            tick={{ fill: '#d0d0d0' }}
            tickFormatter={(value) => `${Math.round(value)}s`}
            domain={zoomDomain ? [zoomDomain.left, zoomDomain.right] : ['dataMin', 'dataMax']}
            allowDataOverflow={true}
          />
          <YAxis
            label={{ value: 'Instantaneous DPS', angle: -90, position: 'insideLeft', fill: '#d0d0d0' }}
            tick={{ fill: '#d0d0d0' }}
          />
          <Tooltip
            formatter={(value: any) => (typeof value === 'number' ? Math.round(value).toLocaleString() : value)}
            labelFormatter={(label) => {
              const dataPoint = mergedData.find(d => d.time === label);
              return dataPoint?.actualTime ? formatTime(dataPoint.actualTime) : `${label}s`;
            }}
          />
          <Legend />
          
          {refAreaLeft !== null && refAreaRight !== null && (
            <ReferenceArea
              x1={refAreaLeft}
              x2={refAreaRight}
              strokeOpacity={0.8}
              stroke="#4ECDC4"
              strokeWidth={2}
              fill="#4ECDC4"
              fillOpacity={0.2}
            />
          )}
          
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
