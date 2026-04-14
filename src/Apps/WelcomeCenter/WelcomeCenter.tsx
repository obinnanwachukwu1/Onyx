import { ArrowUpRight, Globe, Mail, FileText, ChevronRight } from 'lucide-react';

import { useWindowContext } from '../../components/WindowContext';
import { useWindowChrome } from '../../components/WindowChromeContext';

const WelcomeCenter = (): JSX.Element => {
  const { launchApp } = useWindowContext();
  const { sidebarActiveId } = useWindowChrome();
  // Active tab is now window-managed via Window chrome context

  return (
    <div className="flex h-full w-full overflow-hidden bg-[var(--window-bg)] text-[var(--text-color)]">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-[var(--window-bg)]">
        {sidebarActiveId === 'home' && (
          <div className="mx-auto max-w-3xl p-8">
            <header className="mb-8">
              <h1 className="mb-2 text-3xl font-bold tracking-tight text-[var(--text-color)]">Welcome to Onyx</h1>
              <p className="text-lg text-[var(--text-color)] opacity-70">
                Your personal desktop environment for exploring my portfolio.
              </p>
            </header>

            <div className="grid gap-4 sm:grid-cols-2">
              <button
                onClick={() => launchApp('appcenter')}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-[var(--window-border-inactive)] bg-[var(--welcome-card-bg)] p-6 text-left shadow-sm transition-all hover:border-[var(--window-border-active)] hover:bg-[var(--welcome-card-hover)] hover:shadow-md"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--welcome-accent-blue-soft)] text-[var(--welcome-accent-blue)]">
                  <Globe className="h-6 w-6" />
                </div>
                <h3 className="mb-1 text-lg font-semibold text-[var(--text-color)]">Projects</h3>
                <p className="mb-4 text-sm text-[var(--text-color)] opacity-70">Explore my applications and experiments.</p>
                <div className="mt-auto flex items-center text-sm font-medium text-[var(--welcome-accent-blue)] group-hover:underline">
                  Open App Center <ChevronRight className="ml-1 h-4 w-4" />
                </div>
              </button>

              <button
                onClick={() => launchApp('resume')}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-[var(--window-border-inactive)] bg-[var(--welcome-card-bg)] p-6 text-left shadow-sm transition-all hover:border-[var(--window-border-active)] hover:bg-[var(--welcome-card-hover)] hover:shadow-md"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--welcome-accent-rose-soft)] text-[var(--welcome-accent-rose)]">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="mb-1 text-lg font-semibold text-[var(--text-color)]">Resume</h3>
                <p className="mb-4 text-sm text-[var(--text-color)] opacity-70">View my professional experience and skills.</p>
                <div className="mt-auto flex items-center text-sm font-medium text-[var(--welcome-accent-rose)] group-hover:underline">
                  View Resume <ChevronRight className="ml-1 h-4 w-4" />
                </div>
              </button>

              <button
                onClick={() => launchApp('contactme')}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-[var(--window-border-inactive)] bg-[var(--welcome-card-bg)] p-6 text-left shadow-sm transition-all hover:border-[var(--window-border-active)] hover:bg-[var(--welcome-card-hover)] hover:shadow-md sm:col-span-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--welcome-accent-emerald-soft)] text-[var(--welcome-accent-emerald)]">
                      <Mail className="h-6 w-6" />
                    </div>
                    <h3 className="mb-1 text-lg font-semibold text-[var(--text-color)]">Get in Touch</h3>
                    <p className="text-sm text-[var(--text-color)] opacity-70">Have a project in mind? Let's collaborate.</p>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--welcome-accent-emerald-soft)] text-[var(--welcome-accent-emerald)] group-hover:bg-[var(--welcome-accent-emerald-soft)] group-hover:text-[var(--welcome-accent-emerald)]">
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {sidebarActiveId === 'about' && (
          <div className="mx-auto max-w-2xl p-8">
            <h2 className="mb-6 text-2xl font-bold text-[var(--text-color)]">About Onyx OS</h2>
            <div className="prose prose-slate">
              <p className="text-[var(--text-color)] opacity-80">
                Onyx is a web-based desktop environment built with React and Tailwind CSS. It's designed to showcase my
                technical skills in a fun, interactive way.
              </p>
              <h3 className="mt-6 text-lg font-semibold text-[var(--text-color)]">Features</h3>
              <ul className="mt-2 list-inside list-disc space-y-2 text-[var(--text-color)] opacity-80">
                <li>Window management system (drag, resize, minimize)</li>
                <li>Taskbar and Start Menu</li>
                <li>File system abstraction</li>
                <li>Theme support (Light/Dark)</li>
              </ul>
            </div>
          </div>
        )}

        {sidebarActiveId === 'updates' && (
          <div className="mx-auto max-w-2xl p-8">
            <h2 className="mb-6 text-2xl font-bold text-[var(--text-color)]">What's New</h2>
            <div className="space-y-6">
              <div className="border-l-2 border-blue-500 pl-4">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">v2.0.0</span>
                <h3 className="text-lg font-semibold text-[var(--text-color)]">Desktop Experience Overhaul</h3>
                <p className="mt-1 text-sm text-[var(--text-color)] opacity-70">
                  Introduced taskbar modes (classic, modern, floating), pinned apps, launcher/taskbar context menus,
                  window-managed sidebars, and improved mobile behavior across core desktop workflows.
                </p>
              </div>
              <div className="border-l-2 border-[var(--window-border-active)] pl-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-color)] opacity-50">Architecture</span>
                <h3 className="text-lg font-semibold text-[var(--text-color)]">TanStack Start SSR Migration</h3>
                <p className="mt-1 text-sm text-[var(--text-color)] opacity-70">
                  Migrated the project to TanStack Start SSR, modernized routing, and reworked core desktop/window
                  systems with hydration and rendering fixes for more reliable navigation and app startup.
                </p>
              </div>
              <div className="border-l-2 border-[var(--window-border-active)] pl-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-color)] opacity-50">Apps and Content</span>
                <h3 className="text-lg font-semibold text-[var(--text-color)]">Expanded App Suite</h3>
                <p className="mt-1 text-sm text-[var(--text-color)] opacity-70">
                  Added Settings personalization, Files with Notepad integration, a full blog system (markdown + SSR routes),
                  immersive blog modes, App Center improvements, and refreshed icon/theme assets across the UI.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomeCenter;
