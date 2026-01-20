const posts = import.meta.glob('../posts/*.md', { query: '?raw', import: 'default', eager: true });

export interface BlogPost {
  slug: string;
  title: string;
  subtitle?: string;
  date: string;
  content: string;
}

// Simple frontmatter parser that doesn't rely on Node.js Buffer
function parseFrontmatter(fileContent: string): { data: Record<string, string>; content: string } {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = fileContent.match(frontmatterRegex);
  
  if (!match) {
    return { data: {}, content: fileContent };
  }
  
  const frontmatterBlock = match[1];
  const content = match[2];
  
  // Parse YAML-like key: value pairs
  const data: Record<string, string> = {};
  const lines = frontmatterBlock.split('\n');
  
  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex !== -1) {
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      data[key] = value;
    }
  }
  
  return { data, content };
}

export function getPost(slug: string): BlogPost {
  const matchingPath = Object.keys(posts).find((path) => path.endsWith(`/${slug}.md`));
  
  if (!matchingPath) {
    throw new Error(`Post not found: ${slug}`);
  }
  
  const fileContent = posts[matchingPath] as string;
  const { data, content } = parseFrontmatter(fileContent);
  
  return {
    slug,
    title: data.title || slug,
    subtitle: data.subtitle,
    date: data.date || '',
    content
  };
}

export function getPosts(): BlogPost[] {
  return Object.keys(posts).map((path) => {
    const slug = path.split('/').pop()?.replace('.md', '') || '';
    const fileContent = posts[path] as string;
    const { data, content } = parseFrontmatter(fileContent);
    
    return {
      slug,
      title: data.title || slug,
      subtitle: data.subtitle,
      date: data.date || '',
      content
    };
  }).sort((a, b) => {
    // Sort by date descending
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}
