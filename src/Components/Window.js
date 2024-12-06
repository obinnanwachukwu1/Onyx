import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindowMinimize} from '@fortawesome/free-solid-svg-icons/faWindowMinimize';
import './Window.css';
import { faX } from '@fortawesome/free-solid-svg-icons';
import { faWindowMaximize, faWindowRestore } from '@fortawesome/free-regular-svg-icons';

const Window = ({
  id,
  title,
  content,
  position,
  setPosition,
  size,
  setSize,
  restoreSize,
  isActive,
  isMaximized,
  doRestoreFromTaskbar,
  closingWindowID,
  setdoRestoreFromTaskbar,
  preClose,
  preMaximize,
  preRestore,
  getTaskbarTransformPos,
  onClose,
  onClick,
  onMinimize,
  onMaximize,
  onRestore,
}) => {
//   const [position, setPosition] = useState(initialPosition);
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [rel, setRel] = useState({ x: 0, y: 0 });
  const [isOpening, setIsOpening] = useState(!doRestoreFromTaskbar);
  const [isClosing, setIsClosing] = useState(false);
  const [isMinimizing, setIsMinimizing] = useState(false);
  const [isMaximizing, setIsMaximizing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [initialPosition, setInitialPosition] = useState(null);

  useEffect(() => {
    if (isOpening) {
        setTimeout(() => {
            setIsOpening(false);
            }, 250);
    } else if (isActive && doRestoreFromTaskbar) {
        getTaskbarTransformPos();
        setTimeout(() => {
            setdoRestoreFromTaskbar(false);
            doRestoreFromTaskbar = false;
          }, 250);
    }
  }, []);

  useEffect(() => {
    if (closingWindowID === id) {
      setIsClosing(true);
      setTimeout(() => {
          onClose();
        }, 250);
    }
  }, [closingWindowID])
  
  const handleWindowClick = (e) => {
    e.stopPropagation();
    onClick();
  };

  const handleClosing = (e) => {
    preClose();
  }

  const handleMinimizing = (e) => {
    getTaskbarTransformPos();
    setIsMinimizing(true);
    setTimeout(() => {
        onMinimize();
        setIsMinimizing(false);
      }, 250);
  }

  const toggleMaximizing = (e) => {
    if (!isMaximized) {
      preMaximize();
      setIsMaximizing(true);
      setTimeout(() => {
        onMaximize();
        setIsMaximizing(false);
      }, 250)
    } else {
      preRestore();
      console.log( document.documentElement.style.getPropertyValue('--width'))
      setIsRestoring(true);
      setTimeout(() => {
        onRestore();
        setIsRestoring(false);
      }, 250)
    }

    
  }

  const handleMouseDown = (e) => {
    e.stopPropagation();
    setInitialPosition({x: e.pageX, y: e.pageY});
    setRel({
      x: e.pageX - position.x,
      y: e.pageY - position.y,
    });
    document.body.style.userSelect = 'none';
    onClick();
  };

  const handleMouseMove = (e) => {
    if (initialPosition) {
      const deltaX = Math.abs(e.pageX - initialPosition.x);
      const deltaY = Math.abs(e.pageY - initialPosition.y);
      if (!dragging && (deltaX > 5 || deltaY > 5)) {
        setDragging(true);
      }

      if (dragging) {
        if (!isMaximized) {
          setPosition({
            x: Math.max(0, Math.min(e.pageX - rel.x, window.innerWidth - size.width)),
            y: Math.max(0, Math.min(e.pageY - rel.y, window.innerHeight - size.height)),
          });
        } else {
          setSize(restoreSize);
          setPosition({
            x:  Math.max(0, Math.min(e.pageX - restoreSize.width/2, window.innerWidth - restoreSize.width)),
            y:  Math.max(Math.min(e.pageY - 10, window.innerHeight - restoreSize.height), 0),
          });
        }
      }
    }
    if (resizing) {
      const newWidth = Math.max(200, e.pageX - position.x); // 200 is the min width
      const newHeight = Math.max(150, e.pageY - position.y); // 150 is the min height
      setSize({ width: newWidth, height: newHeight });
    }
  };

  const handleMouseUp = () => {
    setDragging(false);
    setResizing(false);
    setInitialPosition(false);
    document.body.style.userSelect = '';
  };

  const handleResizeStart = (e) => {
    setResizing(true);
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    // Handle drag and resize events
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
      className={`window ${isOpening ? 'window-opening' : isClosing ? 'window-closing' : doRestoreFromTaskbar ? 'window-restoring-from-taskbar' : isMinimizing ? 'window-minimizing' : isMaximizing ? 'window-maximizing' : isRestoring ? 'window-restoring' : '' } ${isActive ? 'active' : 'inactive'} ${isMaximized || isMaximizing? 'maximized' : ''}`}
      style={{
        top: position.y,
        left: position.x,
        width: size.width,
        height: size.height,
        zIndex: isActive ? 100 : 1, // Active window gets higher z-index
      }}
      onMouseDown={handleWindowClick} // Notify App.js to bring this window to the front
      onContextMenu={(e) => {e.stopPropagation(); e.preventDefault()}}
    >
      <div className={`window-header ${isActive ? 'active' : 'inactive'}`} onMouseDown={handleMouseDown} onDoubleClick={toggleMaximizing}>
      <span className="window-title">{title}</span>
      <button className="caption-button" onClick={handleMinimizing}><FontAwesomeIcon icon={faWindowMinimize}/></button>
      <button className="caption-button" onClick={toggleMaximizing}>{!isMaximized? <FontAwesomeIcon icon={faWindowMaximize} /> : <FontAwesomeIcon icon={faWindowRestore} />}</button>
      <button className="caption-button" onClick={handleClosing}><FontAwesomeIcon icon={faX}/></button>
      </div>
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