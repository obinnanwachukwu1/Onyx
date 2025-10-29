import { createContext } from 'react';
import { WindowContextValue } from '../types/windows';

const noop = () => {
  // no-op default implementation
};

export const WindowManagerContext = createContext<WindowContextValue>({
  closingWindowID: -1,
  launcherVisible: false,
  launchApp: noop,
  activateWindow: noop,
  setWindowPosition: noop,
  setWindowSize: noop,
  sendIntentToClose: noop,
  sendIntentToMaximize: noop,
  sendIntentToRestore: noop,
  notifyClose: noop,
  notifyMaximize: noop,
  notifyMinimize: noop,
  notifyRestore: noop,
  getTaskbarTransformPos: noop,
  afterRestoreFromTaskbar: noop,
  toggleLauncherVisibility: noop,
  closeLauncher: noop,
  deactivateAll: noop,
});
