import { useEffect, useState } from 'react';
import { ArrowUpRight, Terminal, Globe, Mail, FileText, ChevronRight } from 'lucide-react';

import { useWindowContext } from '../../Components/WindowContext';
import { useWindowChrome } from '../../Components/WindowChromeContext';
import { useDeviceContext } from '../../Components/DeviceContext';
import LoadingScreen from '../../Components/LoadingScreen/LoadingScreen';
import logo192 from '../../../logo192.png';

type StatusResponse = {
  working_status?: string;
};

const STATUS_URL = '/projects/status.json';

const WelcomeCenter = (): JSX.Element => {
  const { launchApp } = useWindowContext();
  const { isMobile } = useDeviceContext();
  const { sidebarActiveId, setSidebarActiveId } = useWindowChrome();

  const [loading, setLoading] = useState<boolean>(true);
  const [workingStatus, setWorkingStatus] = useState<string>('');
  // Active tab is now window-managed via Window chrome context

  useEffect(() => {
    let isSubscribed = true;

    fetch(STATUS_URL, { cache: 'no-cache' })
      .then<StatusResponse>((response) => response.json())
      .then((data) => {
        if (!isSubscribed) return;
        setWorkingStatus(data.working_status ?? '');
        setLoading(false);
      })
      .catch((error: unknown) => {
        console.error('Error loading working status:', error);
        if (!isSubscribed) return;
        setLoading(false);
      });

    return () => {
      isSubscribed = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[var(--window-bg)]">
        <LoadingScreen />
      </div>
    );
  }

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
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Latest</span>
                <h3 className="text-lg font-semibold text-[var(--text-color)]">Welcome Center Redesign</h3>
                <p className="mt-1 text-sm text-[var(--text-color)] opacity-70">
                  A fresh new look for the Welcome Center, designed to feel right at home in Onyx OS.
                </p>
              </div>
              <div className="border-l-2 border-[var(--window-border-active)] pl-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-color)] opacity-50">v2.0.0</span>
                <h3 className="text-lg font-semibold text-[var(--text-color)]">System Overhaul</h3>
                <p className="mt-1 text-sm text-[var(--text-color)] opacity-70">
                  Complete rewrite of the window manager and taskbar for better performance and mobile support.
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
