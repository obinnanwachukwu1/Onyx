import { HeadContent, Scripts, createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import { DeviceProvider } from '../Components/DeviceContext'

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

  component: RootComponent,
  notFoundComponent: () => <div className="p-4">Page Not Found</div>,
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    // Start with light theme, inline script will correct it before paint
    // suppressHydrationWarning because the inline script intentionally modifies data-theme
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
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
                  var cookieMatch = document.cookie.match(/(^| )theme=([^;]+)/);
                  var cookieTheme = cookieMatch ? cookieMatch[2] : null;
                  var savedTheme = cookieTheme || localStorage.getItem('theme-preference');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var theme = savedTheme || (prefersDark ? 'dark' : 'light');
                  if (theme === 'dark' || theme === 'light') {
                    document.documentElement.setAttribute('data-theme', theme);
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
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
