import React, { useState, useEffect, useContext } from 'react';
import './Desktop.css'
import DesktopIcon from './DesktopIcon';
import Launcher from '../Launcher/Launcher';
import Taskbar from '../Taskbar/Taskbar';
import WindowManager from '../Components/WindowManager';
import appList from '../Apps/AppList';
import { WindowManagerContext } from '../Components/WindowManagerContext';

const Desktop = () => {
    const [launched, setLaunched] = useState(false);
    const [isLauncherVisible, setIsLauncherVisible] = useState(false);
    const {launchApp, deactivateAll} = useContext(WindowManagerContext);
    
    const hasLaunched = React.useRef(false);
    useEffect(() => {
      if (!hasLaunched.current) {
      hasLaunched.current = true;
      setTimeout(() => {
        launchApp("welcome-center");
      }, 1000);
      }
    }, []);
  
    const handleDesktopIconDoubleClick = (appId) => {
      launchApp(appId);
    };

    return (
        <div className="desktop" onMouseDown={deactivateAll}>
            {appList.map((app) =>
            app.showOnDesktop ? (
                <DesktopIcon
                key={app.id}
                imageSrc={app.icon}
                text={app.name}
                handleDesktopIconDoubleClick={() => handleDesktopIconDoubleClick(app.id)}
                />
            ) : null
            )}
        </div>        
    )
}
export default Desktop;
