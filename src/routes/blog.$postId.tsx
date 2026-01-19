import { createFileRoute } from '@tanstack/react-router'
import App from '../App'
import { getPost } from '../utils/posts'
import IconNotepad from '../assets/icons/IconNotepad.svg'

export const Route = createFileRoute('/blog/$postId')({
  loader: ({ params }) => {
    const content = getPost(params.postId)
    return { content, postId: params.postId }
  },
  component: BlogPage,
})

function BlogPage() {
  const { content, postId } = Route.useLoaderData()

  // Use a stable ID to prevent hydration mismatches
  const windowId = 999999999; 

  // For maximized windows, we use CSS-based sizing (100% width/height)
  // The JS values here are only used as fallbacks for restore operations
  // Using consistent values ensures server/client render identically
  const initialWindows = [
    {
      id: windowId,
      appId: 'blog',
      appIcon: IconNotepad,
      title: `Blog - ${postId}`,
      content: content,
      position: { x: 0, y: 0 },
      restorePosition: { x: 100, y: 100 },
      // These values are ignored when maximized (CSS handles sizing)
      // They're only used if user restores the window
      size: { width: 800, height: 600 },
      restoreSize: { width: 800, height: 600 },
      isMaximized: true,
      isMinimized: false,
      isRestoringFromTaskbar: false,
      showInTaskbar: true,
      isActive: true,
      renderMobile: false,
      zIndex: 1,
    },
  ]

  // Use focusMode=true to hide desktop icons and dim background
  return <App initialWindows={initialWindows} focusMode={true} />
}
