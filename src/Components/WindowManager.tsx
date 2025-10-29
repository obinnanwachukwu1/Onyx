// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import Window from './Window';
import Taskbar from './Taskbar/Taskbar';
import Desktop from './Desktop/Desktop';
import appList from '../Apps/AppList';
import Launcher from './Launcher/Launcher';

import { WindowManagerContext } from './WindowManagerContext';
import { WindowStartPosition } from '../types/windows';

const WindowManager = ({windowSize}) => {
    const taskbarRef = useRef(null)
    const [windows, setWindows] = useState([]);
    const [activeWindowId, setActiveWindowId] = useState(null);
    const [closingWindowID, setClosingWindowID] = useState(-1);
    const [buttonPositions, setButtonPositions] = useState({});
    const [launcherVisible, setLauncherVisible] = useState(false);
    const [zIndexCounter, setZIndexCounter] = useState(1);

    const launchApp = (appId) => {
        const app = appList.find((a) => a.id === appId);
        if (app) {
            const newWindow = {
                id: Date.now(),
                appId: app.id,
                appIcon: app.icon,
                title: app.name,
                content: app.component,
                size: app.initialSize || { width: 500, height: 500 },
                restoreSize: app.initialSize || { width: 500, height: 500 },
                isMaximized: false,
                isMinimized: false,
                isRestoringFromTaskbar: false,
                showInTaskbar: true,
                isActive: true,
                renderMobile: false,
                zIndex: zIndexCounter,
            };
            newWindow.position = app.initialPosition === WindowStartPosition.CENTERSCREEN ? {x: (windowSize.width - newWindow.size.width) / 2, y: (windowSize.height - newWindow.size.height) / 2 } : { x: 100, y: 100 },
            newWindow.restorePosition =  app.initialPosition === WindowStartPosition.CENTERSCREEN ? {x: (windowSize.width - newWindow.size.width) / 2, y: (windowSize.height - newWindow.size.height) / 2 } : { x: 100, y: 100 },
            setZIndexCounter(prev => prev + 1);
            setWindows((prevWindows) => {
                if (prevWindows.some((window) => window.id === newWindow.id)) {
                    return prevWindows;
                }
                return [...prevWindows, newWindow];
            });
            deactivateAll();
            activateWindow(newWindow.id)
        }
      };
      useEffect(() => {
        setWindows(prevWindows => 
            prevWindows.map(window => {
                let updatedWindow = { ...window };
                
                if (window.isMaximized) {
                    updatedWindow.size = {
                        width: windowSize.width,
                        height: windowSize.height - (taskbarRef.current?.clientHeight || 0)
                    };
                    updatedWindow.position = { x: 0, y: 0 };
                    return updatedWindow;
                }
                
                const rightEdge = window.position.x + window.size.width;
                const bottomEdge = window.position.y + window.size.height;
                
                if (rightEdge > windowSize.width || bottomEdge > windowSize.height) {
                    const newX = Math.max(0, Math.min(window.position.x, windowSize.width - window.size.width));
                    const newY = Math.max(0, Math.min(window.position.y, windowSize.height - window.size.height - (taskbarRef.current?.clientHeight || 0)));
                    
                    updatedWindow.position = { x: newX, y: newY };
                }
                
                return updatedWindow;
            })
        );
    }, [windowSize]);


    const activateWindow = (id) => {
        setLauncherVisible(false);
        setActiveWindowId(id);
        setZIndexCounter(prev => prev + 1);
        setWindows((prevWindows) =>
        prevWindows.map((window) =>
            window.id === id ? ( window.isMinimized ? 
            { ...window, isRestoringFromTaskbar: true, isMinimized: false, isActive: true, zIndex: zIndexCounter}
            : { ...window, isActive: true, zIndex: zIndexCounter}
            ) 
            : { ...window, isActive: false }
        )
        );
    };


    const deactivateAll = (e) => {
        // Check if click is inside launcher
        if (launcherVisible) {
            const launcherElement = document.querySelector('.launcher');
            if (e && launcherElement && launcherElement.contains(e.target)) {
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
        const desktop = document.querySelector('.desktop');
        const desktopBounds = desktop.getBoundingClientRect();
        document.documentElement.style.setProperty('--width', `${desktopBounds.width}px`);
        document.documentElement.style.setProperty('--height', `${desktopBounds.height - taskbarRef.current.clientHeight}px`);
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
        const dx = taskbarButtonPosition.left - windowPosition.x;
        const dy = taskbarButtonPosition.top - windowPosition.y;
        
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
        <WindowManagerContext.Provider value={{closingWindowID, launcherVisible, launchApp, activateWindow, deactivateAll, setWindowPosition, setWindowSize, sendIntentToMaximize, sendIntentToRestore, sendIntentToClose, notifyMaximize, notifyMinimize, notifyRestore, notifyClose, getTaskbarTransformPos, afterRestoreFromTaskbar, toggleLauncherVisibility, closeLauncher}}>
            <Desktop/>
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
            <Taskbar ref={taskbarRef} windows={windows} setButtonPosition={setButtonPosition}/>
            <Launcher/>
        </WindowManagerContext.Provider>
    );
};

export default WindowManager;