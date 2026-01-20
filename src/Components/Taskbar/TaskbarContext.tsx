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

export const TaskbarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Start with defaults that match what the server will render
  const [taskbarStyle, setTaskbarStyleState] = useState<TaskbarStyle>('windows');
  const [pinnedAppIds, setPinnedAppIds] = useState<string[]>(DEFAULT_PINNED);
  // Use global flag - if we've hydrated before, skip the animation on remount
  const [isHydrated, setIsHydrated] = useState(globalHydrated);

  useEffect(() => {
    // Only run on client after mount
    if (typeof window === 'undefined') return;

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
    }
    // Note: We don't set defaults here because we already initialized with them
    
    // Set both local state and global flag
    globalHydrated = true;
    setIsHydrated(true);
  }, []);

  const setTaskbarStyle = (style: TaskbarStyle) => {
    setTaskbarStyleState(style);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_STYLE, style);
    }
  };

  const pinApp = (appId: string) => {
    setPinnedAppIds((prev) => {
      if (prev.includes(appId)) return prev;
      const newPinned = [...prev, appId];
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_PINNED, JSON.stringify(newPinned));
      }
      return newPinned;
    });
  };

  const unpinApp = (appId: string) => {
    setPinnedAppIds((prev) => {
      const newPinned = prev.filter((id) => id !== appId);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_PINNED, JSON.stringify(newPinned));
      }
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


