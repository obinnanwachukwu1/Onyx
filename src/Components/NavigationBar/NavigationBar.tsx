import { forwardRef, type MouseEventHandler } from 'react';
import './NavigationBar.css';
import LaunchButton from './LaunchButton';
import { useWindowContext } from '../WindowContext';

interface NavigationBarProps {
  minimal?: boolean;
}

const NavigationBar = forwardRef<HTMLDivElement, NavigationBarProps>(({ minimal = false }, ref) => {
  const { toggleLauncherVisibility } = useWindowContext();

  const handleContextMenu: MouseEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation();
    event.preventDefault();
  };

  return (
    <div
      ref={ref}
      className={`navigation-bar ${minimal ? 'navigation-bar-minimal' : ''}`}
      onContextMenu={handleContextMenu}
    >
      {minimal ? (
        <button
          className="navigation-launcher-handle"
          onClick={toggleLauncherVisibility}
          aria-label="Open launcher"
        >
          <span className="navigation-launcher-pill" />
        </button>
      ) : (
        <LaunchButton onClick={toggleLauncherVisibility} />
      )}
    </div>
  );
});

NavigationBar.displayName = 'NavigationBar';

export default NavigationBar;
