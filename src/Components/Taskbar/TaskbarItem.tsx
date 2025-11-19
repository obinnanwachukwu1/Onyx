import React, { forwardRef, useState, useRef, useEffect } from 'react';
import { useWindowContext } from '../WindowContext';
import { useTaskbar } from './TaskbarContext';
import { createPortal } from 'react-dom';

interface TaskbarItemProps {
  appId: string;
  icon: string;
  title: string;
  isOpen: boolean;
  isActive: boolean;
  isPinned: boolean;
  windowIds: number[]; // All window IDs for this app
  activeWindowId?: number | null; // Global active window ID to check which specific window is active
}

const TaskbarItem = forwardRef<HTMLButtonElement, TaskbarItemProps>(({
  appId,
  icon,
  title,
  isOpen,
  isActive,
  isPinned,
  windowIds,
  activeWindowId,
}, ref) => {
  const { activateWindow, notifyMinimize, launchApp } = useWindowContext();
  const { togglePin, taskbarStyle } = useTaskbar();
  
  const [menuMode, setMenuMode] = useState<'hover' | 'context' | null>(null);
  
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setRefs = (element: HTMLButtonElement | null) => {
      buttonRef.current = element;
      if (typeof ref === 'function') {
          ref(element);
      } else if (ref) {
          (ref as React.MutableRefObject<HTMLButtonElement | null>).current = element;
      }
  };
  
  const handleClick = (e: React.MouseEvent) => {
    if (!isOpen) {
      launchApp(appId);
      return;
    }

    if (menuMode) {
        setMenuMode(null);
        return; 
    }

    const activeAppWindowId = windowIds.find(id => id === activeWindowId);

    if (activeAppWindowId) {
        notifyMinimize(activeAppWindowId);
    } else {
        const mostRecentWindowId = windowIds[windowIds.length - 1];
        if (mostRecentWindowId) {
            activateWindow(mostRecentWindowId);
        }
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuMode('context'); // Show full menu on right click
  };
  
  const handleMouseEnter = () => {
      if (!isOpen) return;
      if (menuMode === 'context') return;
      
      // ONLY show hover menu if there is MORE THAN 1 instance
      if (windowIds.length <= 1) return;

      hoverTimeoutRef.current = setTimeout(() => {
          setMenuMode('hover');
      }, 400);
  };

  const handleMouseLeave = () => {
      if (hoverTimeoutRef.current) {
          clearTimeout(hoverTimeoutRef.current);
          hoverTimeoutRef.current = null;
      }
      
      hoverTimeoutRef.current = setTimeout(() => {
          setMenuMode(null);
      }, 300);
  };

  const handleMenuMouseEnter = () => {
      if (hoverTimeoutRef.current) {
          clearTimeout(hoverTimeoutRef.current);
          hoverTimeoutRef.current = null;
      }
  };

  const handleMenuMouseLeave = () => {
      hoverTimeoutRef.current = setTimeout(() => {
          setMenuMode(null);
      }, 300);
  };

  useEffect(() => {
      const closeMenu = (e: MouseEvent) => {
          if (buttonRef.current && buttonRef.current.contains(e.target as Node)) {
              return;
          }
          setMenuMode(null);
      };
      
      if (menuMode) {
          window.addEventListener('click', closeMenu);
      }
      return () => {
          window.removeEventListener('click', closeMenu);
          if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      };
  }, [menuMode]);

  const displayTitle = title;

  const renderWindowsIndicators = () => {
      if (taskbarStyle !== 'windows' || !isOpen) return null;
      
      if (windowIds.length <= 1) {
          return <div className={`taskbar-indicator ${isActive ? 'active' : 'minimized-indicator'}`} />;
      }

      return (
          <div className="taskbar-indicator-group">
              <div className={`taskbar-indicator ${isActive ? 'active' : 'minimized-indicator'}`} />
          </div>
      );
  };
  
  const renderWindowList = () => {
      if (!menuMode || !buttonRef.current) return null;
      
      // Double check condition for hover mode
      if (menuMode === 'hover' && windowIds.length <= 1) return null;
      
      const rect = buttonRef.current.getBoundingClientRect();
      const style: React.CSSProperties = {
          position: 'absolute',
          bottom: window.innerHeight - rect.top + 10,
          left: rect.left,
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          borderRadius: '8px',
          padding: '4px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          zIndex: 10000,
          minWidth: '150px',
          color: 'var(--text-color)',
          animation: 'fade-in 0.15s ease-out',
      };

      return createPortal(
          <div 
            className="taskbar-context-menu" 
            style={style} 
            onClick={(e) => e.stopPropagation()}
            onMouseEnter={handleMenuMouseEnter}
            onMouseLeave={handleMenuMouseLeave}
          >
              <div className="menu-header" style={{ padding: '4px 8px', fontSize: '12px', opacity: 0.7, borderBottom: '1px solid var(--card-border)', marginBottom: '4px' }}>{title}</div>
              
              {isOpen && windowIds.map((wid, idx) => (
                  <div 
                      key={wid} 
                      className="menu-item" 
                      style={{ padding: '6px 8px', cursor: 'pointer', borderRadius: '4px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}
                      onClick={() => {
                          activateWindow(wid);
                          setMenuMode(null);
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--subtle-bg)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                       <span>Instance {idx + 1}</span>
                       {wid === activeWindowId && <span style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--welcome-accent-blue)' }} title="Active"></span>}
                  </div>
              ))}
              
              {menuMode === 'context' && (
                <>
                    {isOpen && <div style={{ height: '1px', backgroundColor: 'var(--card-border)', margin: '4px 0' }} />}
                    
                    <div 
                        className="menu-item"
                        style={{ padding: '6px 8px', cursor: 'pointer', borderRadius: '4px', fontSize: '13px' }}
                        onClick={() => {
                            togglePin(appId);
                            setMenuMode(null);
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--subtle-bg)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        {isPinned ? 'Unpin from Taskbar' : 'Pin to Taskbar'}
                    </div>
                    
                    <div 
                        className="menu-item"
                        style={{ padding: '6px 8px', cursor: 'pointer', borderRadius: '4px', fontSize: '13px' }}
                        onClick={() => {
                            launchApp(appId);
                            setMenuMode(null);
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--subtle-bg)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        New Window
                    </div>
                </>
              )}
          </div>,
          document.body
      );
  };

  return (
    <>
        <button
        ref={setRefs}
        className={`taskbar-item ${isOpen ? 'open' : ''} ${isActive ? 'active' : ''} ${isPinned ? 'pinned' : ''} ${taskbarStyle}`}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        title={displayTitle}
        >
        <div className="taskbar-item-content">
            <img src={icon} alt={title} className="taskbar-icon" />
            {renderWindowsIndicators()}
            {taskbarStyle === 'mac' && isOpen && <div className="dock-indicator" />}
        </div>
        </button>
        {renderWindowList()}
    </>
  );
});

TaskbarItem.displayName = 'TaskbarItem';

export default TaskbarItem;
