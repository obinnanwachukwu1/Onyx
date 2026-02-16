import { createFileRoute, Outlet, useMatches } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import App from '../App'
import IconNotepad from '../assets/icons/IconNotepad.svg'
import { BlogWindowProvider } from '../utils/BlogWindowContext'

export const Route = createFileRoute('/blog')({
  component: BlogLayout,
})

// Use a stable ID for the blog window
const BLOG_WINDOW_ID = 999999999;

function BlogLayout() {
  const hasNavigatedRef = useRef(false)
  
  // Get child route's loader data to determine the correct title upfront
  const matches = useMatches()
  const postMatch = matches.find(m => m.routeId === '/blog/$postId')
  
  // Determine title from route data (no flash because this is sync)
  let title = 'Blog'
  if (postMatch?.loaderData) {
    const data = postMatch.loaderData as { content?: { title?: string } }
    if (data.content?.title) {
      title = data.content.title
    }
  }

  // When this layout unmounts (window closed), navigate to home
  useEffect(() => {
    return () => {
      // Only navigate if we haven't already (prevents double navigation)
      if (!hasNavigatedRef.current && typeof window !== 'undefined') {
        hasNavigatedRef.current = true
        // Use window.location for a clean navigation that doesn't cause issues during unmount
        window.location.href = '/'
      }
    }
  }, [])

  const initialWindows = [
    {
      id: BLOG_WINDOW_ID,
      appId: 'blog',
      appIcon: IconNotepad,
      title, // Use the computed title directly
      content: (
        <BlogWindowProvider windowId={BLOG_WINDOW_ID}>
          <Outlet />
        </BlogWindowProvider>
      ),
      position: { x: 0, y: 0 },
      restorePosition: { x: 100, y: 100 },
      size: { width: 800, height: 600 },
      restoreSize: { width: 800, height: 600 },
      isMaximized: true,
      isMinimized: false,
      isRestoringFromTaskbar: false,
      showInTaskbar: true,
      isActive: true,
      renderMobile: false,
      zIndex: 1,
      hideDesktopChrome: true,
      fullViewportWhenMaximized: true,
    },
  ]

  return <App initialWindows={initialWindows} focusMode={true} mode="blogFullscreen" />
}
