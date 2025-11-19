import React, { createContext, useContext, useEffect, useState } from 'react';

export type TaskbarStyle = 'windows' | 'mac';

interface TaskbarContextType {
  taskbarStyle: TaskbarStyle;
  setTaskbarStyle: (style: TaskbarStyle) => void;
  pinnedAppIds: string[];
  pinApp: (appId: string) => void;
  unpinApp: (appId: string) => void;
  isPinned: (appId: string) => boolean;
  togglePin: (appId: string) => void;
}

const TaskbarContext = createContext<TaskbarContextType | undefined>(undefined);

const STORAGE_KEY_STYLE = 'onyx_taskbar_style';
const STORAGE_KEY_PINNED = 'onyx_taskbar_pinned';

export const TaskbarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [taskbarStyle, setTaskbarStyleState] = useState<TaskbarStyle>('windows');
  const [pinnedAppIds, setPinnedAppIds] = useState<string[]>([]);

  useEffect(() => {
    const savedStyle = localStorage.getItem(STORAGE_KEY_STYLE) as TaskbarStyle;
    if (savedStyle) {
      setTaskbarStyleState(savedStyle);
    }

    const savedPinned = localStorage.getItem(STORAGE_KEY_PINNED);
    if (savedPinned) {
      try {
        setPinnedAppIds(JSON.parse(savedPinned));
      } catch (e) {
        console.error('Failed to parse pinned apps', e);
      }
    } else {
        // Default pinned apps
        setPinnedAppIds(['files', 'appcenter', 'settings']);
    }
  }, []);

  const setTaskbarStyle = (style: TaskbarStyle) => {
    setTaskbarStyleState(style);
    localStorage.setItem(STORAGE_KEY_STYLE, style);
  };

  const pinApp = (appId: string) => {
    setPinnedAppIds((prev) => {
      if (prev.includes(appId)) return prev;
      const newPinned = [...prev, appId];
      localStorage.setItem(STORAGE_KEY_PINNED, JSON.stringify(newPinned));
      return newPinned;
    });
  };

  const unpinApp = (appId: string) => {
    setPinnedAppIds((prev) => {
      const newPinned = prev.filter((id) => id !== appId);
      localStorage.setItem(STORAGE_KEY_PINNED, JSON.stringify(newPinned));
      return newPinned;
    });
  };

  const isPinned = (appId: string) => pinnedAppIds.includes(appId);

  const togglePin = (appId: string) => {
    if (isPinned(appId)) {
      unpinApp(appId);
    } else {
      pinApp(appId);
    }
  };

  return (
    <TaskbarContext.Provider
      value={{
        taskbarStyle,
        setTaskbarStyle,
        pinnedAppIds,
        pinApp,
        unpinApp,
        isPinned,
        togglePin,
      }}
    >
      {children}
    </TaskbarContext.Provider>
  );
};

export const useTaskbar = () => {
  const context = useContext(TaskbarContext);
  if (context === undefined) {
    throw new Error('useTaskbar must be used within a TaskbarProvider');
  }
  return context;
};

