import React from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedin, faGithub, faXTwitter } from '@fortawesome/free-brands-svg-icons';
import type { AnchorHTMLAttributes, ComponentType } from 'react';

type MDXContentComponent = ComponentType<{
  components?: {
    a?: ComponentType<AnchorHTMLAttributes<HTMLAnchorElement>>;
  };
}>;

interface ReaderViewProps {
  title: string;
  subtitle?: string;
  Content: MDXContentComponent;
  readTime: number;
  /** If provided, uses callback for back navigation (CSR mode). Otherwise uses router Link (SSR mode). */
  onBack?: () => void;
}

function BlogContentLink(props: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const { href, rel, target, ...rest } = props;
  const isExternal = !!href && /^(https?:)?\/\//.test(href);

  return (
    <a
      href={href}
      target={isExternal ? '_blank' : target}
      rel={isExternal ? rel ?? 'noopener noreferrer' : rel}
      {...rest}
    />
  );
}

const ReaderView: React.FC<ReaderViewProps> = ({ title, subtitle, Content, readTime, onBack }) => {
  return (
    <div className="w-full h-full bg-white dark:bg-zinc-900 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-12 md:py-20">
        {/* Back button */}
        {onBack ? (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors mb-8 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to all posts
          </button>
        ) : (
          <Link 
            to="/blog" 
            className="inline-flex items-center gap-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors mb-8 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to all posts
          </Link>
        )}

        <header className="mb-12 text-center border-b border-zinc-100 dark:border-zinc-800 pb-12">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 text-zinc-900 dark:text-zinc-100 font-serif tracking-tight leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-6 font-light">
              {subtitle}
            </p>
          )}
          <div className="flex items-center justify-center gap-2 text-zinc-500 dark:text-zinc-400 text-sm font-medium uppercase tracking-wider">
            <span>{readTime} min read</span>
          </div>
        </header>
        
        <article className="prose prose-lg prose-zinc dark:prose-invert mx-auto focus:outline-none max-w-none">
          <Content components={{ a: BlogContentLink }} />
        </article>

        <footer className="mt-20 pt-8 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-center gap-6">
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

export default ReaderView;
