// @ts-nocheck
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Window from './Window';
import Taskbar from './Taskbar/Taskbar';
import Desktop from './Desktop/Desktop';
import appList from '../Apps/AppList';
import Launcher from './Launcher/Launcher';

import { WindowManagerContext } from './WindowManagerContext';
import { LauncherView, WindowStartPosition } from '../types/windows';
import { useTaskbar } from './Taskbar/TaskbarContext';

const WindowManager = ({ windowSize, initialWindows = [], focusMode: initialFocusMode = false, blogFullscreen = false }) => {
    const taskbarRef = useRef(null)
    const { taskbarStyle } = useTaskbar();
    const [windows, setWindows] = useState(initialWindows);
    const [immersiveMode, setImmersiveMode] = useState(blogFullscreen);
    const [activeWindowId, setActiveWindowId] = useState(null);
    const [closingWindowID, setClosingWindowID] = useState(-1);
    const [buttonPositions, setButtonPositions] = useState({});
    const [launcherVisible, setLauncherVisible] = useState(false);
    const [launcherView, setLauncherView] = useState<LauncherView>('apps');
    const [zIndexCounter, setZIndexCounter] = useState(1);
    const [taskbarReservedHeight, setTaskbarReservedHeight] = useState(0);
    
    // Focus mode state - can be exited by user interaction
    const [focusMode, setFocusMode] = useState(initialFocusMode);
    
    // Exit focus mode and enable animations
    const exitFocusMode = useCallback(() => {
        if (focusMode) {
            setFocusMode(false);
        }
    }, [focusMode]);

    const getTaskbarReservedHeight = useCallback(() => {
        if (immersiveMode) return 0;
        const taskbarElement = taskbarRef.current;
        if (!taskbarElement) return 0;

        const taskbarRect = taskbarElement.getBoundingClientRect();
        const viewportHeight = windowSize?.height || window.innerHeight;
        return Math.max(0, Math.round(viewportHeight - taskbarRect.top));
    }, [immersiveMode, windowSize?.height]);

    const syncTaskbarMetrics = useCallback(() => {
        const reservedHeight = getTaskbarReservedHeight();
        setTaskbarReservedHeight((prevHeight) => (prevHeight === reservedHeight ? prevHeight : reservedHeight));
        document.documentElement.style.setProperty('--taskbar-height', `${reservedHeight}px`);
    }, [getTaskbarReservedHeight]);

    useEffect(() => {
        syncTaskbarMetrics();
    }, [syncTaskbarMetrics, taskbarStyle, immersiveMode]);

    useEffect(() => {
        const handleResize = () => syncTaskbarMetrics();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [syncTaskbarMetrics]);

    useEffect(() => {
        if (immersiveMode) return;

        const taskbarElement = taskbarRef.current;
        if (!taskbarElement || typeof ResizeObserver === 'undefined') return;

        const resizeObserver = new ResizeObserver(() => syncTaskbarMetrics());
        resizeObserver.observe(taskbarElement);
        const raf = window.requestAnimationFrame(() => syncTaskbarMetrics());

        return () => {
            resizeObserver.disconnect();
            window.cancelAnimationFrame(raf);
        };
    }, [immersiveMode, syncTaskbarMetrics, taskbarStyle]);

    const launchApp = (appId, props = {}) => {
        const app = appList.find((a) => a.id === appId);
        if (app) {
            const content = React.isValidElement(app.component) 
                ? React.cloneElement(app.component, props) 
                : app.component;

            const newWindow = {
                id: Date.now(),
                appId: app.id,
                appIcon: app.icon,
                title: app.name,
                content: content,
                size: app.initialSize || { width: 500, height: 500 },
                restoreSize: app.initialSize || { width: 500, height: 500 },
                isMaximized: false,
                isMinimized: false,
                minimizing: false,
                isRestoringFromTaskbar: false,
                showInTaskbar: true,
                isActive: true,
                renderMobile: false,
                zIndex: zIndexCounter,
                hideDesktopChrome: immersiveMode,
                fullViewportWhenMaximized: immersiveMode,
                sidebar: app.sidebar ? { items: app.sidebar.items, footer: app.sidebar.footer } : undefined,
                sidebarActiveId: app.sidebar?.initialActiveId || (app.sidebar?.items?.[0]?.id ?? undefined),
            };
            newWindow.position = app.initialPosition === WindowStartPosition.CENTERSCREEN ? { x: (windowSize.width - newWindow.size.width) / 2, y: (windowSize.height - newWindow.size.height) / 2 } : { x: 100, y: 100 },
                newWindow.restorePosition = app.initialPosition === WindowStartPosition.CENTERSCREEN ? { x: (windowSize.width - newWindow.size.width) / 2, y: (windowSize.height - newWindow.size.height) / 2 } : { x: 100, y: 100 },
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
                        height: windowSize.height - taskbarReservedHeight
                    };
                    updatedWindow.position = { x: 0, y: 0 };
                    return updatedWindow;
                }

                const rightEdge = window.position.x + window.size.width;
                const bottomEdge = window.position.y + window.size.height;

                if (rightEdge > windowSize.width || bottomEdge > windowSize.height) {
                    const newX = Math.max(0, Math.min(window.position.x, windowSize.width - window.size.width));
                    const newY = Math.max(0, Math.min(window.position.y, windowSize.height - window.size.height - taskbarReservedHeight));

                    updatedWindow.position = { x: newX, y: newY };
                }

                return updatedWindow;
            })
        );
    }, [windowSize, taskbarReservedHeight]);


    const activateWindow = (id) => {
        setLauncherVisible(false);
        setActiveWindowId(id);
        setZIndexCounter(prev => prev + 1);
        setWindows((prevWindows) =>
            prevWindows.map((window) =>
                window.id === id ? (window.isMinimized ?
                    { ...window, isRestoringFromTaskbar: true, isMinimized: false, minimizing: false, isActive: true, zIndex: zIndexCounter }
                    : { ...window, minimizing: false, isActive: true, zIndex: zIndexCounter }
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

    const setWindowTitle = (id, newTitle) => {
        setWindows((prevWindows) =>
            prevWindows.map((window) =>
                window.id === id ? { ...window, title: newTitle } : window
            )
        );
    };

    const sendIntentToMaximize = () => {
        const desktop = document.querySelector('.desktop');
        const desktopBounds = desktop.getBoundingClientRect();
        document.documentElement.style.setProperty('--width', `${desktopBounds.width}px`);
        document.documentElement.style.setProperty('--height', `${desktopBounds.height - taskbarReservedHeight}px`);
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
                        ? { ...window, showInTaskbar: false }
                        : window
                )
            );
        }
    };


    const notifyMaximize = (id) => {
        setWindows((prevWindows) =>
            prevWindows.map((w) =>
                w.id === id ? { ...w, isMaximized: true, size: { width: window.innerWidth, height: (window.innerHeight - taskbarReservedHeight) }, position: { x: 0, y: 0 } } : w
            )
        );
    }

    const notifyMinimize = (id, animateFromTaskbar = false) => {
        exitFocusMode();
        const setNextActiveWindow = (windowList) => {
            const nextActiveWindow = [...windowList]
                .filter((window) => !window.isMinimized && !window.minimizing)
                .sort((a, b) => b.zIndex - a.zIndex)[0];
            const nextActiveId = nextActiveWindow?.id ?? null;
            setActiveWindowId(nextActiveId);
            return windowList.map((window) => ({
                ...window,
                isActive: nextActiveId !== null && window.id === nextActiveId,
            }));
        };

        if (animateFromTaskbar) {
            setWindows((prevWindows) => {
                const animatingWindows = prevWindows.map((window) =>
                    window.id === id
                        ? { ...window, minimizing: true, isActive: false }
                        : window
                );
                return setNextActiveWindow(animatingWindows);
            });

            window.setTimeout(() => {
                setWindows((prevWindows) => {
                    const minimizedWindows = prevWindows.map((window) =>
                        window.id === id
                            ? { ...window, isMinimized: true, minimizing: false, isActive: false }
                            : window
                    );
                    return setNextActiveWindow(minimizedWindows);
                });
            }, 250);
            return;
        }

        setWindows((prevWindows) => {
            const minimizedWindows = prevWindows.map((window) =>
                window.id === id
                    ? { ...window, isMinimized: true, minimizing: false, isActive: false }
                    : window
            );
            return setNextActiveWindow(minimizedWindows);
        });
    };

    const notifyRestore = (id) => {
        exitFocusMode();
        const restoredWindow = windows.find((w) => w.id === id);
        const shouldExitImmersive = immersiveMode || !!(restoredWindow?.hideDesktopChrome || restoredWindow?.fullViewportWhenMaximized);
        setWindows((prevWindows) =>
            prevWindows.map((w) =>
                w.id === id
                    ? (() => {
                        return {
                            ...w,
                            isMaximized: false,
                            size: w.restoreSize,
                            position: w.restorePosition,
                            hideDesktopChrome: false,
                            fullViewportWhenMaximized: false,
                        };
                    })()
                    : w
            )
        );
        if (shouldExitImmersive) {
            setImmersiveMode(false);
        }
    }

    const notifyClose = (id) => {
        exitFocusMode();
        setWindows((prevWindows) => prevWindows.filter((window) => window.id !== id));
        if (id === activeWindowId) setActiveWindowId(null);
        setClosingWindowID(-1);
    };

    const setButtonPosition = useCallback((id, position) => {
        setButtonPositions((prevPositions) => {
            const prev = prevPositions[id];
            if (
                prev &&
                prev.left === position.left &&
                prev.top === position.top &&
                prev.width === position.width &&
                prev.height === position.height
            ) {
                return prevPositions;
            }
            return {
                ...prevPositions,
                [id]: position,
            };
        });
    }, []);

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

    const openLauncher = (view: LauncherView = 'apps') => {
        setLauncherView(view);
        if (!launcherVisible) {
            deactivateAll();
        }
        setLauncherVisible(true);
    };

    const toggleLauncherVisibility = () => {
        if (launcherVisible) {
            setLauncherVisible(false);
            return;
        }
        openLauncher('apps');
    };
    const closeLauncher = () => {
        setLauncherVisible(false);
    };

    return (
        <WindowManagerContext.Provider value={{ closingWindowID, launcherVisible, launcherView, windows, activeWindowId, focusMode, exitFocusMode, launchApp, activateWindow, deactivateAll, setWindowPosition, setWindowSize, setWindowTitle, sendIntentToMaximize, sendIntentToRestore, sendIntentToClose, notifyMaximize, notifyMinimize, notifyRestore, notifyClose, getTaskbarTransformPos, afterRestoreFromTaskbar, openLauncher, toggleLauncherVisibility, closeLauncher }}>
            <Desktop focusMode={focusMode} disableAutoStart={initialWindows.length > 0} />
            {[...windows] // Create a copy of windows array
                .sort((a, b) => a.zIndex - b.zIndex) // Sort by zIndex
                .map((window) =>
                    !window.isMinimized ? (
                        <Window
                            key={window.id}
                            {...window}
                            focusMode={focusMode}
                            hideDesktopChrome={window.hideDesktopChrome || immersiveMode}
                            fullViewportWhenMaximized={window.fullViewportWhenMaximized || immersiveMode}
                        />
                    ) : null
                )}
            {!immersiveMode ? <Taskbar ref={taskbarRef} windows={windows} setButtonPosition={setButtonPosition} /> : null}
            {!immersiveMode ? <Launcher /> : null}
        </WindowManagerContext.Provider>
    );
};

export default WindowManager;
