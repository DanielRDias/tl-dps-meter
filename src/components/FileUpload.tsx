import React, { useRef } from 'react';

interface FileUploadProps {
  // New: supports uploading multiple files
  onFilesUpload?: (files: File[]) => void;
  // Backwards-compatible single-file handler (optional)
  onFileUpload?: (file: File) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFilesUpload, onFileUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    if (files.length > 0) {
      if (onFilesUpload) onFilesUpload(files);
      else if (onFileUpload) onFileUpload(files[0]);
    }
    // Reset input so same file(s) can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files ? Array.from(e.dataTransfer.files) : [];
    if (files.length > 0) {
      if (onFilesUpload) onFilesUpload(files);
      else if (onFileUpload) onFileUpload(files[0]);
    }
  };

  return (
    <div
      className="file-upload-container"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="upload-box" onClick={handleClick}>
        <div className="upload-icon">📁</div>
        <h3>Drop your combat log here</h3>
        <p>or click to browse</p>
        <p className="file-hint">Supports TLCombatLog*.txt files</p>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt"
        multiple
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default FileUpload;
