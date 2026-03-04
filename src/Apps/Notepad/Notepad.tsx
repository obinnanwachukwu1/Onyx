import React, { useState, useEffect } from 'react';
import './Notepad.css';
import { useFileSystem } from '../Files/FileSystem';
import { Save } from 'lucide-react';
import { useWindowModal } from '../../Components/WindowModalContext';

interface NotepadProps {
  initialContent?: string;
  filePath?: string;
}

const Notepad = ({ initialContent = '', filePath }: NotepadProps): JSX.Element => {
  const [content, setContent] = useState(initialContent);
  const { updateFileContent, isEditable } = useFileSystem();
  const [isDirty, setIsDirty] = useState(false);
  const { showAlert } = useWindowModal();

  useEffect(() => {
    setContent(initialContent);
    setIsDirty(false);
  }, [initialContent]);

  const handleSave = async () => {
    if (filePath && isEditable(filePath)) {
      try {
        updateFileContent(filePath, content);
        setIsDirty(false);
      } catch (e) {
        await showAlert({
          title: 'Save failed',
          message: `Failed to save file: ${e instanceof Error ? e.message : 'Unknown error'}`,
          tone: 'danger',
        });
      }
    } else {
      await showAlert({
        title: 'Cannot save',
        message: 'No file path is selected or this location is read-only.',
        tone: 'danger',
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      void handleSave();
    }
  };

  return (
    <div className="notepad">
      {filePath && (
        <div className="notepad-toolbar">
          <button 
            className="notepad-btn" 
            onClick={() => { void handleSave(); }}
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
