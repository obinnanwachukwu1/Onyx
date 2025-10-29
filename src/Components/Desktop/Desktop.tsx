import { useEffect, useRef, type MouseEventHandler } from 'react';
import './Desktop.css';
import DesktopIcon from './DesktopIcon';
import appList from '../../Apps/AppList';
import { useWindowContext } from '../WindowContext';

const Desktop = (): JSX.Element => {
  const { launchApp, deactivateAll } = useWindowContext();
  const hasLaunched = useRef<boolean>(false);

  useEffect(() => {
    if (hasLaunched.current) {
      return;
    }

    const timer = window.setTimeout(() => {
      hasLaunched.current = true;
      launchApp('welcome-center');
    }, 1000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [launchApp]);

  const handleDesktopIconDoubleClick = (appId: string) => {
    launchApp(appId);
  };

  const handleMouseDown: MouseEventHandler<HTMLDivElement> = (event) => {
    deactivateAll?.(event.nativeEvent);
  };

  return (
    <div className="desktop" onMouseDown={handleMouseDown}>
      {appList.map((app) =>
        app.showOnDesktop ? (
          <DesktopIcon
            key={app.id}
            imageSrc={app.icon}
            text={app.name}
            handleDesktopIconDoubleClick={() => handleDesktopIconDoubleClick(app.id)}
          />
        ) : null,
      )}
    </div>
  );
};

export default Desktop;
