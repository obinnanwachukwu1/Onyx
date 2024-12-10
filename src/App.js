import React, { useContext } from 'react';
import AppManager from './Components/AppManager';
import WindowManager from "./Components/WindowManager"
import { DeviceContext } from './Components/DeviceContext';

const App = () => {
  const { isMobile } = useContext(DeviceContext);
  return (
    <div>
      {isMobile ? (
        <AppManager />
      ) : (
        <WindowManager />
      )}
    </div>
  );
};

export default App;