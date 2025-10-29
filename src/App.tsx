import { useEffect } from 'react';
import AppManager from './Components/AppManager';
import WindowManager from './Components/WindowManager';
import { useDeviceContext } from './Components/DeviceContext';
import { initializeTheme } from './Components/toggleTheme';

const App = (): JSX.Element => {
  const { isMobile, windowSize } = useDeviceContext();

  useEffect(() => {
    initializeTheme();
  }, []);

  return <div>{isMobile ? <AppManager /> : <WindowManager windowSize={windowSize} />}</div>;
};

export default App;
