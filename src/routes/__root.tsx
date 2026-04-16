import { useEffect } from 'react'
import { HeadContent, Scripts, createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import { DeviceProvider } from '../components/DeviceContext'

import appCss from '../styles.css?url'
import desktopWallpaper from '../assets/wallpaper/wall5.webp?url'
import iconCrystal from '../assets/icons/IconCrystal.svg?url'
import iconFiles from '../assets/icons/IconFiles.svg?url'
import iconStore from '../assets/icons/IconStore.svg?url'
import iconSettings from '../assets/icons/IconSettings.svg?url'
import iconResume from '../assets/icons/IconResume.svg?url'
import iconContact from '../assets/icons/IconContact.svg?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Onyx OS',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'preload',
        as: 'image',
        href: desktopWallpaper,
        type: 'image/webp',
      },
      {
        rel: 'preload',
        as: 'image',
        href: iconCrystal,
        type: 'image/svg+xml',
      },
      {
        rel: 'preload',
        as: 'image',
        href: iconFiles,
        type: 'image/svg+xml',
      },
      {
        rel: 'preload',
        as: 'image',
        href: iconStore,
        type: 'image/svg+xml',
      },
      {
        rel: 'preload',
        as: 'image',
        href: iconSettings,
        type: 'image/svg+xml',
      },
      {
        rel: 'preload',
        as: 'image',
        href: iconResume,
        type: 'image/svg+xml',
      },
      {
        rel: 'preload',
        as: 'image',
        href: iconContact,
        type: 'image/svg+xml',
      },
    ],
  }),
  loader: ({ location }) => ({
    initialPathname: location.pathname || '/',
  }),

  component: RootComponent,
  notFoundComponent: () => <div className="p-4">Page Not Found</div>,
})

function RootComponent() {
  const { initialPathname } = Route.useLoaderData()
  const pathname = typeof window !== 'undefined'
    ? window.location.pathname || '/'
    : initialPathname
  const isBlogRoute = pathname === '/blog' || pathname.startsWith('/blog/')

  return (
    <RootDocument isBlogRoute={isBlogRoute}>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({
  children,
  isBlogRoute,
}: {
  children: React.ReactNode
  isBlogRoute: boolean
}) {
  const shell = isBlogRoute ? 'blog' : 'desktop'
  const initialShellBg = isBlogRoute ? '#ffffff' : '#000000'
  const initialShellBgImage = isBlogRoute ? 'none' : `url("${desktopWallpaper}")`

  useEffect(() => {
    const html = document.documentElement
    const body = document.body
    const theme = html.getAttribute('data-theme') || 'light'

    html.setAttribute('data-shell', shell)
    body.setAttribute('data-shell', shell)

    if (shell === 'blog') {
      html.style.backgroundColor = theme === 'dark' ? '#18181b' : '#ffffff'
      html.style.backgroundImage = 'none'
      html.style.backgroundSize = ''
      html.style.backgroundPosition = ''
      html.style.backgroundRepeat = ''
      body.style.backgroundColor = theme === 'dark' ? '#18181b' : '#ffffff'
      body.style.backgroundImage = 'none'
      body.style.backgroundSize = ''
      body.style.backgroundPosition = ''
      body.style.backgroundRepeat = ''
      return
    }

    html.style.backgroundColor = '#000000'
    html.style.backgroundImage = `url("${desktopWallpaper}")`
    html.style.backgroundSize = 'cover'
    html.style.backgroundPosition = 'center'
    html.style.backgroundRepeat = 'no-repeat'
    body.style.backgroundColor = '#000000'
    body.style.backgroundImage = `url("${desktopWallpaper}")`
    body.style.backgroundSize = 'cover'
    body.style.backgroundPosition = 'center'
    body.style.backgroundRepeat = 'no-repeat'
  }, [shell])

  return (
    // Start with light theme, inline script will correct it before paint
    // suppressHydrationWarning because the inline script intentionally modifies data-theme
    <html lang="en" data-theme="light" data-shell={shell} suppressHydrationWarning>
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html, body {
                background-color: ${initialShellBg};
                background-image: ${initialShellBgImage};
                background-size: cover;
                background-position: center;
                background-repeat: no-repeat;
              }
            `,
          }}
        />
        <HeadContent />
        {/* 
          Inline script to prevent theme flash.
          This runs synchronously before the browser paints, reading from:
          1. Cookie (for SSR consistency in future)
          2. localStorage (user's saved preference)
          3. System preference (prefers-color-scheme)
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var pathname = window.location.pathname || '/';
                  var isBlogRoute = pathname === '/blog' || pathname.indexOf('/blog/') === 0;
                  var shell = isBlogRoute ? 'blog' : 'desktop';
                  document.documentElement.setAttribute('data-shell', shell);

                  var cookieMatch = document.cookie.match(/(^| )theme=([^;]+)/);
                  var cookieTheme = cookieMatch ? cookieMatch[2] : null;
                  var savedTheme = cookieTheme || localStorage.getItem('theme-preference');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var theme = savedTheme || (prefersDark ? 'dark' : 'light');
                  if (theme === 'dark' || theme === 'light') {
                    document.documentElement.setAttribute('data-theme', theme);
                  }

                  if (isBlogRoute) {
                    document.documentElement.style.backgroundColor = theme === 'dark' ? '#18181b' : '#ffffff';
                    document.documentElement.style.backgroundImage = 'none';
                  } else {
                    document.documentElement.style.backgroundColor = '#000000';
                    document.documentElement.style.backgroundImage = 'url("${desktopWallpaper}")';
                    document.documentElement.style.backgroundSize = 'cover';
                    document.documentElement.style.backgroundPosition = 'center';
                    document.documentElement.style.backgroundRepeat = 'no-repeat';
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body data-shell={shell}>
        <DeviceProvider>
          {children}
        </DeviceProvider>
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
