import { createContext, useContext, useLayoutEffect } from 'react';
import { useWindowContext } from '../Components/WindowContext';

interface BlogWindowContextType {
  windowId: number;
}

const BlogWindowContext = createContext<BlogWindowContextType | undefined>(undefined);

export const BlogWindowProvider = ({ windowId, children }: { windowId: number; children: React.ReactNode }) => {
  return (
    <BlogWindowContext.Provider value={{ windowId }}>
      {children}
    </BlogWindowContext.Provider>
  );
};

/**
 * Hook to update the blog window title from child routes.
 * Uses useLayoutEffect to update before browser paint (no flash).
 */
export const useBlogWindowTitle = (title: string) => {
  const blogContext = useContext(BlogWindowContext);
  const windowContext = useWindowContext();
  
  // useLayoutEffect runs synchronously after DOM mutations but before paint
  // This prevents the flash because the title is updated before the browser paints
  useLayoutEffect(() => {
    if (blogContext && windowContext.setWindowTitle) {
      windowContext.setWindowTitle(blogContext.windowId, title);
    }
  }, [title, blogContext?.windowId]);
};
