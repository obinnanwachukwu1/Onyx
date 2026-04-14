import { useEffect, useMemo } from 'react';
import AppManager from './components/AppManager';
import WindowManager from './components/WindowManager';
import { useDeviceContext } from './components/DeviceContext';
import { initializeTheme } from './components/toggleTheme';
import { FileSystemProvider } from './Apps/Files/FileSystem';
import { TaskbarProvider } from './components/Taskbar/TaskbarContext';
import appList from './Apps/AppList';
import type { WindowData } from './types/windows';

export type AppMode = 'default' | 'blogFullscreen';
export type DeviceModeOverride = 'mobile' | 'desktop';

interface AppProps {
  initialWindows?: WindowData[];
  focusMode?: boolean;
  mode?: AppMode;
  deviceOverride?: DeviceModeOverride;
}

const App = ({ initialWindows, focusMode, mode = 'default', deviceOverride }: AppProps): JSX.Element => {
  const { isMobile, windowSize } = useDeviceContext();
  const isBlogFullscreen = mode === 'blogFullscreen';
  const effectiveIsMobile = deviceOverride
    ? deviceOverride === 'mobile'
    : isMobile;

  useEffect(() => {
    initializeTheme();
  }, []);

  // Provide minimal app metadata to seed /Applications shortcuts
  const fsApps = useMemo(() => appList.map(a => ({ id: a.id, name: a.name })), []);

  return (
    <FileSystemProvider apps={fsApps}>
      <TaskbarProvider>
        {effectiveIsMobile ? (
          <AppManager initialWindows={initialWindows} blogFullscreen={isBlogFullscreen} />
        ) : (
          <WindowManager
            windowSize={windowSize}
            initialWindows={initialWindows}
            focusMode={focusMode}
            blogFullscreen={isBlogFullscreen}
          />
        )}
      </TaskbarProvider>
    </FileSystemProvider>
  );
};

export default App;
