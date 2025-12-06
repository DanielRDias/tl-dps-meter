import React, { useState } from 'react';
import { shareLog } from '../utils/api';
import '../styles/ShareModal.css';

interface ShareModalProps {
  isOpen: boolean;
  playerName: string;
  totalDamage: number;
  damagePerSecond: number;
  duration: number;
  timestamp: number;
  logData: any[];
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  playerName,
  totalDamage,
  damagePerSecond,
  duration,
  timestamp,
  logData,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await shareLog(playerName, totalDamage, damagePerSecond, duration, timestamp, logData);
      setShareUrl(result.shareUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to share log');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUrl = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal" onClick={(e) => e.stopPropagation()}>
        <div className="share-modal-header">
          <h2>Share Your DPS Results</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="share-modal-content">
          {!shareUrl ? (
            <>
              <div className="share-info">
                <p>Share your combat log results with others using a unique link.</p>
                <div className="stats-preview">
                  <div className="stat-item">
                    <span className="label">Player:</span>
                    <span className="value">{playerName}</span>
                  </div>
                  <div className="stat-item">
                    <span className="label">Total Damage:</span>
                    <span className="value">{totalDamage.toLocaleString()}</span>
                  </div>
                  <div className="stat-item">
                    <span className="label">DPS:</span>
                    <span className="value">{damagePerSecond.toFixed(2)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="label">Duration:</span>
                    <span className="value">{duration}s</span>
                  </div>
                </div>
              </div>

              {error && <div className="error-message">{error}</div>}

              <button
                className="share-button"
                onClick={handleShare}
                disabled={loading}
              >
                {loading ? 'Generating link...' : 'Generate Share Link'}
              </button>
            </>
          ) : (
            <>
              <div className="share-success">
                <p className="success-icon">✓</p>
                <p className="success-message">Your results have been shared!</p>
              </div>

              <div className="share-url-container">
                <label>Share this link:</label>
                <div className="share-url-input">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                  <button className="copy-button" onClick={handleCopyUrl}>
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="share-instructions">
                <p>You can now share this link with others and they'll be able to view your combat results!</p>
              </div>

              <button className="close-modal-button" onClick={onClose}>
                Done
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
