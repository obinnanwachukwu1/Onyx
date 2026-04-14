import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import './Files.css';
import { useFileSystem, FileNode } from './FileSystem';
import { 
  ChevronLeft, ChevronRight, LayoutGrid, List as ListIcon,
  Monitor, File, Trash2, Plus, Edit2, ArrowUp
} from 'lucide-react';
import { useWindowChrome } from '../../components/WindowChromeContext';
import { useWindowContext } from '../../components/WindowContext';
import { getAppIconMap, filesIconFor, filesListIconFor } from './fileAssociations';
import { joinPath } from './permissions';
import { useWindowModal } from '../../components/WindowModalContext';

const Files = () => {
  const {
    resolvePath,
    mkdir,
    touch,
    rm,
    rename,
    isEditable,
    canOpenPath,
    canDeletePath,
    canRenamePath,
  } = useFileSystem();
  const [currentPath, setCurrentPath] = useState('/Users/root');
  const [history, setHistory] = useState<string[]>(['/Users/root']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; targetId?: string } | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const { sidebarActiveId, setSidebarActiveId } = useWindowChrome();
  const { launchApp } = useWindowContext();
  const { showAlert, showConfirm } = useWindowModal();

  const isTouchRef = useRef<boolean>(false);
  const lastTapRef = useRef<{ id: string | null; time: number }>({ id: null, time: 0 });
  const contextMenuRef = useRef<HTMLDivElement>(null);

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
    closeContextMenu();
  };

  // On touch devices, consider a fast second tap on the same item as a double-click
  useEffect(() => {
    try {
      isTouchRef.current = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    } catch {
      isTouchRef.current = false;
    }
  }, []);

  const handleItemTapOrClick = (file: FileNode) => {
    handleFileClick(file);
    if (!isTouchRef.current) return;
    const now = Date.now();
    if (lastTapRef.current.id === file.id && now - lastTapRef.current.time < 300) {
      // Treat as double-click
      handleFileDoubleClick(file);
      lastTapRef.current = { id: null, time: 0 };
    } else {
      lastTapRef.current = { id: file.id, time: now };
    }
  };

  const handleFileDoubleClick = (file: FileNode) => {
    if (renamingId === file.id) return;
    const itemPath = joinPath(currentPath, file.name);

    if (file.type === 'folder') {
      if (!canOpenPath(itemPath)) {
        void showAlert({
          title: 'Permission denied',
          message: 'You cannot open this folder.',
          tone: 'danger',
        });
        return;
      }
      navigate(itemPath);
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

    // The window container uses transforms, so fixed-position children in this
    // subtree are positioned relative to the window box, not the viewport.
    const windowEl = (e.currentTarget as HTMLElement | null)?.closest('.window');
    if (windowEl) {
      const rect = windowEl.getBoundingClientRect();
      setContextMenu({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        targetId: fileId,
      });
    } else {
      setContextMenu({ x: e.clientX, y: e.clientY, targetId: fileId });
    }

    if (fileId) setSelectedId(fileId);
  };

  const closeContextMenu = () => setContextMenu(null);
  const stopEventPropagation = (e: React.SyntheticEvent) => e.stopPropagation();

  useLayoutEffect(() => {
    if (!contextMenu) return;
    const menuEl = contextMenuRef.current;
    if (!menuEl) return;

    const windowEl = menuEl.closest('.window') as HTMLElement | null;
    if (!windowEl) return;

    const menuRect = menuEl.getBoundingClientRect();
    const windowRect = windowEl.getBoundingClientRect();
    const edgePadding = 8;

    const maxX = Math.max(edgePadding, windowRect.width - menuRect.width - edgePadding);
    const maxY = Math.max(edgePadding, windowRect.height - menuRect.height - edgePadding);
    const nextX = Math.round(Math.min(Math.max(contextMenu.x, edgePadding), maxX));
    const nextY = Math.round(Math.min(Math.max(contextMenu.y, edgePadding), maxY));

    if (nextX !== contextMenu.x || nextY !== contextMenu.y) {
      setContextMenu((prev) => (prev ? { ...prev, x: nextX, y: nextY } : prev));
    }
  }, [contextMenu]);

  useEffect(() => {
    const handleClickOutside = () => closeContextMenu();
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const handleCreateFolder = async () => {
    try {
      let name = 'New Folder';
      let counter = 1;
      while (files.some(f => f.name === name)) {
        name = `New Folder ${counter++}`;
      }
      mkdir(currentPath, name);
    } catch (e) {
      await showAlert({
        title: 'Unable to create folder',
        message: e instanceof Error ? e.message : 'Error creating folder',
        tone: 'danger',
      });
    }
    closeContextMenu();
  };

  const handleCreateFile = async () => {
    try {
      let name = 'New Text Document.txt';
      let counter = 1;
      while (files.some(f => f.name === name)) {
        name = `New Text Document ${counter++}.txt`;
      }
      touch(currentPath, name);
    } catch (e) {
      await showAlert({
        title: 'Unable to create file',
        message: e instanceof Error ? e.message : 'Error creating file',
        tone: 'danger',
      });
    }
    closeContextMenu();
  };

  const handleDelete = async () => {
    if (!contextMenu?.targetId) return;
    const file = files.find(f => f.id === contextMenu.targetId);
    if (!file) return;
    const filePath = joinPath(currentPath, file.name);
    if (!canDeletePath(filePath) || file.isGhost) {
      await showAlert({
        title: 'Permission denied',
        message: 'You cannot delete this item.',
        tone: 'danger',
      });
      closeContextMenu();
      return;
    }

    const confirmed = await showConfirm({
      title: 'Delete item?',
      message: `Are you sure you want to delete "${file.name}"?`,
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      tone: 'danger',
    });

    if (confirmed) {
      try {
        rm(filePath);
      } catch (e) {
        await showAlert({
          title: 'Unable to delete item',
          message: e instanceof Error ? e.message : 'Error deleting item',
          tone: 'danger',
        });
      }
    }
    closeContextMenu();
  };

  const startRename = async () => {
    if (!contextMenu?.targetId) return;
    const file = files.find(f => f.id === contextMenu.targetId);
    if (!file) return;
    const filePath = joinPath(currentPath, file.name);
    if (!canRenamePath(filePath) || file.isGhost) {
      await showAlert({
        title: 'Permission denied',
        message: 'You cannot rename this item.',
        tone: 'danger',
      });
      closeContextMenu();
      return;
    }
    
    setRenamingId(file.id);
    setRenameValue(file.name);
    closeContextMenu();
  };

  const submitRename = async () => {
    if (!renamingId) return;
    const file = files.find(f => f.id === renamingId);
    if (!file) return;
    const oldPath = joinPath(currentPath, file.name);

    if (renameValue && renameValue !== file.name) {
      if (!canRenamePath(oldPath) || file.isGhost) {
        await showAlert({
          title: 'Permission denied',
          message: 'You cannot rename this item.',
          tone: 'danger',
        });
        setRenamingId(null);
        return;
      }
      try {
        rename(oldPath, renameValue);
      } catch (e) {
        await showAlert({
          title: 'Unable to rename item',
          message: e instanceof Error ? e.message : 'Error renaming item',
          tone: 'danger',
        });
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
  const contextTargetFile = contextMenu?.targetId
    ? files.find(f => f.id === contextMenu.targetId)
    : null;
  const contextTargetPath = contextTargetFile ? joinPath(currentPath, contextTargetFile.name) : null;
  const canOpenContextTarget = contextTargetPath ? canOpenPath(contextTargetPath) : false;
  const canRenameContextTarget = contextTargetPath
    ? canRenamePath(contextTargetPath) && !contextTargetFile?.isGhost
    : false;
  const canDeleteContextTarget = contextTargetPath
    ? canDeletePath(contextTargetPath) && !contextTargetFile?.isGhost
    : false;

  return (
    <div className="files-app" onClick={() => { setSelectedId(null); closeContextMenu(); }}>
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
                  onClick={(e) => { e.stopPropagation(); handleItemTapOrClick(file); }}
                  onDoubleClick={(e) => { e.stopPropagation(); handleFileDoubleClick(file); }}
                  onContextMenu={(e) => handleContextMenu(e, file.id)}
                >
                  {filesIconFor(
                    file.name,
                    file.type === 'folder',
                    (file.content || '').trim(),
                    appIconMap.current,
                    joinPath(currentPath, file.name)
                  )}
                  {renamingId === file.id ? (
                    <input 
                      type="text" 
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onBlur={() => { void submitRename(); }}
                      onKeyDown={(e) => e.key === 'Enter' && void submitRename()}
                      autoFocus
                      onMouseDown={stopEventPropagation}
                      onClick={stopEventPropagation}
                      onDoubleClick={stopEventPropagation}
                      onContextMenu={stopEventPropagation}
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
                  onClick={(e) => { e.stopPropagation(); handleItemTapOrClick(file); }}
                  onDoubleClick={(e) => { e.stopPropagation(); handleFileDoubleClick(file); }}
                  onContextMenu={(e) => handleContextMenu(e, file.id)}
                >
                  {filesListIconFor(
                    file.name,
                    file.type === 'folder',
                    (file.content || '').trim(),
                    appIconMap.current,
                    joinPath(currentPath, file.name)
                  )}
                  {renamingId === file.id ? (
                    <input 
                      type="text" 
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onBlur={() => { void submitRename(); }}
                      onKeyDown={(e) => e.key === 'Enter' && void submitRename()}
                      autoFocus
                      onMouseDown={stopEventPropagation}
                      onClick={stopEventPropagation}
                      onDoubleClick={stopEventPropagation}
                      onContextMenu={stopEventPropagation}
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
          ref={contextMenuRef}
          className="context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          {contextMenu.targetId ? (
            <>
              <div
                className="context-menu-item"
                onClick={() => {
                  if (!contextTargetFile || !canOpenContextTarget) return;
                  handleFileDoubleClick(contextTargetFile);
                  closeContextMenu();
                }}
                style={!canOpenContextTarget ? { opacity: 0.5, cursor: 'default' } : undefined}
              >
                <Monitor size={14} /> {canOpenContextTarget ? 'Open' : 'Locked'}
              </div>
              {(canRenameContextTarget || canDeleteContextTarget) && (
                <>
                  <div className="context-menu-separator" />
                  {canRenameContextTarget && (
                    <div className="context-menu-item" onClick={() => { void startRename(); }}>
                      <Edit2 size={14} /> Rename
                    </div>
                  )}
                  {canDeleteContextTarget && (
                    <div className="context-menu-item" onClick={() => { void handleDelete(); }} style={{ color: '#EF4444' }}>
                      <Trash2 size={14} /> Delete
                    </div>
                  )}
                </>
              )}
              {!canOpenContextTarget && !canRenameContextTarget && !canDeleteContextTarget && (
                <>
                  <div className="context-menu-separator" />
                  <div className="context-menu-item" style={{ opacity: 0.5, cursor: 'default' }}>
                    No Access
                  </div>
                </>
              )}
            </>
          ) : (
            canEditCurrent ? (
              <>
                <div className="context-menu-item" onClick={() => { void handleCreateFolder(); }}>
                  <Plus size={14} /> New Folder
                </div>
                <div className="context-menu-item" onClick={() => { void handleCreateFile(); }}>
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
