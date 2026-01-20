import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Dimensions } from '../types/windows';

export interface DeviceContextValue {
  isMobile: boolean;
  windowSize: Dimensions;
}

export const DeviceContext = createContext<DeviceContextValue | undefined>(undefined);

export const useDeviceContext = (): DeviceContextValue => {
  const context = useContext(DeviceContext);

  if (!context) {
    throw new Error('useDeviceContext must be used within a DeviceProvider');
  }

  return context;
};

const isMobileViewport = () => typeof window !== 'undefined' ? (window.innerWidth <= 768 || window.innerHeight <= 800) : false;

export const DeviceProvider = ({ children }: { children: ReactNode }): JSX.Element => {
  const [isMobile, setIsMobile] = useState<boolean>(isMobileViewport());
  const [windowSize, setWindowSize] = useState<Dimensions>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080,
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(isMobileViewport());
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const value = useMemo<DeviceContextValue>(() => ({ isMobile, windowSize }), [isMobile, windowSize]);

  return <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>;
};
