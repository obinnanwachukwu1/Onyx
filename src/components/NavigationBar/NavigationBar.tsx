import { forwardRef, useMemo, type MouseEventHandler } from 'react';
import './NavigationBar.css';
import LaunchButton from './LaunchButton';
import { useWindowContext } from '../WindowContext';
import { WindowData } from '../../types/windows';
import { Layers3 } from 'lucide-react';

interface NavigationBarProps {
  minimal?: boolean;
  animateIn?: boolean;
  windows?: WindowData[];
  activeWindowId?: number | null;
  onActivateWindow?: (windowId: number) => void;
  onCloseWindow?: (windowId: number) => void;
  onMinimizeWindow?: (windowId: number) => void;
  onExitImmersive?: () => void;
}

const NavigationBar = forwardRef<HTMLDivElement, NavigationBarProps>(({ minimal = false, animateIn = false, windows = [], onExitImmersive }, ref) => {
  const { openLauncher, closeLauncher, launcherVisible, launcherView } = useWindowContext();

  const runningWindows = useMemo(() => {
    return [...windows]
      .filter((window) => window.showInTaskbar)
      .sort((a, b) => b.zIndex - a.zIndex);
  }, [windows]);

  const handleContextMenu: MouseEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation();
    event.preventDefault();
  };

  if (minimal && onExitImmersive) {
    return (
      <div
        ref={ref}
        className="navigation-bar navigation-bar-overlay-control navigation-bar-minimal"
        onContextMenu={handleContextMenu}
      >
        <button
          className="navigation-immersive-handle"
          type="button"
          onClick={onExitImmersive}
          aria-label="Exit immersive mode and show taskbar"
        >
          <span className="navigation-immersive-line" aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={`navigation-bar ${minimal ? 'navigation-bar-overlay-control' : ''} ${animateIn ? 'navigation-bar-animate-in' : ''}`}
      onContextMenu={handleContextMenu}
    >
      <div className="navigation-dock-shell">
        <div className="navigation-mobile-controls">
          <LaunchButton
            onClick={() => {
              if (launcherVisible && launcherView === 'apps') {
                closeLauncher();
                return;
              }
              openLauncher('apps');
            }}
          />

          <button
            className={`navigation-running-toggle ${launcherVisible && launcherView === 'running' ? 'active' : ''}`}
            onClick={() => {
              if (launcherVisible && launcherView === 'running') {
                closeLauncher();
                return;
              }
              openLauncher('running');
            }}
            aria-label="Toggle running apps"
          >
            <Layers3 size={16} />
            {runningWindows.length ? <span className="navigation-running-toggle-count">{runningWindows.length}</span> : null}
          </button>
        </div>
      </div>
    </div>
  );
});

NavigationBar.displayName = 'NavigationBar';

export default NavigationBar;
