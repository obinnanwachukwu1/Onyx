import type { ComponentType } from 'react';
import rawPostSources from 'virtual:blog-post-sources';

export interface BlogPostMetadata {
  title: string;
  subtitle?: string;
  date: string;
}

export interface BlogPostSummary extends BlogPostMetadata {
  slug: string;
}

export interface BlogPost extends BlogPostSummary {
  Content: ComponentType;
  readTime: number;
}

interface BlogPostModule {
  default: ComponentType;
  metadata: BlogPostMetadata;
}

const postModules = import.meta.glob<BlogPostModule>('../posts/*.mdx', { eager: true });

function stripMetadataExport(source: string): string {
  return source.replace(/^export\s+const\s+metadata\s*=\s*\{[\s\S]*?\}\s*;?\s*/m, '').trim();
}

function calculateReadTime(source: string): number {
  const words = stripMetadataExport(source).trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function buildPost(path: string, module: BlogPostModule): BlogPost {
  const summary = buildPostSummary(path, module);
  const rawSource = rawPostSources[path] || '';

  return {
    ...summary,
    Content: module.default,
    readTime: calculateReadTime(rawSource),
  };
}

function buildPostSummary(path: string, module: BlogPostModule): BlogPostSummary {
  const slug = path.split('/').pop()?.replace('.mdx', '') || '';

  return {
    slug,
    ...module.metadata,
  };
}

export function getPost(slug: string): BlogPost {
  const matchingEntry = Object.entries(postModules).find(([path]) => path.endsWith(`/${slug}.mdx`));

  if (!matchingEntry) {
    throw new Error(`Post not found: ${slug}`);
  }

  const [path, module] = matchingEntry;
  return buildPost(path, module);
}

export function getPosts(): BlogPostSummary[] {
  return Object.entries(postModules).map(([path, module]) => {
    return buildPostSummary(path, module);
  }).sort((a, b) => {
    // Sort by date descending
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}
