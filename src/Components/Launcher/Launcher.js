import React, { useState, useEffect, useContext } from 'react';
import './Launcher.css';
import LauncherIcon from './LauncherIcon';
import { useWindowContext } from '../WindowContext';
import { DeviceContext } from '../DeviceContext';
import appList from '../../Apps/AppList';


const Launcher = () => {
  const {launcherVisible, closeLauncher, launchApp} = useWindowContext();
  const {isMobile} = useContext(DeviceContext);
  const [shouldRender, setShouldRender] = useState(launcherVisible);
  useEffect(() => {
    if (launcherVisible) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => setShouldRender(false), 500);
      return () => clearTimeout(timer);
    }
  }, [launcherVisible]);

  if (!shouldRender) return null;

  return (
    <div className={`launcher ${isMobile ? "launcher-mobile" : ""} ${launcherVisible ? "visible" : "hidden"}`}>
      <div className={`launcher-content ${isMobile ? "launcher-content-mobile" : ""}`}>
        <div className={`launcher-header ${isMobile ? "launcher-header-mobile" : ""}`}>
          <h2>Launcher</h2>
        </div>
        <div className={`launcher-body ${isMobile ? "launcher-body-mobile" : ""}`}>
          {appList.map((app) =>
              app.showInLauncher ? (
                  <LauncherIcon
                  key={app.id}
                  imageSrc={app.icon}
                  text={app.name}
                  onClick={() => {launchApp(app.id); closeLauncher();}}
                  />
              ) : null
          )}
        </div>
        <div className="launcher-footer">
        </div>
      </div>
    </div>
  );
};

export default Launcher;
