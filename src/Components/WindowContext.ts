import { useContext } from 'react';
import { WindowContextValue } from '../types/windows';
import { WindowManagerContext } from './WindowManagerContext';
import { AppManagerContext } from './AppManagerContext';

export const useWindowContext = (): WindowContextValue => {
  const windowManagerContext = useContext(WindowManagerContext);
  const appManagerContext = useContext(AppManagerContext);

  const isInsideWindowManager = windowManagerContext !== undefined;

  return isInsideWindowManager ? windowManagerContext : appManagerContext;
};
