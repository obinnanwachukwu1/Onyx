import { forwardRef, useEffect, useRef, type MouseEventHandler } from 'react';
import './Taskbar.css';
import Clock from './Clock';
import LaunchButton from './LaunchButton';
import { useWindowContext } from '../WindowContext';
import { WindowData } from '../../types/windows';
import { useTaskbar } from './TaskbarContext';
import appList from '../../Apps/AppList';
import TaskbarItem from './TaskbarItem';

interface TaskbarProps {
  windows: WindowData[];
  setButtonPosition: (id: number, rect: DOMRect) => void;
  activeWindowId?: number | null;
}

const Taskbar = forwardRef<HTMLDivElement, TaskbarProps>(({ windows, setButtonPosition }, ref) => {
  const { toggleLauncherVisibility, launcherVisible } = useWindowContext();
  const { taskbarStyle, pinnedAppIds } = useTaskbar();
  
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const openAppIds = Array.from(new Set(windows.map((w) => w.appId)));
  const allAppIds = Array.from(new Set([...pinnedAppIds, ...openAppIds]));

  // Helper to find the currently active window ID from the windows list
  // We can't just rely on `windows.find(w => w.isActive)` because multiple might be marked active in some stale state potentially,
  // but more importantly, we want to pass the explicit active ID to the children.
  // Actually, `windows` prop has the state.
  const activeWindow = windows.find(w => w.isActive);
  const activeWindowId = activeWindow ? activeWindow.id : null;

  useEffect(() => {
    windows.forEach((window) => {
      const button = buttonRefs.current[window.appId];
      if (button) {
        const rect = button.getBoundingClientRect();
        setButtonPosition(window.id, rect);
      }
    });
  }, [setButtonPosition, windows, allAppIds, taskbarStyle]);

  const handleContextMenu: MouseEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation();
    event.preventDefault();
  };

  return (
    <div ref={ref} className={`taskbar ${taskbarStyle}`} onContextMenu={handleContextMenu}>
      
      <div className="taskbar-items-container">
        <div className="taskbar-items">
           {/* Start Button / Launchpad */}
           <LaunchButton launcherVisible={launcherVisible} onClick={toggleLauncherVisibility} />

          {allAppIds.map((appId) => {
            const app = appList.find((a) => a.id === appId);
            if (!app) return null;

            const appWindows = windows.filter((w) => w.appId === appId);
            const isOpen = appWindows.length > 0;
            // Is any window of this app active?
            const isActive = appWindows.some(w => w.isActive);
            const isPinned = pinnedAppIds.includes(appId);
            const windowIds = appWindows.map(w => w.id);

            return (
              <TaskbarItem
                key={appId}
                ref={(el) => {
                  buttonRefs.current[appId] = el;
                }}
                appId={appId}
                icon={app.icon}
                title={app.name}
                isOpen={isOpen}
                isActive={isActive}
                isPinned={isPinned}
                windowIds={windowIds}
                activeWindowId={activeWindowId}
              />
            );
          })}
        </div>
      </div>

      {taskbarStyle === 'windows' && (
        <div className="taskbar-tray">
           <Clock />
        </div>
      )}
    </div>
  );
});

Taskbar.displayName = 'Taskbar';

export default Taskbar;
