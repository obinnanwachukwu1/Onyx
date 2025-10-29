import { useRef, useState } from 'react';
import NavigationBar from './NavigationBar/NavigationBar';
import MobileDesktop from './MobileDesktop/MobileDesktop';
import appList from '../Apps/AppList';
import Window from './Window';
import Launcher from './Launcher/Launcher';
import { AppManagerContext } from './AppManagerContext';
import { WindowData } from '../types/windows';

const AppManager = (): JSX.Element => {
  const navigationBarRef = useRef<HTMLDivElement | null>(null);
  const [windows, setWindows] = useState<WindowData[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<number | null>(null);
  const [closingWindowID, setClosingWindowID] = useState<number>(-1);
  const [launcherVisible, setLauncherVisible] = useState<boolean>(false);
  const [zIndexCounter, setZIndexCounter] = useState<number>(1);

  const launchApp = (appId: string) => {
    const desktop = document.querySelector<HTMLElement>('.mobile-desktop');
    const navigationBarHeight = navigationBarRef.current?.clientHeight ?? 0;

    if (!desktop) {
      return;
    }

    const desktopBounds = desktop.getBoundingClientRect();
    const app = appList.find((entry) => entry.id === appId);

    if (!app) {
      return;
    }

    const newWindow: WindowData = {
      id: Date.now(),
      appId: app.id,
      appIcon: app.icon,
      title: app.name,
      content: app.component,
      position: { x: 0, y: 0 },
      restorePosition: { x: 0, y: 0 },
      size: { width: desktopBounds.width, height: desktopBounds.height - navigationBarHeight },
      restoreSize: { width: desktopBounds.width, height: desktopBounds.height - navigationBarHeight },
      isMaximized: false,
      isMinimized: false,
      isRestoringFromTaskbar: false,
      showInTaskbar: true,
      isActive: true,
      renderMobile: true,
      zIndex: zIndexCounter,
    };

    setZIndexCounter((previous) => previous + 1);
    setWindows((previousWindows) => {
      if (previousWindows.some((window) => window.id === newWindow.id)) {
        return previousWindows;
      }
      return [...previousWindows, newWindow];
    });
    if (activeWindowId !== null) {
      setClosingWindowID(activeWindowId);
    }
    setActiveWindowId(newWindow.id);
  };

  const toggleLauncherVisibility = () => {
    setLauncherVisible((previous) => !previous);
  };

  const closeLauncher = () => {
    setLauncherVisible(false);
  };

  const deactivateAll = () => {
    setLauncherVisible(false);
  };

  const activateWindow = (_windowId: number) => {
    // Mobile windows occupy the entire viewport, so activation is a no-op
  };

  const setWindowPosition = (_windowId: number, _position: WindowData['position']) => {
    // Mobile windows are always fullscreen; position changes are ignored
  };

  const setWindowSize = (_windowId: number, _size: WindowData['size']) => {
    // Mobile windows are always fullscreen; size changes are ignored
  };

  const sendIntentToClose = (id: number) => {
    if (closingWindowID === -1) {
      setClosingWindowID(id);
    }
  };

  const sendIntentToMaximize = (_windowId: number) => {
    // Mobile windows are already maximized
  };

  const sendIntentToRestore = (_windowId: number) => {
    // Mobile windows cannot be restored
  };

  const notifyClose = (id: number) => {
    setWindows((previousWindows) => previousWindows.filter((window) => window.id !== id));
    if (id === activeWindowId) {
      setActiveWindowId(null);
    }
    setClosingWindowID(-1);
  };

  const notifyMaximize = (_windowId: number) => {
    // Mobile windows are already maximized
  };

  const notifyMinimize = (_windowId: number) => {
    // Mobile windows cannot be minimized
  };

  const notifyRestore = (_windowId: number) => {
    // Mobile windows cannot be restored
  };

  const getTaskbarTransformPos = (_windowId: number) => {
    // Mobile view does not animate taskbar transitions
  };

  const afterRestoreFromTaskbar = (_windowId: number) => {
    // Mobile view does not support taskbar restore animations
  };

  return (
    <AppManagerContext.Provider
      value={{
        launchApp,
        launcherVisible,
        closeLauncher,
        toggleLauncherVisibility,
        closingWindowID,
        activateWindow,
        setWindowPosition,
        setWindowSize,
        sendIntentToClose,
        sendIntentToMaximize,
        sendIntentToRestore,
        notifyClose,
        notifyMaximize,
        notifyMinimize,
        notifyRestore,
        getTaskbarTransformPos,
        afterRestoreFromTaskbar,
        deactivateAll,
      }}
    >
      <MobileDesktop />
      {[...windows]
        .sort((a, b) => a.zIndex - b.zIndex)
        .map((window) => (!window.isMinimized ? <Window key={window.id} {...window} /> : null))}
      <NavigationBar ref={navigationBarRef} />
      <Launcher />
    </AppManagerContext.Provider>
  );
};

export default AppManager;
