import { useEffect } from 'react';
import AppManager from './Components/AppManager';
import WindowManager from './Components/WindowManager';
import { useDeviceContext } from './Components/DeviceContext';
import { initializeTheme } from './Components/toggleTheme';
import { FileSystemProvider } from './Apps/Files/FileSystem';
import { TaskbarProvider } from './Components/Taskbar/TaskbarContext';
import appList from './Apps/AppList';

const App = (): JSX.Element => {
  const { isMobile, windowSize } = useDeviceContext();

  useEffect(() => {
    initializeTheme();
  }, []);

  // Provide minimal app metadata to seed /Applications shortcuts
  const fsApps = appList.map(a => ({ id: a.id, name: a.name }));

  return (
    <FileSystemProvider apps={fsApps}>
      <TaskbarProvider>
        {isMobile ? <AppManager /> : <WindowManager windowSize={windowSize} />}
      </TaskbarProvider>
    </FileSystemProvider>
  );
};

export default App;
