import { useState, useMemo, useEffect, type ReactNode } from 'react';
import LauncherIcon from './LauncherIcon';
import { useWindowContext } from '../WindowContext';
import { useDeviceContext } from '../DeviceContext';
import { useTaskbar } from '../Taskbar/TaskbarContext';
import { useFileSystem, type FileNode } from '../../Apps/Files/FileSystem';
import appList from '../../Apps/AppList';
import { Search, Home, Grid, Settings, X } from 'lucide-react';
import { ContextMenu } from '../ContextMenu';
import { desktopIconSrcFor, getAppIconMap, isTextFile } from '../../Apps/Files/fileAssociations';

type SearchResultKind = 'app' | 'file' | 'setting';

interface LauncherSearchResult {
  id: string;
  kind: SearchResultKind;
  title: string;
  subtitle: string;
  keywords: string[];
  icon: ReactNode;
  iconSrc: string;
  onSelect: () => void;
}

const normalizeSearchValue = (value: string) => value.trim().toLowerCase();

const scoreSearchValue = (query: string, ...fields: string[]) => {
  const normalizedQuery = normalizeSearchValue(query);
  if (!normalizedQuery) {
    return 0;
  }

  let score = 0;

  for (const field of fields) {
    const normalizedField = normalizeSearchValue(field);
    if (!normalizedField) {
      continue;
    }

    if (normalizedField === normalizedQuery) {
      score = Math.max(score, 500);
      continue;
    }

    if (normalizedField.startsWith(normalizedQuery)) {
      score = Math.max(score, 320);
      continue;
    }

    const queryIndex = normalizedField.indexOf(normalizedQuery);
    if (queryIndex !== -1) {
      score = Math.max(score, Math.max(140, 240 - queryIndex * 4));
    }
  }

  return score;
};

