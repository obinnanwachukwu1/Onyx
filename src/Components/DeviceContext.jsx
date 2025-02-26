import React, { createContext, useState, useEffect } from 'react';
import {isMobile} from 'react-device-detect';

export const DeviceContext = createContext();

export const DeviceProvider = ({ children }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768 || window.innerHeight <= 800);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768 || window.innerHeight <= 800);
    };
    window.addEventListener('resize', handleResize);
    return () => (window.removeEventListener('resize', handleResize) || isMobile);
  }, []);

  return (
    <DeviceContext.Provider value={{ isMobile }}>
      {children}
    </DeviceContext.Provider>
  );
};