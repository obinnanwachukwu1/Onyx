import React from 'react';
import appList from '../AppList';
import IconFiles from '../../assets/icons/IconFiles.svg';
import IconNotepad from '../../assets/icons/IconNotepad.svg';
import IconFolder from '../../assets/icons/IconFolder.svg';
import { Download, FileText, Lock, Monitor, Settings, User, Users } from 'lucide-react';

// Build a stable appId -> icon map
export const getAppIconMap = (): Record<string, string> =>
  Object.fromEntries(appList.map(a => [a.id, a.icon as unknown as string]));

export const isAppShortcut = (name: string) => name.toLowerCase().endsWith('.app');
export const isTextFile = (name: string) => name.toLowerCase().endsWith('.txt');

const folderBadgeIconForPath = (absolutePath?: string): React.ReactNode | null => {
  switch (absolutePath) {
    case '/System':
      return <Lock className="file-icon-badge" />;
    case '/Applications':
      return <Settings className="file-icon-badge" />;
    case '/Users':
      return <Users className="file-icon-badge" />;
    case '/Users/root':
      return <User className="file-icon-badge" />;
    case '/Users/root/Desktop':
      return <Monitor className="file-icon-badge" />;
    case '/Users/root/Documents':
      return <FileText className="file-icon-badge" />;
    case '/Users/root/Downloads':
      return <Download className="file-icon-badge" />;
    default:
      return null;
  }
};

const folderIcon = (size: 'grid' | 'list', absolutePath?: string): React.ReactNode => {
  const badge = folderBadgeIconForPath(absolutePath);
  const iconClass = size === 'grid' ? 'file-icon-grid' : 'file-icon-list';
  if (!badge) {
    return <img className={iconClass} src={IconFolder} alt="Folder" />;
  }

  return (
    <span className={`file-icon-badged file-icon-badged-${size}`}>
      <img className={iconClass} src={IconFolder} alt="Folder" />
      {badge}
    </span>
  );
};

// Icon for Files app (returns a React node used inline)
export const filesIconFor = (
  name: string,
  isFolder: boolean,
  appIdFromContent?: string,
  appIconMap?: Record<string, string>,
  absolutePath?: string
): React.ReactNode => {
  if (isFolder) return folderIcon('grid', absolutePath);
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
  appIconMap?: Record<string, string>,
  absolutePath?: string
): React.ReactNode => {
  if (isFolder) return folderIcon('list', absolutePath);
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
  if (isFolder) return IconFolder;
  if (isAppShortcut(name) && appIdFromContent && appIconMap && appIconMap[appIdFromContent]) {
    return appIconMap[appIdFromContent];
  }
  if (isTextFile(name)) return IconNotepad;
  return IconFiles;
};
