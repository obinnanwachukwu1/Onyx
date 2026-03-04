import { forwardRef, useEffect, useLayoutEffect, useMemo, useRef, type MouseEventHandler } from 'react';
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

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;
const APP_MAP = new Map(appList.map((app) => [app.id, app]));

const Taskbar = forwardRef<HTMLDivElement, TaskbarProps>(({ windows, setButtonPosition }, ref) => {
  const { toggleLauncherVisibility, launcherVisible } = useWindowContext();
  const { taskbarStyle, pinnedAppIds, isHydrated } = useTaskbar();
  
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const itemsContainerRef = useRef<HTMLDivElement | null>(null);
  const itemsRowRef = useRef<HTMLDivElement | null>(null);
  const previousItemsRectRef = useRef<DOMRect | null>(null);
  const previousTaskbarStyleRef = useRef(taskbarStyle);

  const openAppIds = useMemo(() => Array.from(new Set(windows.map((w) => w.appId))), [windows]);
  const allAppIds = useMemo(
    () => Array.from(new Set([...pinnedAppIds, ...openAppIds])),
    [openAppIds, pinnedAppIds],
  );

  // Helper to find the currently active window ID from the windows list
  // We can't just rely on `windows.find(w => w.isActive)` because multiple might be marked active in some stale state potentially,
  // but more importantly, we want to pass the explicit active ID to the children.
  // Actually, `windows` prop has the state.
  const activeWindow = [...windows]
    .filter((window) => window.isActive && !window.isMinimized)
    .sort((a, b) => b.zIndex - a.zIndex)[0];
  const activeWindowId = activeWindow ? activeWindow.id : null;

  useEffect(() => {
    windows.forEach((window) => {
      const button = buttonRefs.current[window.appId];
      if (button) {
        const rect = button.getBoundingClientRect();
        setButtonPosition(window.id, rect);
      }
    });
  }, [setButtonPosition, windows, taskbarStyle]);

  useIsomorphicLayoutEffect(() => {
    const row = itemsRowRef.current;
    if (!row) return;

    const currentRect = row.getBoundingClientRect();
    const previousRect = previousItemsRectRef.current;
    const previousStyle = previousTaskbarStyleRef.current;

    const isClassicModernToggle =
      (previousStyle === 'classic' && taskbarStyle === 'modern') ||
      (previousStyle === 'modern' && taskbarStyle === 'classic');

    if (isHydrated && previousRect && isClassicModernToggle) {
      const deltaX = previousRect.left - currentRect.left;

      if (Math.abs(deltaX) > 0.5) {
        row.style.transition = 'none';
        row.style.transform = `translateX(${deltaX}px)`;
        row.style.willChange = 'transform';

        requestAnimationFrame(() => {
          row.style.transition = 'transform 320ms cubic-bezier(0.22, 1, 0.36, 1)';
          row.style.transform = 'translateX(0)';
        });

        const cleanup = () => {
          row.style.transition = '';
          row.style.transform = '';
          row.style.willChange = '';
        };

        const handleTransitionEnd = (event: TransitionEvent) => {
          if (event.propertyName !== 'transform') return;
          row.removeEventListener('transitionend', handleTransitionEnd);
          cleanup();
        };

        row.addEventListener('transitionend', handleTransitionEnd);
        window.setTimeout(() => {
          row.removeEventListener('transitionend', handleTransitionEnd);
          cleanup();
        }, 420);
      }
    }

    previousItemsRectRef.current = currentRect;
    previousTaskbarStyleRef.current = taskbarStyle;
  }, [allAppIds.length, isHydrated, taskbarStyle]);

  const handleContextMenu: MouseEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation();
    event.preventDefault();
  };

  return (
    <div ref={ref} className={`taskbar ${taskbarStyle}`} onContextMenu={handleContextMenu}>
      
      <div ref={itemsContainerRef} className="taskbar-items-container">
        <div ref={itemsRowRef} className="taskbar-items">
           {/* Start Button / Launchpad */}
          <LaunchButton launcherVisible={launcherVisible} onClick={toggleLauncherVisibility} />

          {allAppIds.map((appId) => {
            const app = APP_MAP.get(appId);
            if (!app) return null;

            const appWindows = windows.filter((w) => w.appId === appId);
            const isOpen = appWindows.length > 0;
            // Is any window of this app active?
            const isActive = appWindows.some((window) => window.isActive && !window.isMinimized);
            const isPinned = pinnedAppIds.includes(appId);
            const windowIds = [...appWindows]
              .sort((a, b) => a.zIndex - b.zIndex)
              .map((window) => window.id);

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

      {taskbarStyle !== 'floating' && (
        <div className="taskbar-tray">
           <Clock />
        </div>
      )}
    </div>
  );
});

Taskbar.displayName = 'Taskbar';

export default Taskbar;
