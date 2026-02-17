import { useEffect, useRef, type MouseEventHandler } from 'react';
import './Desktop.css';
import DesktopIcon from './DesktopIcon';
import appList from '../../Apps/AppList';
import { useWindowContext } from '../WindowContext';
import { useFileSystem } from '../../Apps/Files/FileSystem';
import { desktopIconSrcFor, getAppIconMap } from '../../Apps/Files/fileAssociations';

const Desktop = (): JSX.Element => {
  const { launchApp, deactivateAll } = useWindowContext();
  const hasLaunched = useRef<boolean>(false);

  useEffect(() => {
    if (hasLaunched.current) {
      return;
    }

    const timer = window.setTimeout(() => {
      hasLaunched.current = true;
      launchApp('welcome-center');
    }, 1000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [launchApp]);

  const { resolvePath } = useFileSystem();

  const handleOpenItem = (name: string, content?: string) => {
    // .app shortcut -> launch app by id stored in content
    if (name.endsWith('.app') && content) {
      launchApp(content.trim());
      return;
    }
    // Text file -> open Notepad with content
    if (name.endsWith('.txt')) {
      const filePath = `/Users/root/Desktop/${name}`;
      launchApp('notepad', { initialContent: content || '', filePath });
      return;
    }
    // Folders/files fallback: open Files app
    launchApp('files');
  };

  const handleMouseDown: MouseEventHandler<HTMLDivElement> = (event) => {
    deactivateAll?.(event.nativeEvent);
  };

  // Build icons from the Desktop folder
  const desktopFolder = resolvePath('/Users/root/Desktop');
  const items = desktopFolder?.children ? Object.values(desktopFolder.children) : [];

  // Map app id -> icon for .app shortcuts
  const appIconMap: Record<string, string> = getAppIconMap();

  return (
    <div className="desktop" onMouseDown={handleMouseDown}>
      {items.map((item) => {
        const isFolder = item.type === 'folder';
        const appId = (item.content || '').trim();
        const imageSrc = desktopIconSrcFor(item.name, isFolder, appId, appIconMap);
        const label = item.name.replace(/\.app$/, '');
        return (
          <DesktopIcon
            key={item.id}
            imageSrc={imageSrc}
            text={label}
            handleDesktopIconDoubleClick={() => handleOpenItem(item.name, item.content)}
          />
        );
      })}
    </div>
  );
};

export default Desktop;
