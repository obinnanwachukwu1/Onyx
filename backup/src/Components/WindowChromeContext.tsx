import React, { createContext, useContext } from 'react';

type WindowChromeContextValue = {
  sidebarActiveId?: string;
  setSidebarActiveId?: (id: string) => void;
  isWindowActive: boolean;
};

const WindowChromeContext = createContext<WindowChromeContextValue>({
  isWindowActive: true,
});

export const useWindowChrome = () => useContext(WindowChromeContext);

export const WindowChromeProvider = WindowChromeContext.Provider;

export default WindowChromeContext;

