import { useEffect, useRef, useState } from 'react';
import NavigationBar from './NavigationBar/NavigationBar';
import MobileDesktop from './MobileDesktop/MobileDesktop';
import appList from '../Apps/AppList';
import Window from './Window';
import Launcher from './Launcher/Launcher';
import { AppManagerContext } from './AppManagerContext';
import { LauncherView, WindowData } from '../types/windows';

interface AppManagerProps {
  initialWindows?: WindowData[];
  blogFullscreen?: boolean;
}

const AppManager = ({ initialWindows = [], blogFullscreen = false }: AppManagerProps): JSX.Element => {
  const navigationBarRef = useRef<HTMLDivElement | null>(null);
  const [windows, setWindows] = useState<WindowData[]>(() => {
    const hydrated = initialWindows.map((window) => ({ ...window, renderMobile: true }));
    if (hydrated.some((window) => window.isActive)) {
      return hydrated;
    }

    const topWindow = [...hydrated].sort((a, b) => b.zIndex - a.zIndex)[0];
    if (!topWindow) {
      return hydrated;
    }

    return hydrated.map((window) => ({ ...window, isActive: window.id === topWindow.id }));
  });
  const [activeWindowId, setActiveWindowId] = useState<number | null>(() => {
    const active = initialWindows.find((window) => window.isActive)?.id;
    if (typeof active === 'number') {
      return active;
    }
    const topWindow = [...initialWindows].sort((a, b) => b.zIndex - a.zIndex)[0];
    return topWindow?.id ?? null;
  });
  const [closingWindowID, setClosingWindowID] = useState<number>(-1);
  const [launcherVisible, setLauncherVisible] = useState<boolean>(false);
  const [launcherView, setLauncherView] = useState<LauncherView>('apps');
  const [zIndexCounter, setZIndexCounter] = useState<number>(() => {
    const maxZIndex = initialWindows.reduce((max, window) => Math.max(max, window.zIndex), 0);
    return maxZIndex + 1;
  });

  const launchApp = (appId: string) => {
    const desktop = document.querySelector<HTMLElement>('.mobile-desktop');
    // Navigation bar is fixed height (see NavigationBar.css)
    const FALLBACK_NAV_HEIGHT = 50;
    const navigationBarHeight = blogFullscreen ? 0 : (navigationBarRef.current?.clientHeight ?? FALLBACK_NAV_HEIGHT);

    if (!desktop) {
      return;
    }

    const desktopBounds = desktop.getBoundingClientRect();
    const app = appList.find((entry) => entry.id === appId);

    if (!app) {
      return;
    }

    // Mobile launcher opens a single instance per app; re-focus existing window.
    const existingWindow = [...windows]
      .filter((window) => window.appId === appId)
      .sort((a, b) => b.zIndex - a.zIndex)[0];

    if (existingWindow) {
      activateWindow(existingWindow.id);
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
      sidebar: app.sidebar ? { items: app.sidebar.items, footer: app.sidebar.footer } : undefined,
      sidebarActiveId: app.sidebar?.initialActiveId || (app.sidebar?.items?.[0]?.id ?? undefined),
    };

    setZIndexCounter((previous) => previous + 1);
    setWindows((previousWindows) => {
      if (previousWindows.some((window) => window.id === newWindow.id)) {
        return previousWindows;
      }
      return [
        ...previousWindows.map((window) => ({ ...window, isActive: false })),
        newWindow,
      ];
    });
    setActiveWindowId(newWindow.id);
  };

  const openLauncher = (view: LauncherView = 'apps') => {
    setLauncherView(view);
    setLauncherVisible(true);
  };

  const closeLauncher = () => {
    setLauncherVisible(false);
  };

  const toggleLauncherVisibility = () => {
    if (launcherVisible) {
      closeLauncher();
      return;
    }
    openLauncher('apps');
  };

  const deactivateAll = () => {
    setLauncherVisible(false);
  };

  const activateWindow = (windowId: number) => {
    setLauncherVisible(false);
    setZIndexCounter((previous) => {
      const nextZIndex = previous + 1;
      setWindows((previousWindows) =>
        previousWindows.map((window) =>
          window.id === windowId
            ? { ...window, isActive: true, isMinimized: false, zIndex: nextZIndex }
            : { ...window, isActive: false }
        )
      );
      return nextZIndex;
    });
    setActiveWindowId(windowId);
  };

  const setWindowPosition = (_windowId: number, _position: WindowData['position']) => {
    // Mobile windows are always fullscreen; position changes are ignored
  };

  const setWindowSize = (_windowId: number, _size: WindowData['size']) => {
    // Mobile windows are always fullscreen; size changes are ignored
  };

  const setWindowTitle = (windowId: number, title: string) => {
    setWindows((previousWindows) =>
      previousWindows.map((window) => (window.id === windowId ? { ...window, title } : window))
    );
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
    setWindows((previousWindows) => {
      const remainingWindows = previousWindows.filter((window) => window.id !== id);
      const nextActiveWindow = [...remainingWindows]
        .filter((window) => !window.isMinimized)
        .sort((a, b) => b.zIndex - a.zIndex)[0];
      const nextActiveId = nextActiveWindow?.id ?? null;

      setActiveWindowId(nextActiveId);

      return remainingWindows.map((window) => ({
        ...window,
        isActive: nextActiveId !== null && window.id === nextActiveId,
      }));
    });
    setClosingWindowID(-1);
  };

  const notifyMaximize = (_windowId: number) => {
    // Mobile windows are already maximized
  };

  const notifyMinimize = (windowId: number, _animateFromTaskbar = false) => {
    setWindows((previousWindows) => {
      const updatedWindows = previousWindows.map((window) =>
        window.id === windowId ? { ...window, isMinimized: true, isActive: false } : window
      );

      const nextActiveWindow = [...updatedWindows]
        .filter((window) => !window.isMinimized)
        .sort((a, b) => b.zIndex - a.zIndex)[0];
      const nextActiveId = nextActiveWindow?.id ?? null;

      setActiveWindowId(nextActiveId);

      return updatedWindows.map((window) => ({
        ...window,
        isActive: nextActiveId !== null && window.id === nextActiveId,
      }));
    });
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

  useEffect(() => {
    const desktop = document.querySelector<HTMLElement>('.mobile-desktop');
    if (!desktop || windows.length === 0) {
      return;
    }

    const FALLBACK_NAV_HEIGHT = 50;
    const navigationBarHeight = blogFullscreen ? 0 : (navigationBarRef.current?.clientHeight ?? FALLBACK_NAV_HEIGHT);
    const desktopBounds = desktop.getBoundingClientRect();

    setWindows((previousWindows) =>
      previousWindows.map((window) => ({
        ...window,
        renderMobile: true,
        position: { x: 0, y: 0 },
        restorePosition: { x: 0, y: 0 },
        size: { width: desktopBounds.width, height: desktopBounds.height - navigationBarHeight },
        restoreSize: { width: desktopBounds.width, height: desktopBounds.height - navigationBarHeight },
      }))
    );
  }, [blogFullscreen]);

  return (
    <AppManagerContext.Provider
      value={{
        launchApp,
        launcherVisible,
        launcherView,
        windows,
        activeWindowId,
        openLauncher,
        closeLauncher,
        toggleLauncherVisibility,
        closingWindowID,
        activateWindow,
        setWindowPosition,
        setWindowSize,
        setWindowTitle,
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
      <MobileDesktop disableAutoStart={initialWindows.length > 0} />
      {[...windows]
        .sort((a, b) => a.zIndex - b.zIndex)
        .map((window) => (!window.isMinimized ? <Window key={window.id} {...window} renderMobile={true} /> : null))}
      <NavigationBar
        ref={navigationBarRef}
        minimal={blogFullscreen}
        windows={windows}
        activeWindowId={activeWindowId}
        onActivateWindow={activateWindow}
        onCloseWindow={sendIntentToClose}
        onMinimizeWindow={notifyMinimize}
      />
      <Launcher />
    </AppManagerContext.Provider>
  );
};

export default AppManager;
