import React from 'react';
import { Link } from '@tanstack/react-router';
import { BlogPost } from '../utils/posts';

interface BlogListProps {
  posts: BlogPost[];
  /** If provided, uses callback for navigation (CSR mode). Otherwise uses router Link (SSR mode). */
  onPostClick?: (postId: string) => void;
}

const BlogList: React.FC<BlogListProps> = ({ posts, onPostClick }) => {
  return (
    <div className="w-full h-full bg-white dark:bg-zinc-900 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <header className="mb-16">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 font-serif mb-2">
            Blog
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Thoughts, tutorials, and updates.
          </p>
        </header>

        <div className="space-y-12">
          {posts.map((post) => (
            <article key={post.slug}>
              <time 
                dateTime={post.date} 
                className="text-sm text-zinc-400 dark:text-zinc-500"
              >
                {post.date ? new Date(post.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : ''}
              </time>
              <h2 className="mt-1 mb-2">
                {onPostClick ? (
                  <button
                    onClick={() => onPostClick(post.slug)}
                    className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left"
                  >
                    {post.title}
                  </button>
                ) : (
                  <Link 
                    to="/blog/$postId" 
                    params={{ postId: post.slug }}
                    className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {post.title}
                  </Link>
                )}
              </h2>
              {post.subtitle && (
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {post.subtitle}
                </p>
              )}
            </article>
          ))}

          {posts.length === 0 && (
            <p className="text-zinc-500">
              No posts yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogList;
