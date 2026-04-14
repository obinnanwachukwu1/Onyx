import { Globe, Mail, FileText, ChevronRight, Newspaper } from 'lucide-react';

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
                onClick={() => launchApp('blog')}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-[var(--window-border-inactive)] bg-[var(--welcome-card-bg)] p-6 text-left shadow-sm transition-all hover:border-[var(--window-border-active)] hover:bg-[var(--welcome-card-hover)] hover:shadow-md"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                  <Newspaper className="h-6 w-6" />
                </div>
                <h3 className="mb-1 text-lg font-semibold text-[var(--text-color)]">Blog</h3>
                <p className="mb-4 text-sm text-[var(--text-color)] opacity-70">Read posts, notes, and longer-form writing.</p>
                <div className="mt-auto flex items-center text-sm font-medium text-amber-700 dark:text-amber-300 group-hover:underline">
                  Open Blog <ChevronRight className="ml-1 h-4 w-4" />
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
                className="group relative flex flex-col overflow-hidden rounded-xl border border-[var(--window-border-inactive)] bg-[var(--welcome-card-bg)] p-6 text-left shadow-sm transition-all hover:border-[var(--window-border-active)] hover:bg-[var(--welcome-card-hover)] hover:shadow-md"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--welcome-accent-emerald-soft)] text-[var(--welcome-accent-emerald)]">
                  <Mail className="h-6 w-6" />
                </div>
                <h3 className="mb-1 text-lg font-semibold text-[var(--text-color)]">Get in Touch</h3>
                <p className="mb-4 text-sm text-[var(--text-color)] opacity-70">Have a project in mind? Let&apos;s collaborate.</p>
                <div className="mt-auto flex items-center text-sm font-medium text-[var(--welcome-accent-emerald)] group-hover:underline">
                  Contact Me <ChevronRight className="ml-1 h-4 w-4" />
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
      </div>
    </div>
  );
};

export default WelcomeCenter;
