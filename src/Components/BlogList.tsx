import React from 'react';
import { Link } from '@tanstack/react-router';
import { BlogPost } from '../utils/posts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedin, faGithub, faXTwitter } from '@fortawesome/free-brands-svg-icons';

interface BlogListProps {
  posts: BlogPost[];
  /** If provided, uses callback for navigation (CSR mode). Otherwise uses router Link (SSR mode). */
  onPostClick?: (postId: string) => void;
}

const BlogList: React.FC<BlogListProps> = ({ posts, onPostClick }) => {
  return (
    <div className="w-full h-full bg-white dark:bg-zinc-900 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-6 py-16 min-h-full flex flex-col">
        <header className="mb-16">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 font-serif mb-2">
            Blog
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Thoughts, tutorials, and updates.
          </p>
        </header>

        <div className="space-y-12 flex-1">
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

        <footer className="pt-8 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-center gap-6">
          <a
            href="https://x.com/itsobinnasworld"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            aria-label="X (Twitter)"
          >
            <FontAwesomeIcon icon={faXTwitter} className="w-6 h-6" />
          </a>
          <a
            href="https://linkedin.com/in/obinnanwachukwu"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            aria-label="LinkedIn"
          >
            <FontAwesomeIcon icon={faLinkedin} className="w-6 h-6" />
          </a>
          <a
            href="https://github.com/obinnanwachukwu"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            aria-label="GitHub"
          >
            <FontAwesomeIcon icon={faGithub} className="w-6 h-6" />
          </a>
        </footer>
      </div>
    </div>
  );
};

export default BlogList;
