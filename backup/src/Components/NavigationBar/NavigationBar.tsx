import { forwardRef, type MouseEventHandler } from 'react';
import './NavigationBar.css';
import LaunchButton from './LaunchButton';
import { useWindowContext } from '../WindowContext';

const NavigationBar = forwardRef<HTMLDivElement>((_props, ref) => {
  const { toggleLauncherVisibility } = useWindowContext();

  const handleContextMenu: MouseEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation();
    event.preventDefault();
  };

  return (
    <div ref={ref} className="navigation-bar" onContextMenu={handleContextMenu}>
      <LaunchButton onClick={toggleLauncherVisibility} />
    </div>
  );
});

NavigationBar.displayName = 'NavigationBar';

export default NavigationBar;
