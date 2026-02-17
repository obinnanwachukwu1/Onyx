import React, { useState, useEffect } from 'react';
import './Notepad.css';
import { useFileSystem } from '../Files/FileSystem';
import { Save } from 'lucide-react';

interface NotepadProps {
  initialContent?: string;
  filePath?: string;
}

const Notepad = ({ initialContent = '', filePath }: NotepadProps): JSX.Element => {
  const [content, setContent] = useState(initialContent);
  const { updateFileContent, isEditable } = useFileSystem();
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setContent(initialContent);
    setIsDirty(false);
  }, [initialContent]);

  const handleSave = () => {
    if (filePath && isEditable(filePath)) {
      try {
        updateFileContent(filePath, content);
        setIsDirty(false);
      } catch (e) {
        alert('Failed to save file: ' + (e instanceof Error ? e.message : 'Unknown error'));
      }
    } else {
      alert('Cannot save: No file path or read-only location.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <div className="notepad">
      {filePath && (
        <div className="notepad-toolbar">
          <button 
            className="notepad-btn" 
            onClick={handleSave}
            disabled={!isDirty}
            title="Save (Ctrl+S)"
          >
            <Save size={16} />
          </button>
          <span className="notepad-filename">
            {filePath.split('/').pop()} {isDirty ? '*' : ''}
          </span>
        </div>
      )}
      <textarea 
        className="text-input" 
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          setIsDirty(true);
        }}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};

export default Notepad;
