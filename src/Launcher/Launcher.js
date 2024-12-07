import React, { useState, useEffect, useContext } from 'react';
import './Launcher.css';
import LauncherIcon from './LauncherIcon';
import IconNotepad from "../assets/icons/IconNotepad.svg"
import Notepad from '../Apps/Notepad/Notepad';
import { WindowManagerContext } from '../Components/WindowManagerContext';
import appList from '../Apps/AppList';


const Launcher = () => {
  const {launcherVisible, closeLauncher, launchApp} = useContext(WindowManagerContext)
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
    <div className={`launcher ${launcherVisible ? "visible" : "hidden"}`}>
      <div className="launcher-content">
        <div className="launcher-header">
          <h2>Launcher</h2>
        </div>
        <div className="launcher-body">
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
