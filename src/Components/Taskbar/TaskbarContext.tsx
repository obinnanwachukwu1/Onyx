import React, { createContext, useContext, useEffect, useState } from 'react';

export type TaskbarStyle = 'classic' | 'modern' | 'floating';

interface TaskbarContextType {
  taskbarStyle: TaskbarStyle;
  setTaskbarStyle: (style: TaskbarStyle) => void;
  pinnedAppIds: string[];
  pinApp: (appId: string) => void;
  unpinApp: (appId: string) => void;
  isPinned: (appId: string) => boolean;
  togglePin: (appId: string) => void;
  isHydrated: boolean; // Indicates if localStorage state has been loaded
}

const TaskbarContext = createContext<TaskbarContextType | undefined>(undefined);

const STORAGE_KEY_STYLE = 'onyx_taskbar_style';
const STORAGE_KEY_PINNED = 'onyx_taskbar_pinned';

// Default pinned apps - used on server and as initial client state
const DEFAULT_PINNED = ['files', 'appcenter', 'settings'];

// Global flag that persists across component remounts
// Once hydrated, stays true for the entire session
let globalHydrated = false;

const normalizeTaskbarStyle = (storedStyle: string | null): TaskbarStyle | null => {
  if (storedStyle === 'windows') return 'modern';
  if (storedStyle === 'mac') return 'floating';
  if (storedStyle === 'classic' || storedStyle === 'modern' || storedStyle === 'floating') {
    return storedStyle;
  }
  return null;
};

const getInitialTaskbarStyle = (): TaskbarStyle => {
  if (typeof window === 'undefined') {
    return 'modern';
  }

  try {
    const savedStyle = normalizeTaskbarStyle(window.localStorage.getItem(STORAGE_KEY_STYLE));
    if (savedStyle) {
      window.localStorage.setItem(STORAGE_KEY_STYLE, savedStyle);
      return savedStyle;
    }
  } catch (e) {
    console.error('Failed to read taskbar style', e);
  }
  return 'modern';
};

const getInitialPinnedApps = (): string[] => {
  if (typeof window === 'undefined') {
    return DEFAULT_PINNED;
  }

  try {
    const savedPinned = window.localStorage.getItem(STORAGE_KEY_PINNED);
    if (!savedPinned) {
      return DEFAULT_PINNED;
    }

    const parsed = JSON.parse(savedPinned);
    if (Array.isArray(parsed) && parsed.every((item) => typeof item === 'string')) {
      return parsed;
    }
  } catch (e) {
    console.error('Failed to parse pinned apps', e);
  }

  return DEFAULT_PINNED;
};

export const TaskbarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [taskbarStyle, setTaskbarStyleState] = useState<TaskbarStyle>(getInitialTaskbarStyle);
  const [pinnedAppIds, setPinnedAppIds] = useState<string[]>(getInitialPinnedApps);
  // Use global flag - if we've hydrated before, skip the animation on remount
  const [isHydrated, setIsHydrated] = useState(globalHydrated || typeof window !== 'undefined');

  useEffect(() => {
    globalHydrated = true;
    if (!isHydrated) {
      setIsHydrated(true);
    }
  }, [isHydrated]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY_STYLE, taskbarStyle);
    } catch (e) {
      console.error('Failed to persist taskbar style', e);
    }
  }, [taskbarStyle]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY_PINNED, JSON.stringify(pinnedAppIds));
    } catch (e) {
      console.error('Failed to persist pinned apps', e);
    }
  }, [pinnedAppIds]);

  const setTaskbarStyle = (style: TaskbarStyle) => {
    setTaskbarStyleState(style);
  };

  const pinApp = (appId: string) => {
    setPinnedAppIds((prev) => {
      if (prev.includes(appId)) return prev;
      return [...prev, appId];
    });
  };

  const unpinApp = (appId: string) => {
    setPinnedAppIds((prev) => {
      return prev.filter((id) => id !== appId);
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
        isHydrated,
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
