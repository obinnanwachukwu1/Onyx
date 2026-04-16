import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import mdx from '@mdx-js/rollup'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import { fileURLToPath, URL } from 'url'
import { readdirSync, readFileSync } from 'fs'
import { join } from 'path'

import tailwindcss from '@tailwindcss/vite'
import { cloudflare } from '@cloudflare/vite-plugin'

const config = defineConfig(() => {
  const isVitest = process.env.VITEST === 'true'
  const postsDir = fileURLToPath(new URL('./src/posts', import.meta.url))
  const postSourcesModuleId = 'virtual:blog-post-sources'
  const resolvedPostSourcesModuleId = '\0virtual:blog-post-sources'
  const mdxPlugin = {
    ...mdx(),
    enforce: 'pre' as const,
  }
  const blogPostSourcesPlugin = {
    name: 'blog-post-sources',
    enforce: 'pre' as const,
    resolveId(source: string) {
      if (source === postSourcesModuleId) {
        return resolvedPostSourcesModuleId
      }

      return null
    },
    load(id: string) {
      if (id !== resolvedPostSourcesModuleId) {
        return null
      }

      const sources = Object.fromEntries(
        readdirSync(postsDir)
          .filter((filename) => filename.endsWith('.mdx'))
          .sort()
          .map((filename) => [
            `../posts/${filename}`,
            readFileSync(join(postsDir, filename), 'utf8'),
          ]),
      )

      return `export default ${JSON.stringify(sources)};`
    },
  }

  return {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    plugins: [
      devtools(),
      !isVitest && cloudflare({ viteEnvironment: { name: 'ssr' } }),
      // this is the plugin that enables path aliases
      viteTsConfigPaths({
        projects: ['./tsconfig.json'],
      }),
      tailwindcss(),
      blogPostSourcesPlugin,
      mdxPlugin,
      tanstackStart(),
      viteReact({
        include: [/\.mdx$/, /\.[jt]sx?$/],
      }),
    ].filter(Boolean),
  }
})

export default config
