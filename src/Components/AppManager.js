import React, {useState, useRef}from 'react';
import NavigationBar from './NavigationBar/NavigationBar';
import MobileDesktop from './MobileDesktop/MobileDesktop';
import appList from '../Apps/AppList';
import Window from './Window';
import Launcher from './Launcher/Launcher';
import { AppManagerContext } from './AppManagerContext';

const AppManager = () => {
    const navigationBarRef = useRef(null)
    const [windows, setWindows] = useState([]);
    const [activeWindowId, setActiveWindowId] = useState(null);
    const [closingWindowID, setClosingWindowID] = useState(-1);
    const [buttonPositions, setButtonPositions] = useState({});
    const [launcherVisible, setLauncherVisible] = useState(false);
    const [zIndexCounter, setZIndexCounter] = useState(1);

    const launchApp = (appId) => {
        const desktop = document.querySelector('.mobile-desktop');
        const desktopBounds = desktop.getBoundingClientRect();
        
        const app = appList.find((a) => a.id === appId);
        if (app) {
            const newWindow = {
                id: Date.now(),
                appId: app.id,
                appIcon: app.icon,
                title: app.name,
                content: app.component,
                position: { x: 0, y: 0 },
                restorePosition: { x: 0, y: 0 },
                size: { width: desktopBounds.width, height: desktopBounds.height - navigationBarRef.current.clientHeight },
                restoreSize: { width: desktopBounds.width, height: desktopBounds.height - navigationBarRef.current.clientHeight },
                isMaximized: false,
                isMinimized: false,
                isRestoringFromTaskbar: false,
                showInTaskbar: true,
                isActive: true,
                renderMobile: true,
                zIndex: zIndexCounter,
            };
            setZIndexCounter(prev => prev + 1);
            setWindows((prevWindows) => {
                if (prevWindows.some((window) => window.id === newWindow.id)) {
                    return prevWindows;
                }
                return [...prevWindows, newWindow];
            });
            setClosingWindowID(activeWindowId)
            setActiveWindowId(newWindow.id)
        }
      };

    const toggleLauncherVisibility = () => {
        setLauncherVisible(!launcherVisible);
    };
    const closeLauncher = () => {
        setLauncherVisible(false);
    };

    // Activates/focuses a window
    const activateWindow = (windowId) => {
    // Activate window logic
    };

    // Updates window position coordinates
    const setWindowPosition = (windowId, position) => {
    // Set position logic  
    };

    // Updates window dimensions
    const setWindowSize = (windowId, size) => {
    // Set size logic
    };

    // Signals window should close
    const sendIntentToClose = (id) => {
        if (closingWindowID === -1) {
            setClosingWindowID(id);
        }
    };

    // Signals window should maximize
    const sendIntentToMaximize = (windowId) => {
    // Maximize intent logic
    };

    // Signals window should restore
    const sendIntentToRestore = (windowId) => {
    // Restore intent logic
    };

    // Handles window close completion
    const notifyClose = (id) => {
        setWindows((prevWindows) => prevWindows.filter((window) => window.id !== id));
        if (id === activeWindowId) setActiveWindowId(null);
        setClosingWindowID(-1);
    };

    // Handles window maximize completion  
    const notifyMaximize = (windowId) => {
    // Maximize notification logic
    };

    // Handles window minimize completion
    const notifyMinimize = (windowId) => {
    // Minimize notification logic
    };

    // Handles window restore completion
    const notifyRestore = (windowId) => {
    // Restore notification logic
    };

    // Gets taskbar transform position
    const getTaskbarTransformPos = (windowId) => {
    // Get transform position logic
    };

    // Handles post-restore from taskbar
    const afterRestoreFromTaskbar = (windowId) => {
    // After restore logic
    };


    return (
        <AppManagerContext.Provider value={{launchApp, launcherVisible, closeLauncher, toggleLauncherVisibility, closingWindowID, activateWindow, setWindowPosition, setWindowSize, sendIntentToClose, sendIntentToMaximize, sendIntentToRestore, notifyClose, notifyMaximize, notifyMinimize, notifyRestore, getTaskbarTransformPos, afterRestoreFromTaskbar}}>
            <MobileDesktop />
            {[...windows] // Create a copy of windows array
                .sort((a, b) => a.zIndex - b.zIndex) // Sort by zIndex
                .map((window) =>
                    !window.isMinimized ? (
                        <Window
                            key={window.id}
                            {...window}
                        />
                    ) : null
                )}
            <NavigationBar ref={navigationBarRef}/>
            <Launcher />
        </AppManagerContext.Provider>
    );
};

export default AppManager;