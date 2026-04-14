import { createContext } from 'react';
import { WindowContextValue } from '../types/windows';

export const AppManagerContext = createContext<WindowContextValue | undefined>(undefined);
