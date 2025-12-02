import React, { useState } from 'react';
import { CombatLogParser } from '../utils/logParser';
import type { CombatLogEntry, PlayerStats, PlayerDPSData } from '../types/combatLog';
import DPSChart from './DPSChart';
import StatsTable from './StatsTable';
import FileUpload from './FileUpload';
import '../styles/DPSMeter.css';

const DPSMeter: React.FC = () => {
  const [entries, setEntries] = useState<CombatLogEntry[]>([]);
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([]);
  const [dpsData, setDpsData] = useState<PlayerDPSData[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [fileName, setFileName] = useState<string>('');

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const logEntries = CombatLogParser.parseLog(content);
      
      if (logEntries.length > 0) {
        setEntries(logEntries);
        setPlayerStats(CombatLogParser.getPlayerStats(logEntries));
        setDpsData(CombatLogParser.calculatePlayerDPS(logEntries));
        setFileName(file.name);
        setIsLoaded(true);
      } else {
        // Show detailed error message and check browser console
        const lines = content.split('\n').length;
        alert(
          `No combat entries found in the log file.\n\n` +
          `File has ${lines} lines total.\n\n` +
          `Expected format:\n[HH:MM:SS] Source -> Target: Action Damage (Type)\n\n` +
          `Example:\n[12:34:56] Player1 -> Boss: Attack 1000 (Physical)\n\n` +
          `Check browser console (F12) for debug info.`
        );
        console.log('Failed to parse log file:', file.name);
        console.log('First 5 lines:', content.split('\n').slice(0, 5));
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="dps-meter-container">
      <header className="dps-meter-header">
        <h1>🗡️ Throne and Liberty DPS Meter</h1>
        <p>Upload and analyze combat logs</p>
      </header>

      <FileUpload onFileUpload={handleFileUpload} />

      {isLoaded && (
        <div className="meter-content">
          <div className="file-info">
            <span className="file-name">📄 {fileName}</span>
            <span className="entry-count">
              {entries.length} combat entries | {playerStats.length} players
            </span>
          </div>

          <div className="charts-section">
            <h2>DPS Over Time</h2>
            <DPSChart data={dpsData} />
          </div>

          <div className="stats-section">
            <h2>Player Statistics</h2>
            <StatsTable stats={playerStats} />
          </div>
        </div>
      )}
    </div>
  );
};

export default DPSMeter;
