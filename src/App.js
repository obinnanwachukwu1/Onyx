import React, { useState, useEffect } from 'react';
import {isMobile} from 'react-device-detect';
import AppManager from './Components/AppManager';

import WindowManager from "./Components/WindowManager"

const App = () => {
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div>
      {isMobile || isSmallScreen ? (
        <AppManager />
      ) : (
        <WindowManager />
      )}
    </div>
  );
};

export default App;