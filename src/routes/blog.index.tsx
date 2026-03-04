import { createFileRoute } from '@tanstack/react-router'
import { getPosts } from '../utils/posts'
import BlogList from '../Components/BlogList'
import { useBlogWindowTitle } from '../utils/BlogWindowContext'

export const Route = createFileRoute('/blog/')({
  loader: () => {
    return { posts: getPosts() }
  },
  component: BlogIndex,
})

function BlogIndex() {
  const { posts } = Route.useLoaderData()
  
  // Update the window title
  useBlogWindowTitle('Blog')
  
  return <BlogList posts={posts} />
}
