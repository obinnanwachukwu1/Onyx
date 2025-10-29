import { useContext } from 'react';
import { WindowContextValue } from '../types/windows';
import { WindowManagerContext } from './WindowManagerContext';
import { AppManagerContext } from './AppManagerContext';

export const useWindowContext = (): WindowContextValue => {
  const windowManagerContext = useContext(WindowManagerContext);
  if (windowManagerContext !== undefined) {
    return windowManagerContext;
  }

  const appManagerContext = useContext(AppManagerContext);

  if (appManagerContext === undefined) {
    throw new Error('useWindowContext must be used within a WindowManager or AppManager provider');
  }

  return appManagerContext;
};
