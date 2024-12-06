
import React, { useState, useEffect, useRef } from 'react';
import Window from './Window';
import Taskbar from '../Taskbar/Taskbar';
import Desktop from '../Desktop/Desktop';
import appList from '../Apps/AppList';
import Launcher from '../Launcher/Launcher';

import { WindowManagerContext } from './WindowManagerContext';

const WindowManager = () => {
    const taskbarRef = useRef(null)
    const [windows, setWindows] = useState([]);
    const [activeWindowId, setActiveWindowId] = useState(null);
    const [closingWindowID, setClosingWindowID] = useState(-1);
    const [buttonPositions, setButtonPositions] = useState({});
    const [launcherVisible, setLauncherVisible] = useState(false);

    const launchApp = (appId) => {
        const app = appList.find((a) => a.id === appId);
        if (app) {
            const newWindow = {
                id: Date.now(),
                appId: app.id,
                title: app.name,
                content: app.component,
                position: app.initialPosition || { x: 100, y: 100 },
                restorePosition: app.initialPosition || { x: 100, y: 100 },
                size: app.initialSize || { width: 500, height: 500 },
                restoreSize: app.initialSize || { width: 500, height: 500 },
                isMaximized: false,
                isMinimized: false,
                isRestoringFromTaskbar: false,
                showInTaskbar: true,
                isActive: true,
            };
            setWindows((prevWindows) => {
                if (prevWindows.some((window) => window.id === newWindow.id)) {
                    return prevWindows;
                }
                return [...prevWindows, newWindow];
            });
            setActiveWindowId(newWindow.id);
        }
      };

    const activateWindow = (id) => {
        // setLauncherVisible(false);
        setActiveWindowId(id);
        setWindows((prevWindows) =>
        prevWindows.map((window) =>
            window.id === id ? ( window.isMinimized ? 
            { ...window, isRestoringFromTaskbar: true, isMinimized: false, isActive: true} 
            : { ...window, isActive: true}
            ) 
            : { ...window, isActive: false }
        )
        );
    };


    const deactivateAll = (e) => {
        // // Check if the click is inside an active context menu
        // if (contextMenu && contextMenu.visible) {
        // const contextMenuElement = document.querySelector('.context-menu');
        // if (contextMenuElement && contextMenuElement.contains(e.target)) {
        //     return;
        // }
        // }
        // Check if click is inside launcher
        if (launcherVisible) {
            const launcherElement = document.querySelector('.launcher');
            if (launcherElement && launcherElement.contains(e.target)) {
                return;
            }
        }

        setActiveWindowId(null);
        // setContextMenu(null);
        setLauncherVisible(false);
        setWindows((prevWindows) =>
        prevWindows.map((window) => ({
            ...window,
            isActive: false,
        }))
        );
    };

    const setWindowPosition = (id, newPosition) => {
        setWindows((prevWindows) =>
            prevWindows.map((window) =>
            window.id === id ? { ...window, position: newPosition, restorePosition: newPosition } : window
            )
        );
    };

    const setWindowSize = (id, newSize) => {
        setWindows((prevWindows) =>
            prevWindows.map((window) =>
            window.id === id ? { ...window, size: newSize, restoreSize: newSize } : window
            )
        );
    };

    const sendIntentToMaximize = ()=> {
        document.documentElement.style.setProperty('--width', `${window.innerWidth}px`);
        document.documentElement.style.setProperty('--height', `${window.innerHeight - taskbarRef.current.clientHeight}px`);
    }

    const sendIntentToRestore = (id) => {
        const sz = windows.find((window) => window.id === id).restoreSize;
        const pos = windows.find((window) => window.id === id).restorePosition;
        console.log(pos);

        document.documentElement.style.setProperty('--width', `${sz.width}px`);
        document.documentElement.style.setProperty('--height', `${sz.height}px`);
        document.documentElement.style.setProperty('--dx', `${pos.x}px`);
        document.documentElement.style.setProperty('--dy', `${pos.y}px`);
    }

    const sendIntentToClose = (id) => {
        if (closingWindowID === -1) {
        setClosingWindowID(id);
        setWindows((prevWindows) =>
            prevWindows.map((window) =>
            window.id === id
                ? { ...window, showInTaskbar: false}
                : window
            )
        );
        }
    };


    const notifyMaximize = (id) => {
        setWindows((prevWindows) =>
            prevWindows.map((w) =>
            w.id === id ? { ...w, isMaximized: true, size: {width: window.innerWidth, height: (window.innerHeight - taskbarRef.current.clientHeight)}, position: {x: 0, y: 0}} : w
            )
        );
    }

    const notifyMinimize = (id) => {
        setWindows((prevWindows) =>
            prevWindows.map((window) =>
                window.id === id ? { ...window, isMinimized: true, minimizing: false } : window
            )
        );
    };

    const notifyRestore = (id) => {
        setWindows((prevWindows) =>
            prevWindows.map((w) =>
            w.id === id ? { ...w, isMaximized: false, size: w.restoreSize, position: w.restorePosition} : w
            )
        );
    }

    const notifyClose = (id) => {
        setWindows((prevWindows) => prevWindows.filter((window) => window.id !== id));
        if (id === activeWindowId) setActiveWindowId(null);
        setClosingWindowID(-1);
    };

    const setButtonPosition = (id, position) => {
        setButtonPositions((prevPositions) => ({
          ...prevPositions,
          [id]: position,
        }));
      };

    const getTaskbarTransformPos = (id) => {
        const taskbarButtonPosition = buttonPositions[id];
        const windowPosition = windows.find((window) => window.id === id).position;

        // Calculate the distance to animate
        const dx = taskbarButtonPosition.left - windowPosition.x;
        const dy = taskbarButtonPosition.top - windowPosition.y;
        
        // Add a CSS variable to handle the transform values
        document.documentElement.style.setProperty('--dx', `${dx}px`);
        document.documentElement.style.setProperty('--dy', `${dy}px`);
    };

    const afterRestoreFromTaskbar = (id, val) => {
        setWindows((prevWindows) =>
          prevWindows.map((window) =>
            window.id === id ? { ...window, isRestoringFromTaskbar: false } : window
          )
        );
    }

    const toggleLauncherVisibility = () => {
        if (!launcherVisible) {
            deactivateAll();
        }
        setLauncherVisible(!launcherVisible);
      };
    const closeLauncher = () => {
        setLauncherVisible(false);
      };

    return (
        <WindowManagerContext.Provider value={{closingWindowID, launcherVisible, launchApp, activateWindow, deactivateAll, notifyClose, setWindowPosition, setWindowSize, sendIntentToMaximize, sendIntentToRestore, sendIntentToClose, notifyMaximize, notifyMinimize, notifyRestore, notifyClose, getTaskbarTransformPos, afterRestoreFromTaskbar, toggleLauncherVisibility, closeLauncher}}>
            <Desktop/>
            {windows.map((window) =>
                    !window.isMinimized ? (
                    <Window
                        key={window.id}
                        {...window}
                    />
                    ) : null
                )}
            <Taskbar ref={taskbarRef} windows={windows} setButtonPosition={setButtonPosition}/>
            <Launcher/>
        </WindowManagerContext.Provider>
    );
};

export default WindowManager;