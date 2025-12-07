import React, { useState } from 'react';

interface RawLogViewerProps {
  files: Array<{
    id: string;
    fileName: string;
    rawContent: string;
  }>;
}

const RawLogViewer: React.FC<RawLogViewerProps> = ({ files }) => {
  const [showAll, setShowAll] = useState(false);
  const PREVIEW_LINES = 20;

  if (!files || files.length === 0) {
    return null;
  }

  // Combine all raw content
  const combinedContent = files.map(f => `# ${f.fileName}\n${f.rawContent}`).join('\n\n');
  const lines = combinedContent.split('\n');
  const displayLines = showAll ? lines : lines.slice(0, PREVIEW_LINES);
  const hasMore = lines.length > PREVIEW_LINES;

  return (
    <div className="raw-log-viewer">
      <div className="raw-log-header">
        <h3>📄 Raw Combat Log</h3>
        <div className="raw-log-info">
          {files.length} file(s) · {lines.length} lines
        </div>
      </div>
      <div className="raw-log-content">
        <pre>
          <code>{displayLines.join('\n')}</code>
        </pre>
      </div>
      {hasMore && !showAll && (
        <div className="raw-log-footer">
          <button 
            className="btn-load-more"
            onClick={() => setShowAll(true)}
          >
            Load Remaining {lines.length - PREVIEW_LINES} Lines
          </button>
        </div>
      )}
      {showAll && (
        <div className="raw-log-footer">
          <button 
            className="btn-load-more"
            onClick={() => setShowAll(false)}
          >
            Show Less
          </button>
        </div>
      )}
    </div>
  );
};

export default RawLogViewer;
