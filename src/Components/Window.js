import React, { useState, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindowMinimize} from '@fortawesome/free-solid-svg-icons/faWindowMinimize';
import './Window.css';
import { faX } from '@fortawesome/free-solid-svg-icons';
import { faWindowMaximize, faWindowRestore } from '@fortawesome/free-regular-svg-icons';
import { WindowManagerContext } from './WindowManagerContext';
import { AppManagerContext } from './AppManagerContext';

const Window = ({
  id,
  appId,
  appIcon,
  title,
  content,
  position,
  size,
  isMaximized,
  showInTaskbar,
  isActive,
  restoreSize,
  isRestoringFromTaskbar,
  renderMobile,
  zIndex
}) => {
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [rel, setRel] = useState({ x: 0, y: 0 });
  const [isOpening, setIsOpening] = useState(!isRestoringFromTaskbar);
  const [isClosing, setIsClosing] = useState(false);
  const [isMinimizing, setIsMinimizing] = useState(false);
  const [isMaximizing, setIsMaximizing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [initialPosition, setInitialPosition] = useState(null);

  const useWindowContext = () => {
    const windowManagerContext = useContext(WindowManagerContext);
    const appManagerContext = useContext(AppManagerContext);
    
    // Check if we're inside WindowManagerContext provider
    const isInsideWindowManager = windowManagerContext !== undefined;
    
    return isInsideWindowManager ? windowManagerContext : appManagerContext;
  };

  const {closingWindowID, activateWindow, setWindowPosition, setWindowSize, sendIntentToClose, sendIntentToMaximize, sendIntentToRestore, notifyClose, notifyMaximize, notifyMinimize, notifyRestore, getTaskbarTransformPos, afterRestoreFromTaskbar} = useWindowContext();

  useEffect(() => {
    if (isOpening) {
        setTimeout(() => {
            setIsOpening(false);
            }, 250);
    } else if (isActive && isRestoringFromTaskbar) {
        getTaskbarTransformPos(id);
        setTimeout(() => {
            afterRestoreFromTaskbar(id);
            isRestoringFromTaskbar = false;
          }, 250);
    }
  }, [isOpening]);

  useEffect(() => {
    console.log(closingWindowID === id)
    if (closingWindowID === id) {
      setIsClosing(true);
      setTimeout(() => {
          notifyClose(id);
        }, 250);
    }
  }, [closingWindowID])
  
  const handleWindowClick = (e) => {
    e.stopPropagation();
    activateWindow(id);
  };

  const handleClosing = (e) => {
    sendIntentToClose(id);
  }

  const handleMinimizing = (e) => {
    getTaskbarTransformPos(id);
    setIsMinimizing(true);
    setTimeout(() => {
        notifyMinimize(id);
        setIsMinimizing(false);
      }, 250);
  }

  const toggleMaximizing = (e) => {
    if (!isMaximized) {
      sendIntentToMaximize(id);
      setIsMaximizing(true);
      setTimeout(() => {
        notifyMaximize(id);
        setIsMaximizing(false);
      }, 250)
    } else {
      sendIntentToRestore(id);
      console.log( document.documentElement.style.getPropertyValue('--width'))
      setIsRestoring(true);
      setTimeout(() => {
        notifyRestore(id);
        setIsRestoring(false);
      }, 250)
    }
  }

  const normalizeEvent = (e) => {
    if (e.touches && e.touches.length > 0) {
      // Touch event
      return { pageX: e.touches[0].pageX, pageY: e.touches[0].pageY };
    }
    // Mouse event
    return { pageX: e.pageX, pageY: e.pageY };
  };
  
  const handleMouseDown = (e) => {
    const { pageX, pageY } = normalizeEvent(e);
    e.stopPropagation();
    setInitialPosition({ x: pageX, y: pageY });
    setRel({
      x: pageX - position.x,
      y: pageY - position.y,
    });
    document.body.style.userSelect = 'none';
    activateWindow(id);
  };
  
  const handleMouseMove = (e) => {
    const { pageX, pageY } = normalizeEvent(e);
  
    const desktop = document.querySelector('.desktop');
    const desktopBounds = desktop.getBoundingClientRect();
  
    if (initialPosition) {
      const deltaX = Math.abs(pageX - initialPosition.x);
      const deltaY = Math.abs(pageY - initialPosition.y);
      if (!dragging && (deltaX > 5 || deltaY > 5)) {
        setDragging(true);
      }
  
      if (dragging) {
        if (!isMaximized) {
          // Calculate constrained positions
          const newX = Math.max(
            0,
            Math.min(pageX - rel.x, desktopBounds.width - size.width)
          );
          const newY = Math.max(
            0,
            Math.min(pageY - rel.y, desktopBounds.height - size.height)
          );
  
          setWindowPosition(id, { x: newX, y: newY });
        } else {
          setWindowSize(id, restoreSize);
  
          const newX = Math.max(
            0,
            Math.min(pageX - restoreSize.width / 2, desktopBounds.width - restoreSize.width)
          );
          const newY = Math.max(
            Math.min(pageY - 10, desktopBounds.height - restoreSize.height),
            0
          );
  
          setWindowPosition(id, { x: newX, y: newY });
        }
      }
    }
  
    if (resizing) {
      // Constrain resizing within the desktop bounds
      const newWidth = Math.max(
        200,
        Math.min(pageX - position.x, desktopBounds.width - position.x)
      );
      const newHeight = Math.max(
        150,
        Math.min(pageY - position.y, desktopBounds.height - position.y)
      );
  
      setWindowSize(id, { width: newWidth, height: newHeight });
    }
  };
  
  const handleMouseUp = () => {
    setDragging(false);
    setResizing(false);
    setInitialPosition(false);
    document.body.style.userSelect = '';
  };
  
  useEffect(() => {
    if (initialPosition || dragging || resizing) {
      // Add mouse and touch event listeners
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleMouseMove, { passive: false });
      document.addEventListener('touchend', handleMouseUp);
    } else {
      // Remove mouse and touch event listeners
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleMouseMove);
      document.removeEventListener('touchend', handleMouseUp);
    }
  
    // Cleanup on unmount
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleMouseMove);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [initialPosition, dragging, resizing]);

  const handleResizeStart = (e) => {
    setResizing(true);
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    if (initialPosition || dragging || resizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [initialPosition, dragging, resizing]);
  

  return (
    <div
      className={`window ${renderMobile && isOpening ? 'window-mobile window-mobile-opening' : renderMobile && isClosing ? 'window-mobile window-mobile-closing' : renderMobile ? 'window-mobile' : isOpening ? 'window-opening' : isClosing ? 'window-closing' : isRestoringFromTaskbar ? 'window-restoring-from-taskbar' : isMinimizing ? 'window-minimizing' : isMaximizing ? 'window-maximizing' : isRestoring ? 'window-restoring' : '' } ${isMaximized || isMaximizing? 'maximized' : ''} ${renderMobile ? '' : isActive ? 'active' :  'inactive'}`}
      style={{
        top: position.y,
        left: position.x,
        width: size.width,
        height: size.height,
        zIndex: zIndex, // Add this line
      }}
      onMouseDown={handleWindowClick} // Notify App.js to bring this window to the front
      onContextMenu={(e) => {e.stopPropagation(); e.preventDefault()}}
    >
      { renderMobile ? null :
      <div className={`window-header ${isActive ? 'active' : 'inactive'}`} onMouseDown={handleMouseDown} onDoubleClick={toggleMaximizing} onTouchStart={handleMouseDown}>
        <img src={appIcon} className='window-icon'/>
        <span className="window-title">{title}</span>
        <button className="caption-button" onClick={handleMinimizing}><FontAwesomeIcon icon={faWindowMinimize}/></button>
        <button className="caption-button" onClick={toggleMaximizing}>{!isMaximized? <FontAwesomeIcon icon={faWindowMaximize} /> : <FontAwesomeIcon icon={faWindowRestore} />}</button>
        <button className="caption-button" onClick={handleClosing}><FontAwesomeIcon icon={faX}/></button>
      </div>}
      <div className="window-content" style={{
        flexGrow: 1,
        width: '100%',
        height:  '100%',
      }}>
        {content}
      </div>
      <div className="resize-handle" onMouseDown={handleResizeStart} />
    </div>
  );
};

export default Window;