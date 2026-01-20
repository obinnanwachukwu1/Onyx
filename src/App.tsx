import { useEffect } from 'react';
import AppManager from './Components/AppManager';
import WindowManager from './Components/WindowManager';
import { useDeviceContext } from './Components/DeviceContext';
import { initializeTheme } from './Components/toggleTheme';
import { FileSystemProvider } from './Apps/Files/FileSystem';
import { TaskbarProvider } from './Components/Taskbar/TaskbarContext';
import appList from './Apps/AppList';
import { WindowData } from './types/windows';

interface AppProps {
  initialWindows?: WindowData[];
  focusMode?: boolean;
}

const App = ({ initialWindows, focusMode }: AppProps): JSX.Element => {
  const { isMobile, windowSize } = useDeviceContext();

  useEffect(() => {
    initializeTheme();
  }, []);

  // Provide minimal app metadata to seed /Applications shortcuts
  const fsApps = appList.map(a => ({ id: a.id, name: a.name }));

  return (
    <FileSystemProvider apps={fsApps}>
      <TaskbarProvider>
        {isMobile ? (
          <AppManager initialWindows={initialWindows} />
        ) : (
          <WindowManager windowSize={windowSize} initialWindows={initialWindows} focusMode={focusMode} />
        )}
      </TaskbarProvider>
    </FileSystemProvider>
  );
};

export default App;
