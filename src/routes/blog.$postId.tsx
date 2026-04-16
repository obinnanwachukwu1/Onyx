import { createFileRoute } from '@tanstack/react-router'
import { getPost } from '../utils/posts'
import ReaderView from '../components/ReaderView'
import { useBlogWindowTitle } from '../utils/BlogWindowContext'

export const Route = createFileRoute('/blog/$postId')({
  head: ({ params }) => ({
    meta: [
      {
        title: getPost(params.postId).title || "Obinna's Library",
      },
    ],
  }),
  component: BlogPage,
})

function BlogPage() {
  const { postId } = Route.useParams()
  const content = getPost(postId)
  const { title, subtitle, Content, readTime } = content;

  // Update the window title to the post title
  useBlogWindowTitle(title || 'Blog Post')

  return <ReaderView title={title} subtitle={subtitle} Content={Content} readTime={readTime} />
}
