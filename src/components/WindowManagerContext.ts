import { createContext } from 'react';
import { WindowContextValue } from '../types/windows';

export const WindowManagerContext = createContext<WindowContextValue | undefined>(undefined);