const Launcher = (): JSX.Element | null => {
  const {
    launcherVisible,
    launcherView,
    closeLauncher,
    launchApp,
    windows = [],
    activeWindowId = null,
    activateWindow,
    notifyMinimize,
    sendIntentToClose,
  } = useWindowContext();
  const { isMobile } = useDeviceContext();
  const { fs, isHydrated } = useFileSystem();
  const [displayedLauncherView, setDisplayedLauncherView] = useState(launcherView);
  const [activeTab, setActiveTab] = useState<'home' | 'all'>('home');
  const [searchTerm, setSearchTerm] = useState('');
  const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; appId: string | null }>({
    visible: false,
    x: 0,
    y: 0,
    appId: null,
  });
  const appIconMap = useMemo(() => getAppIconMap(), []);

  useEffect(() => {
    if (launcherVisible) {
      setDisplayedLauncherView(launcherView);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setContextMenu({ visible: false, x: 0, y: 0, appId: null });
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [launcherVisible, launcherView]);

  useEffect(() => {
    if (launcherVisible && displayedLauncherView === 'apps') {
      setSearchTerm('');
    }
  }, [launcherVisible, displayedLauncherView]);

  const launcherApps = useMemo(() => appList.filter((app) => app.showInLauncher), []);

  const filteredApps = useMemo(() => {
    if (!searchTerm) return appList.filter((app) => app.showInLauncher);
    return appList.filter(
      (app) => app.showInLauncher && app.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const { pinnedAppIds, togglePin, isPinned, taskbarStyle } = useTaskbar();

  const handleContextMenu = (event: React.MouseEvent, appId: string) => {
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      appId,
    });
  };

  const closeContextMenu = () => {
    setContextMenu({ ...contextMenu, visible: false });
  };

  const pinnedApps = useMemo(() => {
    return pinnedAppIds
      .map((id) => appList.find((app) => app.id === id))
      .filter((app): app is typeof appList[0] => !!app);
  }, [pinnedAppIds]);

  const recentApps = useMemo(() => {
    const blogApp = launcherApps.find((app) => app.id === 'blog');
    const nonBlogApps = launcherApps.filter((app) => app.id !== 'blog');

    return blogApp ? [blogApp, ...nonBlogApps].slice(0, 4) : launcherApps.slice(0, 4);
  }, [launcherApps]);

  const runningWindows = useMemo(() => {
    return [...windows]
      .filter((window) => window.showInTaskbar)
      .sort((a, b) => b.zIndex - a.zIndex);
  }, [windows]);

  const mobileStaggerStyle = (index: number): React.CSSProperties => {
    const delay = 70 + index * 24;
    return {
      opacity: launcherVisible ? 1 : 0,
      transform: launcherVisible ? 'translateY(0px)' : 'translateY(10px)',
      transition: `opacity 220ms ease ${delay}ms, transform 260ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
    };
  };

  const renderMobileAppGrid = (apps: typeof appList) => (
    <div className="grid grid-cols-4 gap-3">
      {apps.map((app, index) => (
        <button
          key={app.id}
          className="group flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3 transition-transform active:scale-95"
          style={mobileStaggerStyle(index)}
          onClick={() => {
            launchApp(app.id);
            closeLauncher();
          }}
        >
          <img src={app.icon} alt={app.name} className="h-11 w-11 object-contain drop-shadow-sm" />
          <span className="text-center text-[11px] leading-tight text-white/85 group-active:text-white">{app.name}</span>
        </button>
      ))}
    </div>
  );

  const settingsSearchResults = useMemo<LauncherSearchResult[]>(() => {
    const settingsIconSrc = appIconMap.settings;

    return [
      {
        id: 'settings-personalization',
        kind: 'setting',
        title: 'Personalization',
        subtitle: 'Settings',
        keywords: ['theme', 'appearance', 'taskbar', 'settings'],
        icon: null,
        iconSrc: settingsIconSrc,
        onSelect: () => {
          launchApp('settings', { initialSidebarId: 'personalization' });
          closeLauncher();
        },
      },
      {
        id: 'settings-light-theme',
        kind: 'setting',
        title: 'Light Theme',
        subtitle: 'Settings > Personalization',
        keywords: ['theme', 'light mode', 'appearance', 'personalization'],
        icon: null,
        iconSrc: settingsIconSrc,
        onSelect: () => {
          launchApp('settings', { initialSidebarId: 'personalization' });
          closeLauncher();
        },
      },
      {
        id: 'settings-dark-theme',
        kind: 'setting',
        title: 'Dark Theme',
        subtitle: 'Settings > Personalization',
        keywords: ['theme', 'dark mode', 'appearance', 'personalization'],
        icon: null,
        iconSrc: settingsIconSrc,
        onSelect: () => {
          launchApp('settings', { initialSidebarId: 'personalization' });
          closeLauncher();
        },
      },
      {
        id: 'settings-classic-taskbar',
        kind: 'setting',
        title: 'Classic Taskbar',
        subtitle: 'Settings > Personalization',
        keywords: ['taskbar', 'classic', 'layout', 'personalization'],
        icon: null,
        iconSrc: settingsIconSrc,
        onSelect: () => {
          launchApp('settings', { initialSidebarId: 'personalization' });
          closeLauncher();
        },
      },
      {
        id: 'settings-modern-taskbar',
        kind: 'setting',
        title: 'Modern Taskbar',
        subtitle: 'Settings > Personalization',
        keywords: ['taskbar', 'modern', 'layout', 'personalization'],
        icon: null,
        iconSrc: settingsIconSrc,
        onSelect: () => {
          launchApp('settings', { initialSidebarId: 'personalization' });
          closeLauncher();
        },
      },
      {
        id: 'settings-floating-taskbar',
        kind: 'setting',
        title: 'Floating Taskbar',
        subtitle: 'Settings > Personalization',
        keywords: ['taskbar', 'floating', 'dock', 'layout', 'personalization'],
        icon: null,
        iconSrc: settingsIconSrc,
        onSelect: () => {
          launchApp('settings', { initialSidebarId: 'personalization' });
          closeLauncher();
        },
      },
      {
        id: 'settings-about',
        kind: 'setting',
        title: 'About',
        subtitle: 'Settings',
        keywords: ['version', 'system', 'about', 'attribution'],
        icon: null,
        iconSrc: settingsIconSrc,
        onSelect: () => {
          launchApp('settings', { initialSidebarId: 'about' });
          closeLauncher();
        },
      },
    ];
  }, [closeLauncher, launchApp]);

  const fileSearchResults = useMemo<LauncherSearchResult[]>(() => {
    if (!isHydrated) {
      return [];
    }

    const results: LauncherSearchResult[] = [];

    const walk = (node: FileNode, parentPath: string) => {
      const absolutePath = parentPath ? `${parentPath}/${node.name}` : `/${node.name}`;

      if (node.name && !node.name.toLowerCase().endsWith('.app')) {
        if (node.type === 'folder') {
          results.push({
            id: `file-folder-${node.id}`,
            kind: 'file',
            title: node.name,
            subtitle: absolutePath,
            keywords: [absolutePath],
            icon: null,
            iconSrc: desktopIconSrcFor(node.name, true, undefined, appIconMap),
            onSelect: () => {
              launchApp('files', { initialPath: absolutePath, initialSelectedId: null });
              closeLauncher();
            },
          });
        } else {
          results.push({
            id: `file-node-${node.id}`,
            kind: 'file',
            title: node.name,
            subtitle: absolutePath,
            keywords: [absolutePath],
            icon: null,
            iconSrc: desktopIconSrcFor(node.name, false, undefined, appIconMap),
            onSelect: () => {
              if (isTextFile(node.name)) {
                launchApp('notepad', { initialContent: node.content || '', filePath: absolutePath });
              } else {
                const parentFolderPath = parentPath || '/';
                launchApp('files', { initialPath: parentFolderPath, initialSelectedId: node.id });
              }
              closeLauncher();
            },
          });
        }
      }

      if (node.type === 'folder' && node.children) {
        Object.values(node.children).forEach((child) => walk(child, absolutePath));
      }
    };

    Object.values(fs.root.children || {}).forEach((child) => walk(child, ''));

    return results;
  }, [appIconMap, closeLauncher, fs.root.children, isHydrated, launchApp]);

  const searchResults = useMemo<LauncherSearchResult[]>(() => {
    const query = normalizeSearchValue(searchTerm);
    if (!query) {
      return [];
    }

    const appResults: LauncherSearchResult[] = launcherApps.map((app) => ({
      id: `app-${app.id}`,
      kind: 'app',
      title: app.name,
      subtitle: 'App',
      keywords: [app.id, app.description || '', app.category || ''],
      icon: null,
      iconSrc: app.icon,
      onSelect: () => {
        launchApp(app.id);
        closeLauncher();
      },
    }));

    const combinedResults = [...appResults, ...settingsSearchResults, ...fileSearchResults]
      .map((result) => {
        const score = Math.max(
          scoreSearchValue(query, result.title),
          scoreSearchValue(query, result.subtitle),
          ...result.keywords.map((keyword) => scoreSearchValue(query, keyword)),
        );

        return { result, score };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }

        const kindOrder: Record<SearchResultKind, number> = {
          app: 0,
          setting: 1,
          file: 2,
        };

        if (kindOrder[a.result.kind] !== kindOrder[b.result.kind]) {
          return kindOrder[a.result.kind] - kindOrder[b.result.kind];
        }

        return a.result.title.localeCompare(b.result.title);
      })
      .slice(0, isMobile ? 24 : 16)
      .map(({ result }) => result);

    return combinedResults;
  }, [closeLauncher, fileSearchResults, isMobile, launcherApps, launchApp, searchTerm, settingsSearchResults]);

  const renderSearchResultIcon = (result: LauncherSearchResult) => (
    <img src={result.iconSrc} alt={result.title} className="h-9 w-9 shrink-0 object-contain drop-shadow-sm" />
  );

  const sharedSearchInputClassName = 'w-full bg-[var(--taskbar-item-bg)] border border-[var(--window-border-active)] rounded-xl py-3 pl-10 pr-4 text-[var(--text-color)] placeholder:text-[var(--text-color)] placeholder:opacity-30 focus:outline-none focus:bg-[var(--taskbar-item-hover-bg)] focus:border-blue-500/30 transition-all';
  const sharedSearchResultsHeadingClassName = 'text-xs font-bold text-[var(--text-color)] opacity-40 uppercase tracking-wider mb-4 px-1';

  const renderSearchResultsList = (mobile: boolean) => {
    if (!searchResults.length) {
      return (
        <p className="py-8 text-center text-sm text-[var(--text-color)] opacity-40">
          No apps, files, or settings match your search.
        </p>
      );
    }

    return (
      <div className="mt-2 space-y-1">
        {searchResults.map((result, index) => (
          <button
            key={result.id}
            type="button"
            onClick={result.onSelect}
            style={mobile ? mobileStaggerStyle(index) : undefined}
            className="flex w-full items-center gap-3 rounded-lg bg-transparent px-2 py-2 text-left transition-colors hover:bg-[var(--sidebar-item-hover-bg)]"
          >
            {renderSearchResultIcon(result)}
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-[var(--text-color)]/90">
                {result.title}
              </div>
              <div className="truncate text-xs text-[var(--text-color)]/50">
                {result.subtitle}
              </div>
            </div>
          </button>
        ))}
      </div>
    );
  };

  if (isMobile) {
    return (
      <div className={`launcher fixed inset-0 z-[10020] ${launcherVisible ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <button
          className={`absolute inset-0 bg-black/45 transition-opacity duration-300 ${launcherVisible ? 'opacity-100' : 'opacity-0'}`}
          onClick={closeLauncher}
          aria-label="Close launcher"
        />

        <section
          className="absolute inset-x-0 bottom-0 flex max-h-[84vh] flex-col rounded-t-3xl border-t border-white/15 bg-[#0f1015f2] shadow-[0_-18px_50px_rgba(0,0,0,0.45)] backdrop-blur-xl transform-gpu"
          style={{
            transform: launcherVisible ? 'translateY(0%)' : 'translateY(100%)',
            transition: 'transform 300ms cubic-bezier(0.22, 1, 0.36, 1)',
            willChange: 'transform',
          }}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-white/35" />

          <div className="border-b border-white/10 px-4 pb-3 pt-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold tracking-tight text-white">{displayedLauncherView === 'running' ? 'Running Apps' : 'Launcher'}</h2>
              <button
                className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white"
                onClick={closeLauncher}
                aria-label="Close launcher"
              >
                <X size={18} />
              </button>
            </div>

            {displayedLauncherView !== 'running' ? (
              <>
                <div className="relative mt-3 group">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-color)] opacity-40 group-focus-within:text-blue-400 transition-colors" size={18} />
                  <input
                    type="text"
                    placeholder="Search apps, files, and settings..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className={sharedSearchInputClassName}
                  />
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-black/20 p-1">
                  <button
                    className={`rounded-lg px-2 py-2 text-xs font-medium transition-colors ${activeTab === 'home' ? 'bg-white text-black' : 'text-white/70'}`}
                    onClick={() => setActiveTab('home')}
                  >
                    Home
                  </button>
                  <button
                    className={`rounded-lg px-2 py-2 text-xs font-medium transition-colors ${activeTab === 'all' ? 'bg-white text-black' : 'text-white/70'}`}
                    onClick={() => setActiveTab('all')}
                  >
                    All Apps
                  </button>
                </div>
              </>
            ) : null}
          </div>

          <div
            className="min-h-0 overflow-y-auto px-4 pb-[calc(88px+env(safe-area-inset-bottom))] pt-4 overscroll-contain"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {displayedLauncherView === 'running' ? (
              runningWindows.length ? (
                <div className="space-y-2">
                  {runningWindows.map((window, index) => {
                    const app = appList.find((entry) => entry.id === window.appId);
                    const appIcon = window.appIcon || app?.icon;
                    const isActive = window.id === activeWindowId || window.isActive;

                    return (
                      <div
                        key={window.id}
                        style={mobileStaggerStyle(index)}
                        className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${isActive ? 'border-white/28 bg-white/[0.15]' : 'border-white/10 bg-white/5'}`}
                      >
                        <button
                          className="flex min-w-0 flex-1 items-center gap-2 bg-transparent text-left"
                          onClick={() => {
                            if (isActive) {
                              notifyMinimize(window.id);
                            } else {
                              activateWindow(window.id);
                            }
                            closeLauncher();
                          }}
                        >
                          {appIcon ? <img src={appIcon} alt={window.title} className="h-8 w-8 flex-shrink-0 object-contain" /> : null}
                          <div className="min-w-0">
                            <div className="truncate text-sm text-white/92">{window.title}</div>
                            <div className="truncate text-[11px] text-white/55">{isActive ? 'Active' : 'Background'}</div>
                          </div>
                        </button>
                        <button
                          className="rounded-full p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
                          onClick={(event) => {
                            event.stopPropagation();
                            sendIntentToClose(window.id);
                          }}
                          aria-label={`Close ${window.title}`}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-white/55">No running apps.</p>
              )
            ) : searchTerm ? (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h3 className={sharedSearchResultsHeadingClassName}>Search Results</h3>
                {renderSearchResultsList(true)}
              </div>
            ) : activeTab === 'home' ? (
              <div className="space-y-5">
                <section>
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/45">Pinned</h3>
                  {pinnedApps.length ? renderMobileAppGrid(pinnedApps) : <p className="text-sm text-white/55">No pinned apps yet.</p>}
                </section>

                <section>
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/45">Recommended</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {recentApps.map((app, index) => (
                      <button
                        key={`recent-mobile-${app.id}`}
                        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-2 text-left hover:bg-white/10"
                        style={mobileStaggerStyle(index)}
                        onClick={() => {
                          launchApp(app.id);
                          closeLauncher();
                        }}
                      >
                        <img src={app.icon} alt={app.name} className="h-8 w-8 object-contain" />
                        <span className="truncate text-sm text-white/90">{app.name}</span>
                      </button>
                    ))}
                  </div>
                </section>
              </div>
            ) : (
              renderMobileAppGrid(filteredApps)
            )}
          </div>
        </section>
      </div>
    );
  }

  // Desktop Launcher (centered, no screen blur)
  const isClassicTaskbar = taskbarStyle === 'classic';
  const launcherAnchorClass = isClassicTaskbar ? 'left-4 origin-bottom-left' : 'left-1/2 origin-bottom';
  const launcherTranslateX = isClassicTaskbar ? '0px' : '-50%';

  return (
    <div
      className={`launcher fixed ${taskbarStyle === 'floating' ? 'bottom-24' : 'bottom-16'} ${launcherAnchorClass} w-[780px] max-w-[90vw] h-[520px] flex rounded-2xl overflow-hidden border border-(--window-border-active) shadow-[0_12px_40px_rgba(0,0,0,0.28)] z-9998 ${launcherVisible
        ? 'opacity-100'
        : 'opacity-100 pointer-events-none'
        }`}
      style={{
        transform: `translate(${launcherTranslateX}, ${launcherVisible ? '0px' : '120%'}) translateZ(0)`,
        transition: 'transform 450ms cubic-bezier(0.19, 1, 0.22, 1)',
      }}
      onClick={(event) => event.stopPropagation()}
    >
      <div className="w-16 bg-[var(--header-bg-active)] border-r border-[var(--window-border-active)] flex flex-col items-center py-6 gap-6">
        <div className="flex-1 flex flex-col gap-3 w-full px-2 items-center">
          <button
            className={`p-3 rounded-xl transition-all duration-200 flex flex-col items-center gap-1 group w-full aspect-square justify-center ${activeTab === 'home' ? 'bg-[var(--sidebar-item-active-bg)] text-[var(--sidebar-item-active-text)] shadow-inner' : 'text-[var(--text-color)] opacity-60 hover:bg-[var(--sidebar-item-hover-bg)] hover:text-[var(--text-color)] hover:opacity-100 bg-transparent'
              }`}
            onClick={() => setActiveTab('home')}
            title="Home"
          >
            <Home size={22} className="group-active:scale-90 transition-transform" />
          </button>
          <button
            className={`p-3 rounded-xl transition-all duration-200 flex flex-col items-center gap-1 group w-full aspect-square justify-center ${activeTab === 'all' ? 'bg-[var(--sidebar-item-active-bg)] text-[var(--sidebar-item-active-text)] shadow-inner' : 'text-[var(--text-color)] opacity-60 hover:bg-[var(--sidebar-item-hover-bg)] hover:text-[var(--text-color)] hover:opacity-100 bg-transparent'
              }`}
            onClick={() => setActiveTab('all')}
            title="All Apps"
          >
            <Grid size={22} className="group-active:scale-90 transition-transform" />
          </button>
        </div>

        <div className="flex flex-col gap-3 w-full px-2 items-center">
          <button
            className="p-3 text-[var(--text-color)] opacity-60 hover:text-[var(--text-color)] hover:opacity-100 hover:bg-[var(--sidebar-item-hover-bg)] rounded-xl transition-colors bg-transparent w-full aspect-square flex items-center justify-center"
            title="Settings"
            onClick={() => {
              launchApp('settings');
              closeLauncher();
            }}
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-[var(--window-bg)]">
        <div className="p-5 border-b border-[var(--window-border-active)]">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-color)] opacity-40 group-focus-within:text-blue-400 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search apps, files, and settings..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              autoFocus
              className="w-full bg-[var(--taskbar-item-bg)] border border-[var(--window-border-active)] rounded-xl py-3 pl-10 pr-4 text-[var(--text-color)] placeholder:text-[var(--text-color)] placeholder:opacity-30 focus:outline-none focus:bg-[var(--taskbar-item-hover-bg)] focus:border-blue-500/30 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {searchTerm ? (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h3 className={sharedSearchResultsHeadingClassName}>Search Results</h3>
              {renderSearchResultsList(false)}
            </div>
          ) : activeTab === 'home' ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <h3 className="text-xs font-bold text-[var(--text-color)] opacity-40 uppercase tracking-wider mb-4 px-1">Pinned Favorites</h3>
                <div className="grid grid-cols-5 gap-2">
                  {pinnedApps.map((app) => (
                    <LauncherIcon
                      key={app.id}
                      imageSrc={app.icon}
                      text={app.name}
                      onClick={() => {
                        launchApp(app.id);
                        closeLauncher();
                      }}
                      onContextMenu={(event) => handleContextMenu(event, app.id)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-[var(--text-color)] opacity-40 uppercase tracking-wider mb-4 px-1">Recommended</h3>
                <div className="grid grid-cols-2 gap-3">
                  {recentApps.map((app) => (
                    <LauncherIcon
                      key={`recent-${app.id}`}
                      imageSrc={app.icon}
                      text={app.name}
                      variant="list"
                      onClick={() => {
                        launchApp(app.id);
                        closeLauncher();
                      }}
                      onContextMenu={(event) => handleContextMenu(event, app.id)}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h3 className="text-xs font-bold text-[var(--text-color)] opacity-40 uppercase tracking-wider mb-4 px-1">All Applications</h3>
              <div className="grid grid-cols-5 gap-2">
                {filteredApps.map((app) => (
                  <LauncherIcon
                    key={app.id}
                    imageSrc={app.icon}
                    text={app.name}
                    onClick={() => {
                      launchApp(app.id);
                      closeLauncher();
                    }}
                    onContextMenu={(event) => handleContextMenu(event, app.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {contextMenu.visible && contextMenu.appId && (
        <ContextMenu
          position={{ x: contextMenu.x, y: contextMenu.y }}
          onClose={closeContextMenu}
          contextMenuItems={[
            {
              label: isPinned(contextMenu.appId) ? 'Unpin from Taskbar' : 'Pin to Taskbar',
              onClick: () => {
                if (contextMenu.appId) {
                  togglePin(contextMenu.appId);
                }
              },
            },
          ]}
        />
      )}
    </div>
  );
};

export default Launcher;
