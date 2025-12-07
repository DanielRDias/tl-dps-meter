import React from 'react';
import '/static/styles/About.css';

const About: React.FC = () => {
  return (
    <div className="about-container">
      <div className="about-header">
        <h1>About TL DPS Meter</h1>
        <p className="subtitle">Combat Log Analysis for Throne and Liberty</p>
      </div>

      <section className="about-section">
        <h2>What is TL DPS Meter?</h2>
        <p>
          TL DPS Meter is a free, web-based tool designed to help Throne and Liberty players 
          analyze their combat performance. By parsing combat log files, this tool provides 
          detailed insights into damage output, skill usage, and combat efficiency.
        </p>
      </section>

      <section className="about-section">
        <h2>How to Use</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Locate Your Combat Logs</h3>
              <p>
                Combat logs are saved in <code>%LOCALAPPDATA%\TL\SAVED\COMBATLOGS</code>
              </p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Upload Log Files</h3>
              <p>
                Drag and drop your combat log files onto the upload area, or click to 
                browse. You can upload multiple files to compare different sessions.
              </p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Analyze Results</h3>
              <p>
                Review the interactive charts and statistics to understand your combat 
                performance, identify top skills, and optimize your rotation.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="about-section">
        <h2>Expected Log Format</h2>
        <p>
          The parser expects combat log files in CSV format with the following structure:
        </p>
        <div className="code-block">
          <code>
            Timestamp,LogType,SkillName,SkillId,DamageAmount,CriticalHit,HeavyHit,DamageType,CasterName,TargetName
          </code>
        </div>
        <p className="format-note">
          Files typically start with <code>CombatLogVersion</code> header followed by damage entries.
        </p>
      </section>

      <footer className="about-footer">
        <p>
          Built with ❤️ for the Throne and Liberty community
        </p>
      </footer>
    </div>
  );
};

export default About;
