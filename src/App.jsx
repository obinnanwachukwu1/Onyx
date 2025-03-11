import React, { useContext } from 'react';
import AppManager from './Components/AppManager';
import WindowManager from "./Components/WindowManager"
import { DeviceContext } from './Components/DeviceContext';
import { initializeTheme } from './Components/toggleTheme';

const App = () => {
  const { isMobile, windowSize } = useContext(DeviceContext);
  initializeTheme()
  return (
    <div>
      {isMobile ? (
        <AppManager />
      ) : (
        <WindowManager windowSize={windowSize}/>
      )}
    </div>
  );
};

export default App;