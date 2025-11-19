import React, { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';

export type FileType = 'file' | 'folder';

export interface FileNode {
  id: string;
  name: string;
  type: FileType;
  content?: string; // For files
  children?: { [key: string]: FileNode }; // For folders
  parentId?: string;
  createdAt: number;
  modifiedAt: number;
  isGhost?: boolean; // If true, cannot be modified/deleted
}

export interface FileSystemState {
  root: FileNode;
}

const STORAGE_KEY = 'onyx_filesystem';
type AppShortcut = { id: string; name: string };

const createInitialGhostFs = (apps?: AppShortcut[]): FileNode => {
  const now = Date.now();
  const applicationChildren: { [key: string]: FileNode } = {};
  const desktopChildren: { [key: string]: FileNode } = {};

  if (apps && apps.length) {
    for (const app of apps) {
      const appFileName = `${app.name}.app`;
      applicationChildren[appFileName] = {
        id: `app-${app.id}`,
        name: appFileName,
        type: 'file',
        // Store the app id in content so the Files app can launch it
        content: app.id,
        isGhost: true,
        createdAt: now,
        modifiedAt: now,
      };
    }

    // Seed default desktop shortcuts
    const defaultDesktopIds = new Set(['resume', 'appcenter', 'contactme']);
    for (const app of apps) {
      if (defaultDesktopIds.has(app.id)) {
        const fileName = `${app.name}.app`;
        desktopChildren[fileName] = {
          id: `desktop-app-${app.id}`,
          name: fileName,
          type: 'file',
          content: app.id,
          isGhost: true,
          createdAt: now,
          modifiedAt: now,
        };
      }
    }
  }

  return {
    id: 'root',
    name: 'root',
    type: 'folder',
    isGhost: true,
    createdAt: now,
    modifiedAt: now,
    children: {
      'Applications': {
        id: 'applications',
        name: 'Applications',
        type: 'folder',
        isGhost: true,
        createdAt: now,
        modifiedAt: now,
        children: applicationChildren,
      },
      'System': {
        id: 'system',
        name: 'System',
        type: 'folder',
        isGhost: true,
        createdAt: now,
        modifiedAt: now,
        children: {}
      },
      'Users': {
        id: 'users',
        name: 'Users',
        type: 'folder',
        isGhost: true,
        createdAt: now,
        modifiedAt: now,
        children: {
          'root': {
            id: 'user-root',
            name: 'root',
            type: 'folder',
            isGhost: true,
            createdAt: now,
            modifiedAt: now,
            children: {
              'Desktop': {
                id: 'desktop',
                name: 'Desktop',
                type: 'folder',
                createdAt: now,
                modifiedAt: now,
                children: desktopChildren
              },
              'Documents': {
                id: 'documents',
                name: 'Documents',
                type: 'folder',
                createdAt: now,
                modifiedAt: now,
                children: {}
              },
              'Downloads': {
                id: 'downloads',
                name: 'Downloads',
                type: 'folder',
                createdAt: now,
                modifiedAt: now,
                children: {}
              }
            }
          }
        }
      }
    }
  };
};

const mergeFileSystems = (ghost: FileNode, stored: FileNode | null): FileNode => {
  if (!stored) return ghost;
  const merged = JSON.parse(JSON.stringify(ghost));

  const findNode = (root: FileNode, path: string[]): FileNode | undefined => {
    let current = root;
    for (const part of path) {
      if (current.children && current.children[part]) {
        current = current.children[part];
      } else {
        return undefined;
      }
    }
    return current;
  };

  const storedUserRoot = findNode(stored, ['Users', 'root']);
  const mergedUserRoot = findNode(merged, ['Users', 'root']);

  if (storedUserRoot && mergedUserRoot && mergedUserRoot.children) {
    // Shallow merge of user root
    mergedUserRoot.children = { ...mergedUserRoot.children, ...storedUserRoot.children };
    // Deep-merge Desktop folder so ghost shortcuts appear for existing users
    const mergedDesktop = mergedUserRoot.children['Desktop'];
    const storedDesktop = storedUserRoot.children?.['Desktop'];
    if (mergedDesktop && storedDesktop && mergedDesktop.type === 'folder' && storedDesktop.type === 'folder') {
      mergedDesktop.children = { ...(mergedDesktop.children || {}), ...(storedDesktop.children || {}) };
    }
  }

  return merged;
};

// Internal hook for state management
const useFileSystemState = (apps?: AppShortcut[]) => {
  const [fs, setFs] = useState<FileSystemState>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const storedFs = stored ? JSON.parse(stored) : null;
    const initialGhost = createInitialGhostFs(apps);
    return { root: mergeFileSystems(initialGhost, storedFs?.root) };
  });

  const saveFs = useCallback((newFs: FileSystemState) => {
    setFs(newFs);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newFs));
  }, []);

  const resolvePath = useCallback((path: string): FileNode | null => {
    const parts = path.split('/').filter(p => p);
    let current = fs.root;
    for (const part of parts) {
      if (current.children && current.children[part]) {
        current = current.children[part];
      } else {
        return null;
      }
    }
    return current;
  }, [fs]);

  const getParentPath = (path: string) => {
    const parts = path.split('/').filter(p => p);
    parts.pop();
    return '/' + parts.join('/');
  };

  const isEditable = useCallback((path: string) => {
    return path.startsWith('/Users/root');
  }, []);

  const mkdir = useCallback((path: string, name: string) => {
    if (!isEditable(path)) throw new Error('Permission denied: Read-only file system');
    const parent = resolvePath(path);
    if (!parent || parent.type !== 'folder') throw new Error('Invalid path');
    if (parent.children && parent.children[name]) throw new Error('File or folder already exists');

    const newNode: FileNode = {
      id: `${Date.now()}-${Math.random()}`,
      name,
      type: 'folder',
      createdAt: Date.now(),
      modifiedAt: Date.now(),
      children: {},
      parentId: parent.id
    };

    const newRoot = JSON.parse(JSON.stringify(fs.root));
    const parts = path.split('/').filter(p => p);
    let current = newRoot;
    for (const part of parts) {
      current = current.children[part];
    }
    
    if (!current.children) current.children = {};
    current.children[name] = newNode;

    saveFs({ root: newRoot });
  }, [fs, resolvePath, saveFs, isEditable]);

  const touch = useCallback((path: string, name: string, content: string = '') => {
    if (!isEditable(path)) throw new Error('Permission denied: Read-only file system');
    const parent = resolvePath(path);
    if (!parent || parent.type !== 'folder') throw new Error('Invalid path');
    if (parent.children && parent.children[name]) throw new Error('File or folder already exists');

    const newNode: FileNode = {
      id: `${Date.now()}-${Math.random()}`,
      name,
      type: 'file',
      content,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
      parentId: parent.id
    };

    const newRoot = JSON.parse(JSON.stringify(fs.root));
    const parts = path.split('/').filter(p => p);
    let current = newRoot;
    for (const part of parts) {
      current = current.children[part];
    }

    if (!current.children) current.children = {};
    current.children[name] = newNode;

    saveFs({ root: newRoot });
  }, [fs, resolvePath, saveFs, isEditable]);

  const rm = useCallback((path: string) => {
    if (!isEditable(path)) throw new Error('Permission denied: Read-only file system');
    const parentPath = getParentPath(path);
    const name = path.split('/').pop();
    if (!name) throw new Error('Invalid path');

    const newRoot = JSON.parse(JSON.stringify(fs.root));
    const parts = parentPath.split('/').filter(p => p);
    let current = newRoot;
    for (const part of parts) {
      current = current.children[part];
    }

    if (current.children && current.children[name]) {
      delete current.children[name];
      saveFs({ root: newRoot });
    } else {
      throw new Error('File not found');
    }
  }, [fs, saveFs, isEditable]);

  const rename = useCallback((path: string, newName: string) => {
    if (!isEditable(path)) throw new Error('Permission denied: Read-only file system');
    const parentPath = getParentPath(path);
    const oldName = path.split('/').pop();
    if (!oldName) throw new Error('Invalid path');

    const newRoot = JSON.parse(JSON.stringify(fs.root));
    const parts = parentPath.split('/').filter(p => p);
    let current = newRoot;
    for (const part of parts) {
      current = current.children[part];
    }

    if (current.children && current.children[oldName]) {
      const node = current.children[oldName];
      node.name = newName;
      node.modifiedAt = Date.now();
      
      current.children[newName] = node;
      delete current.children[oldName];
      
      saveFs({ root: newRoot });
    } else {
      throw new Error('File not found');
    }
  }, [fs, saveFs, isEditable]);

  const updateFileContent = useCallback((path: string, content: string) => {
    if (!isEditable(path)) throw new Error('Permission denied: Read-only file system');
    const parentPath = getParentPath(path);
    const name = path.split('/').pop();
    if (!name) throw new Error('Invalid path');

    const newRoot = JSON.parse(JSON.stringify(fs.root));
    const parts = parentPath.split('/').filter(p => p);
    let current = newRoot;
    for (const part of parts) {
      current = current.children[part];
    }

    if (current.children && current.children[name]) {
      current.children[name].content = content;
      current.children[name].modifiedAt = Date.now();
      saveFs({ root: newRoot });
    } else {
      throw new Error('File not found');
    }
  }, [fs, saveFs, isEditable]);

  return {
    fs,
    resolvePath,
    mkdir,
    touch,
    rm,
    rename,
    updateFileContent,
    isEditable
  };
};

type FileSystemContextType = ReturnType<typeof useFileSystemState>;

const FileSystemContext = createContext<FileSystemContextType | null>(null);

export const FileSystemProvider = ({ children, apps }: { children: ReactNode; apps?: AppShortcut[] }) => {
  const fsState = useFileSystemState(apps);
  return (
    <FileSystemContext.Provider value={fsState}>
      {children}
    </FileSystemContext.Provider>
  );
};

export const useFileSystem = () => {
  const context = useContext(FileSystemContext);
  if (!context) {
    throw new Error('useFileSystem must be used within a FileSystemProvider');
  }
  return context;
};
