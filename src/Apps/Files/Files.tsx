import React, { useState, useEffect, useRef, useContext } from 'react';
import './Files.css';
import { useFileSystem, FileNode } from './FileSystem';
import { 
  Folder, FileText, ChevronLeft, ChevronRight, LayoutGrid, List as ListIcon, 
  Monitor, Download, File, Trash2, Plus, Edit2, ArrowUp
} from 'lucide-react';
import { useWindowChrome } from '../../Components/WindowChromeContext';
import { WindowManagerContext } from '../../Components/WindowManagerContext';
import { WindowContextValue } from '../../types/windows';
import appList from '../AppList';
import { getAppIconMap, filesIconFor, filesListIconFor } from './fileAssociations';

const Files = () => {
  const { fs, resolvePath, mkdir, touch, rm, rename, isEditable } = useFileSystem();
  const [currentPath, setCurrentPath] = useState('/Users/root');
  const [history, setHistory] = useState<string[]>(['/Users/root']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; targetId?: string } | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const { sidebarActiveId, setSidebarActiveId } = useWindowChrome();
  const windowManager = useContext(WindowManagerContext);
  
  if (!windowManager) {
    throw new Error('Files app must be used within a WindowManager');
  }
  
  const { launchApp } = windowManager;

  const containerRef = useRef<HTMLDivElement>(null);

  // Map app id -> icon path for rendering .app shortcuts
  const appIconMap = useRef<Record<string, string>>(getAppIconMap());

  const currentFolder = resolvePath(currentPath);
  const files = currentFolder && currentFolder.children ? Object.values(currentFolder.children) : [];

  // Sort files: folders first, then files, alphabetically
  files.sort((a, b) => {
    if (a.type === b.type) return a.name.localeCompare(b.name);
    return a.type === 'folder' ? -1 : 1;
  });

  const navigate = (path: string) => {
    if (path === currentPath) return;
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(path);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCurrentPath(path);
    setSelectedId(null);
  };

  // Sync sidebar selection with current path
  useEffect(() => {
    if (!setSidebarActiveId) return;

    if (currentPath === '/Users/root/Desktop') setSidebarActiveId('desktop');
    else if (currentPath === '/Users/root/Documents') setSidebarActiveId('documents');
    else if (currentPath === '/Users/root/Downloads') setSidebarActiveId('downloads');
    else if (currentPath === '/Applications') setSidebarActiveId('applications');
    else if (currentPath === '/Users/root') setSidebarActiveId('home');
    else if (currentPath === '/') setSidebarActiveId('root');
    else setSidebarActiveId('');
  }, [currentPath, setSidebarActiveId]);

  // Handle sidebar navigation
  useEffect(() => {
    if (!sidebarActiveId) return;
    
    switch (sidebarActiveId) {
      case 'desktop': navigate('/Users/root/Desktop'); break;
      case 'documents': navigate('/Users/root/Documents'); break;
      case 'downloads': navigate('/Users/root/Downloads'); break;
      case 'applications': navigate('/Applications'); break;
      case 'home': navigate('/Users/root'); break;
      case 'root': navigate('/'); break;
    }
  }, [sidebarActiveId]);

  const goBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCurrentPath(history[historyIndex - 1]);
      setSelectedId(null);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCurrentPath(history[historyIndex + 1]);
      setSelectedId(null);
    }
  };

  const goUp = () => {
    if (currentPath === '/') return;
    const parts = currentPath.split('/').filter(p => p);
    parts.pop();
    const parentPath = parts.length === 0 ? '/' : '/' + parts.join('/');
    navigate(parentPath);
  };

  const handleFileClick = (file: FileNode) => {
    setSelectedId(file.id);
  };

  const handleFileDoubleClick = (file: FileNode) => {
    if (file.type === 'folder') {
      const newPath = currentPath === '/' ? `/${file.name}` : `${currentPath}/${file.name}`;
      navigate(newPath);
    } else {
      if (file.name.endsWith('.app')) {
        // Launch by app id stored in content
        const appId = (file.content || '').trim();
        if (appId) {
          launchApp(appId);
        }
      } else if (file.name.endsWith('.txt')) {
        launchApp('notepad', { initialContent: file.content, filePath: `${currentPath}/${file.name}` });
      } else {
        // Default to notepad for now for any file, or just log
        // launchApp('notepad', { initialContent: file.content || '', filePath: `${currentPath}/${file.name}` });
        console.log('Open file:', file.name);
      }
    }
  };

  const handleContextMenu = (e: React.MouseEvent, fileId?: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, targetId: fileId });
    if (fileId) setSelectedId(fileId);
  };

  const closeContextMenu = () => setContextMenu(null);

  useEffect(() => {
    const handleClickOutside = () => closeContextMenu();
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const handleCreateFolder = () => {
    try {
      let name = 'New Folder';
      let counter = 1;
      while (files.some(f => f.name === name)) {
        name = `New Folder ${counter++}`;
      }
      mkdir(currentPath, name);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error creating folder');
    }
    closeContextMenu();
  };

  const handleCreateFile = () => {
    try {
      let name = 'New Text Document.txt';
      let counter = 1;
      while (files.some(f => f.name === name)) {
        name = `New Text Document ${counter++}.txt`;
      }
      touch(currentPath, name);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error creating file');
    }
    closeContextMenu();
  };

  const handleDelete = () => {
    if (!contextMenu?.targetId) return;
    const file = files.find(f => f.id === contextMenu.targetId);
    if (!file) return;

    if (confirm(`Are you sure you want to delete "${file.name}"?`)) {
      try {
        rm(`${currentPath}/${file.name}`);
      } catch (e) {
        alert(e instanceof Error ? e.message : 'Error deleting item');
      }
    }
    closeContextMenu();
  };

  const startRename = () => {
    if (!contextMenu?.targetId) return;
    const file = files.find(f => f.id === contextMenu.targetId);
    if (!file) return;
    
    setRenamingId(file.id);
    setRenameValue(file.name);
    closeContextMenu();
  };

  const submitRename = () => {
    if (!renamingId) return;
    const file = files.find(f => f.id === renamingId);
    if (!file) return;

    if (renameValue && renameValue !== file.name) {
      try {
        rename(`${currentPath}/${file.name}`, renameValue);
      } catch (e) {
        alert(e instanceof Error ? e.message : 'Error renaming item');
      }
    }
    setRenamingId(null);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canEditCurrent = isEditable(currentPath);

  return (
    <div className="files-app" onClick={() => setSelectedId(null)}>
      {/* Sidebar is now handled by Window.tsx */}

      <div className="files-main">
        <div className="files-toolbar">
          <div className="nav-buttons">
            <button className="nav-btn" onClick={goBack} disabled={historyIndex === 0}>
              <ChevronLeft size={18} />
            </button>
            <button className="nav-btn" onClick={goForward} disabled={historyIndex === history.length - 1}>
              <ChevronRight size={18} />
            </button>
            <button className="nav-btn" onClick={goUp} disabled={currentPath === '/'}>
              <ArrowUp size={18} />
            </button>
          </div>
          
          <div className="path-bar">
            {currentPath.split('/').filter(p => p).map((part, i, arr) => (
              <React.Fragment key={i}>
                <span 
                  className="path-segment"
                  onClick={() => navigate('/' + arr.slice(0, i + 1).join('/'))}
                >
                  {part}
                </span>
                {i < arr.length - 1 && <span className="path-separator">/</span>}
              </React.Fragment>
            ))}
            {currentPath === '/' && <span className="path-segment">/</span>}
          </div>

          <div className="view-toggle">
            <button 
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid size={16} />
            </button>
            <button 
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <ListIcon size={16} />
            </button>
          </div>
        </div>

        <div 
          className="files-content" 
          onContextMenu={(e) => handleContextMenu(e)}
        >
          {viewMode === 'grid' ? (
            <div className="files-grid">
              {files.map(file => (
                <div 
                  key={file.id}
                  className={`file-item-grid ${selectedId === file.id ? 'selected' : ''}`}
                  onClick={(e) => { e.stopPropagation(); handleFileClick(file); }}
                  onDoubleClick={(e) => { e.stopPropagation(); handleFileDoubleClick(file); }}
                  onContextMenu={(e) => handleContextMenu(e, file.id)}
                >
                  {filesIconFor(file.name, file.type === 'folder', (file.content || '').trim(), appIconMap.current)}
                  {renamingId === file.id ? (
                    <input 
                      type="text" 
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onBlur={submitRename}
                      onKeyDown={(e) => e.key === 'Enter' && submitRename()}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                      className="rename-input"
                    />
                  ) : (
                    <span className="file-name-grid">{file.name}</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="files-list">
              {files.map(file => (
                <div 
                  key={file.id}
                  className={`file-item-list ${selectedId === file.id ? 'selected' : ''}`}
                  onClick={(e) => { e.stopPropagation(); handleFileClick(file); }}
                  onDoubleClick={(e) => { e.stopPropagation(); handleFileDoubleClick(file); }}
                  onContextMenu={(e) => handleContextMenu(e, file.id)}
                >
                  {filesListIconFor(file.name, file.type === 'folder', (file.content || '').trim(), appIconMap.current)}
                  {renamingId === file.id ? (
                    <input 
                      type="text" 
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onBlur={submitRename}
                      onKeyDown={(e) => e.key === 'Enter' && submitRename()}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                      className="rename-input"
                    />
                  ) : (
                    <span className="file-name-list">{file.name}</span>
                  )}
                  <span className="file-date-list">{formatDate(file.modifiedAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="files-status-bar">
          {files.length} item{files.length !== 1 ? 's' : ''}
        </div>
      </div>

      {contextMenu && (
        <div 
          className="context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          {contextMenu.targetId ? (
            <>
              <div className="context-menu-item" onClick={() => {
                const file = files.find(f => f.id === contextMenu.targetId);
                if (file) handleFileDoubleClick(file);
                closeContextMenu();
              }}>
                <Monitor size={14} /> Open
              </div>
              {canEditCurrent && !files.find(f => f.id === contextMenu.targetId)?.isGhost && (
                <>
                  <div className="context-menu-separator" />
                  <div className="context-menu-item" onClick={startRename}>
                    <Edit2 size={14} /> Rename
                  </div>
                  <div className="context-menu-item" onClick={handleDelete} style={{ color: '#EF4444' }}>
                    <Trash2 size={14} /> Delete
                  </div>
                </>
              )}
            </>
          ) : (
            canEditCurrent ? (
              <>
                <div className="context-menu-item" onClick={handleCreateFolder}>
                  <Plus size={14} /> New Folder
                </div>
                <div className="context-menu-item" onClick={handleCreateFile}>
                  <File size={14} /> New Text File
                </div>
              </>
            ) : (
              <div className="context-menu-item" style={{ opacity: 0.5, cursor: 'default' }}>
                Read Only
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default Files;
