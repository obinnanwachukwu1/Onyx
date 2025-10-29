import { ReactNode } from 'react';

export interface Coordinates {
  x: number;
  y: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

export enum WindowStartPosition {
  DEFAULT = 'default',
  CENTERSCREEN = 'centerScreen',
}

export interface WindowData {
  id: number;
  appId: string;
  appIcon: string;
  title: string;
  content: ReactNode;
  position: Coordinates;
  restorePosition: Coordinates;
  size: Dimensions;
  restoreSize: Dimensions;
  isMaximized: boolean;
  isMinimized: boolean;
  isRestoringFromTaskbar: boolean;
  showInTaskbar: boolean;
  isActive: boolean;
  renderMobile: boolean;
  zIndex: number;
}

export interface AppDefinition {
  id: string;
  name: string;
  icon: string;
  component: ReactNode;
  initialSize?: Dimensions;
  initialPosition?: WindowStartPosition;
  showOnDesktop: boolean;
  showInLauncher: boolean;
  featured?: boolean;
  category?: string;
  description?: string;
  image?: string;
}

export interface WindowContextValue {
  closingWindowID: number;
  launcherVisible: boolean;
  launchApp: (appId: string) => void;
  activateWindow: (id: number) => void;
  setWindowPosition: (id: number, position: Coordinates) => void;
  setWindowSize: (id: number, size: Dimensions) => void;
  sendIntentToClose: (id: number) => void;
  sendIntentToMaximize: (id: number) => void;
  sendIntentToRestore: (id: number) => void;
  notifyClose: (id: number) => void;
  notifyMaximize: (id: number) => void;
  notifyMinimize: (id: number) => void;
  notifyRestore: (id: number) => void;
  getTaskbarTransformPos: (id: number) => void;
  afterRestoreFromTaskbar: (id: number) => void;
  toggleLauncherVisibility: () => void;
  closeLauncher: () => void;
  deactivateAll?: (event?: MouseEvent | TouchEvent) => void;
}
