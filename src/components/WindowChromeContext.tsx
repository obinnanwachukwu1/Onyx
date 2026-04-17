import { createContext, useContext, useEffect, useState } from 'react';

type WindowChromeContextValue = {
  sidebarActiveId?: string;
  setSidebarActiveId?: (id: string) => void;
  isWindowActive: boolean;
  shouldAnimateOnLaunch: boolean;
  consumeLaunchAnimation?: () => void;
  isInitialRevealPending: boolean;
  markInitialRevealReady?: () => void;
};

const WindowChromeContext = createContext<WindowChromeContextValue>({
  isWindowActive: true,
  shouldAnimateOnLaunch: false,
  isInitialRevealPending: false,
});

export const useWindowChrome = () => useContext(WindowChromeContext);

export const useWindowLaunchAnimation = () => {
  const { shouldAnimateOnLaunch, consumeLaunchAnimation } = useWindowChrome();
  const [playLaunchAnimation] = useState(shouldAnimateOnLaunch);

  useEffect(() => {
    if (!playLaunchAnimation) {
      return;
    }

    consumeLaunchAnimation?.();
  }, [consumeLaunchAnimation, playLaunchAnimation]);

  return playLaunchAnimation;
};

export const useWindowInitialReveal = () => {
  const { isInitialRevealPending, markInitialRevealReady } = useWindowChrome();

  return {
    isInitialRevealPending,
    markInitialRevealReady,
  };
};

export const WindowChromeProvider = WindowChromeContext.Provider;

export default WindowChromeContext;
