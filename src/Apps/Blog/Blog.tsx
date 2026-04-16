import React, { useState } from 'react';
import BlogList from '../../components/BlogList';
import ReaderView from '../../components/ReaderView';
import { getPosts, getPost, BlogPostSummary } from '../../utils/posts';
import './Blog.css';

interface BlogAppProps {
  initialPostId?: string;
}

/**
 * CSR Blog App for window mode.
 * Manages its own navigation state without touching the URL router.
 */
const BlogApp: React.FC<BlogAppProps> = ({ initialPostId }) => {
  const [currentPostId, setCurrentPostId] = useState<string | null>(initialPostId || null);
  const [posts] = useState<BlogPostSummary[]>(() => getPosts());

  // Get current post data if viewing a post
  const currentPost = currentPostId ? getPost(currentPostId) : null;

  const handlePostClick = (postId: string) => {
    setCurrentPostId(postId);
  };

  const handleBack = () => {
    setCurrentPostId(null);
  };

  if (currentPost) {
    return (
      <ReaderView
        title={currentPost.title}
        subtitle={currentPost.subtitle}
        Content={currentPost.Content}
        readTime={currentPost.readTime}
        onBack={handleBack}
      />
    );
  }

  return (
    <BlogList 
      posts={posts} 
      onPostClick={handlePostClick}
    />
  );
};

export default BlogApp;
