import { createFileRoute } from '@tanstack/react-router'
import { getPost } from '../utils/posts'
import ReaderView from '../components/ReaderView'
import { useBlogWindowTitle } from '../utils/BlogWindowContext'

export const Route = createFileRoute('/blog/$postId')({
  loader: ({ params }) => {
    const content = getPost(params.postId)
    return { content, postId: params.postId }
  },
  component: BlogPage,
})

function BlogPage() {
  const { content } = Route.useLoaderData()
  const { title, subtitle, content: markdownContent } = content;

  // Update the window title to the post title
  useBlogWindowTitle(title || 'Blog Post')

  return <ReaderView title={title} subtitle={subtitle} content={markdownContent} />
}
