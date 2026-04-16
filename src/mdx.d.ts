declare module '*.mdx' {
  import type { ComponentType } from 'react';
  import type { BlogPostMetadata } from './utils/posts';

  export const metadata: BlogPostMetadata;

  const MDXComponent: ComponentType;
  export default MDXComponent;
}
