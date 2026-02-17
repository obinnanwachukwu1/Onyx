import React from 'react';
import appList from '../AppList';
import IconFiles from '../../assets/icons/IconFiles.svg';
import IconNotepad from '../../assets/icons/IconNotepad.svg';
import { Folder, FileText } from 'lucide-react';

// Build a stable appId -> icon map
export const getAppIconMap = (): Record<string, string> =>
  Object.fromEntries(appList.map(a => [a.id, a.icon as unknown as string]));

export const isAppShortcut = (name: string) => name.toLowerCase().endsWith('.app');
export const isTextFile = (name: string) => name.toLowerCase().endsWith('.txt');

// Icon for Files app (returns a React node used inline)
export const filesIconFor = (
  name: string,
  isFolder: boolean,
  appIdFromContent?: string,
  appIconMap?: Record<string, string>
): React.ReactNode => {
  if (isFolder) return <Folder className="file-icon-grid" fill="currentColor" />;
  if (isAppShortcut(name) && appIdFromContent && appIconMap && appIconMap[appIdFromContent]) {
    return <img className="file-icon-grid" src={appIconMap[appIdFromContent]} alt={name.replace(/\.app$/i, '')} />;
  }
  if (isTextFile(name)) return <FileText className="file-icon-grid file" />;
  return <FileText className="file-icon-grid file" />;
};

// Smaller icon for Files list view
export const filesListIconFor = (
  name: string,
  isFolder: boolean,
  appIdFromContent?: string,
  appIconMap?: Record<string, string>
): React.ReactNode => {
  if (isFolder) return <Folder className="file-icon-list" fill="currentColor" />;
  if (isAppShortcut(name) && appIdFromContent && appIconMap && appIconMap[appIdFromContent]) {
    return <img className="file-icon-list" src={appIconMap[appIdFromContent]} alt={name.replace(/\.app$/i, '')} />;
  }
  if (isTextFile(name)) return <FileText className="file-icon-list file" />;
  return <FileText className="file-icon-list file" />;
};

// Icon src for Desktop icons (image-based)
export const desktopIconSrcFor = (
  name: string,
  isFolder: boolean,
  appIdFromContent?: string,
  appIconMap?: Record<string, string>
): string => {
  if (isFolder) return IconFiles; // generic folder/file image
  if (isAppShortcut(name) && appIdFromContent && appIconMap && appIconMap[appIdFromContent]) {
    return appIconMap[appIdFromContent];
  }
  if (isTextFile(name)) return IconNotepad;
  return IconFiles;
};

