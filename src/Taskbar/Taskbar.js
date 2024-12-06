import React, { useRef, useEffect, useState, useContext } from 'react';
import './Taskbar.css';
import Clock from './Clock';
import LaunchButton from './LaunchButton';
import { WindowManagerContext } from '../Components/WindowManagerContext';

const Taskbar = React.forwardRef(( { windows, setButtonPosition}, ref) => {
  const {activateWindow, toggleLauncherVisibility} = useContext(WindowManagerContext)
  const buttonRefs = useRef({});
  const handleRightClick = (e, val) => {
    e.stopPropagation();
    e.preventDefault();
    console.log(val);
  };

  useEffect(() => {
    windows.forEach((window) => {
      const button = buttonRefs.current[window.id];
      if (button) {
        const rect = button.getBoundingClientRect();
        setButtonPosition(window.id, rect);
      }
    });
  }, [windows]);

  return (
    <div ref={ref} className="taskbar" onContextMenu={(e) => handleRightClick(e, 2)}>
      <LaunchButton onClick={toggleLauncherVisibility} />
      <div className="taskbar-items">
        {windows.map(
          (window) =>
            window.showInTaskbar && (
              <button
                key={window.id}
                ref={(el) => (buttonRefs.current[window.id] = el)}
                className={`taskbar-item ${window.isMinimized ? 'minimized' : !window.active ? 'inactive' : ''}`}
                onClick={() => activateWindow(window.id)}
              >
                {window.title}
              </button>
            )
        )}
      </div>
      <Clock />
    </div>
  );
});

export default Taskbar;
