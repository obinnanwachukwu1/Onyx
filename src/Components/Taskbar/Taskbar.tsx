import { forwardRef, useEffect, useRef, type MouseEventHandler } from 'react';
import './Taskbar.css';
import Clock from './Clock';
import LaunchButton from './LaunchButton';
import { useWindowContext } from '../WindowContext';
import { WindowData } from '../../types/windows';

interface TaskbarProps {
  windows: WindowData[];
  setButtonPosition: (id: number, rect: DOMRect) => void;
}

const Taskbar = forwardRef<HTMLDivElement, TaskbarProps>(({ windows, setButtonPosition }, ref) => {
  const { activateWindow, toggleLauncherVisibility, launcherVisible } = useWindowContext();
  const buttonRefs = useRef<Record<number, HTMLButtonElement | null>>({});

  useEffect(() => {
    windows.forEach((window) => {
      const button = buttonRefs.current[window.id];
      if (button) {
        const rect = button.getBoundingClientRect();
        setButtonPosition(window.id, rect);
      }
    });
  }, [setButtonPosition, windows]);

  const handleContextMenu: MouseEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation();
    event.preventDefault();
  };

  return (
    <div ref={ref} className="taskbar" onContextMenu={handleContextMenu}>
      <LaunchButton launcherVisible={launcherVisible} onClick={toggleLauncherVisibility} />
      <div className="taskbar-items">
        {windows.map((window) =>
          window.showInTaskbar ? (
            <button
              key={window.id}
              ref={(element) => {
                buttonRefs.current[window.id] = element;
              }}
              className={`taskbar-item ${window.isMinimized ? 'minimized' : !window.isActive ? 'inactive' : ''}`}
              onClick={() => activateWindow(window.id)}
            >
              <img src={window.appIcon} className="taskbar-icon" alt="App icon" />
              {window.title}
            </button>
          ) : null,
        )}
      </div>
      <Clock />
    </div>
  );
});

Taskbar.displayName = 'Taskbar';

export default Taskbar;
