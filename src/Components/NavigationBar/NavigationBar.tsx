import { forwardRef, useEffect, useState, type MouseEventHandler } from 'react';
import './NavigationBar.css';
import LaunchButton from './LaunchButton';
import { useWindowContext } from '../WindowContext';

interface NavigationBarProps {
  minimal?: boolean;
}

const NavigationBar = forwardRef<HTMLDivElement, NavigationBarProps>(({ minimal = false }, ref) => {
  const { toggleLauncherVisibility, launcherVisible } = useWindowContext();
  const [isExpanded, setIsExpanded] = useState(!minimal);
  const showFullBar = !minimal || isExpanded || launcherVisible;

  useEffect(() => {
    if (!minimal) {
      setIsExpanded(true);
    }
  }, [minimal]);

  const handleContextMenu: MouseEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation();
    event.preventDefault();
  };

  return (
    <div
      ref={ref}
      className={`navigation-bar ${minimal && !showFullBar ? 'navigation-bar-minimal' : ''} ${minimal ? 'navigation-bar-overlay-control' : ''}`}
      onContextMenu={handleContextMenu}
    >
      {!showFullBar ? (
        <button
          className="navigation-launcher-handle"
          onClick={() => setIsExpanded(true)}
          aria-label="Show navigation bar"
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
