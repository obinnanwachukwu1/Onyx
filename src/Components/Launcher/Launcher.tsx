import { useEffect, useState } from 'react';
import './Launcher.css';
import LauncherIcon from './LauncherIcon';
import { useWindowContext } from '../WindowContext';
import { useDeviceContext } from '../DeviceContext';
import appList from '../../Apps/AppList';

const Launcher = (): JSX.Element | null => {
  const { launcherVisible, closeLauncher, launchApp } = useWindowContext();
  const { isMobile } = useDeviceContext();
  const [shouldRender, setShouldRender] = useState<boolean>(launcherVisible);

  useEffect(() => {
    if (launcherVisible) {
      setShouldRender(true);
      return;
    }

    const timer = window.setTimeout(() => setShouldRender(false), 500);
    return () => window.clearTimeout(timer);
  }, [launcherVisible]);

  if (!shouldRender) {
    return null;
  }

  return (
    <div className={`launcher ${isMobile ? 'launcher-mobile' : ''} ${launcherVisible ? 'visible' : 'hidden'}`}>
      <div className={`launcher-content ${isMobile ? 'launcher-content-mobile' : ''}`}>
        <div className={`launcher-header ${isMobile ? 'launcher-header-mobile' : ''}`}>
          <h2>Launcher</h2>
        </div>
        <div className={`launcher-body ${isMobile ? 'launcher-body-mobile' : ''}`}>
          {appList.map((app) =>
            app.showInLauncher ? (
              <LauncherIcon
                key={app.id}
                imageSrc={app.icon}
                text={app.name}
                onClick={() => {
                  launchApp(app.id);
                  closeLauncher();
                }}
              />
            ) : null,
          )}
        </div>
        <div className="launcher-footer" />
      </div>
    </div>
  );
};

export default Launcher;
