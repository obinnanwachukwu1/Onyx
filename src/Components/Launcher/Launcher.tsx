import { useState, useMemo, useEffect } from 'react';
import LauncherIcon from './LauncherIcon';
import { useWindowContext } from '../WindowContext';
import { useDeviceContext } from '../DeviceContext';
import { useTaskbar } from '../Taskbar/TaskbarContext';
import appList from '../../Apps/AppList';
import { Search, Home, Grid, Power, User, Settings } from 'lucide-react';
import { ContextMenu, ContextMenuItemConfig } from '../ContextMenu';

const Launcher = (): JSX.Element | null => {
  const { launcherVisible, closeLauncher, launchApp } = useWindowContext();
  const { isMobile } = useDeviceContext();
  // Keep launcher mounted; animate by toggling classes
  const [panelVisible, setPanelVisible] = useState<boolean>(launcherVisible);
  const [activeTab, setActiveTab] = useState<'home' | 'all'>('home');
  const [searchTerm, setSearchTerm] = useState('');
  const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; appId: string | null }>({
    visible: false,
    x: 0,
    y: 0,
    appId: null,
  });

  useEffect(() => {
    // Sync panel visibility with context flag
    setPanelVisible(launcherVisible);
    // Reset search when opening
    if (launcherVisible) {
      setSearchTerm('');
    } else {
      setContextMenu({ visible: false, x: 0, y: 0, appId: null });
    }
  }, [launcherVisible]);

  const filteredApps = useMemo(() => {
    if (!searchTerm) return appList.filter(app => app.showInLauncher);
    return appList.filter(
      app => app.showInLauncher && app.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const { pinnedAppIds, togglePin, isPinned } = useTaskbar();

  const handleContextMenu = (e: React.MouseEvent, appId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      appId,
    });
  };

  const closeContextMenu = () => {
    setContextMenu({ ...contextMenu, visible: false });
  };

  const pinnedApps = useMemo(() => {
    return pinnedAppIds
      .map(id => appList.find(app => app.id === id))
      .filter((app): app is typeof appList[0] => !!app);
  }, [pinnedAppIds]);

  const recentApps = useMemo(() => {
    return appList.filter(app => app.showInLauncher).slice(0, 4); // Simulate recent apps
  }, []);

  // Always mounted for smooth transitions

  // Mobile Launcher (no blur)
  if (isMobile) {
    return (
      <div
        className={`launcher fixed inset-0 bg-black/70 z-9999 flex flex-col transform-gpu ${panelVisible ? 'translate-y-0' : 'translate-y-full'
          }`}
        style={{
          pointerEvents: launcherVisible ? 'auto' : 'none',
          transition: 'transform 200ms ease-out',
        }}
      >
        <div className="p-6 pt-12 border-b border-white/10">
          <h2 className="text-3xl font-bold text-white tracking-tight">Launcher</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-3 gap-4 content-start">
          {filteredApps.map((app) => (
            <LauncherIcon
              key={app.id}
              imageSrc={app.icon}
              text={app.name}
              onClick={() => {
                launchApp(app.id);
                closeLauncher();
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  // Desktop Launcher (centered, no screen blur)
  return (
    <div
      className={`launcher fixed bottom-16 left-1/2 w-[780px] max-w-[90vw] h-[520px] flex rounded-2xl overflow-hidden border border-[var(--window-border-active)] shadow-[0_12px_40px_rgba(0,0,0,0.28)] z-[9998] origin-bottom ${panelVisible
        ? 'opacity-100'
        : 'opacity-100 pointer-events-none'
        }`}
      style={{
        transform: `translate(-50%, ${panelVisible ? '0px' : '120%'}) translateZ(0)`,
        transition: 'transform 450ms cubic-bezier(0.19, 1, 0.22, 1)',
      }}
      onClick={(e) => e.stopPropagation()}
    >

      <div className="w-16 bg-[var(--header-bg-active)] border-r border-[var(--window-border-active)] flex flex-col items-center py-6 gap-6">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg ring-2 ring-white/10 shrink-0">
          <User size={20} className="text-white" />
        </div>

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

        <div className="flex flex-col gap-3 pb-2 w-full px-2 items-center">
          <button className="p-3 text-[var(--text-color)] opacity-60 hover:text-[var(--text-color)] hover:opacity-100 hover:bg-[var(--sidebar-item-hover-bg)] rounded-xl transition-colors bg-transparent w-full aspect-square flex items-center justify-center" title="Settings">
            <Settings size={20} />
          </button>
          <button
            className="p-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors bg-transparent w-full aspect-square flex items-center justify-center"
            onClick={() => window.location.reload()}
            title="Restart System"
          >
            <Power size={20} />
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
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
              className="w-full bg-[var(--taskbar-item-bg)] border border-[var(--window-border-active)] rounded-xl py-3 pl-10 pr-4 text-[var(--text-color)] placeholder:text-[var(--text-color)] placeholder:opacity-30 focus:outline-none focus:bg-[var(--taskbar-item-hover-bg)] focus:border-blue-500/30 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {searchTerm ? (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h3 className="text-xs font-bold text-[var(--text-color)] opacity-40 uppercase tracking-wider mb-4 px-1">Search Results</h3>
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
                    onContextMenu={(e) => handleContextMenu(e, app.id)}
                  />
                ))}
                {filteredApps.length === 0 && <p className="col-span-full text-(--text-color)/40 text-center py-8">No apps found.</p>}
              </div>
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
                      onContextMenu={(e) => handleContextMenu(e, app.id)}
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
                      onContextMenu={(e) => handleContextMenu(e, app.id)}
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
                    onContextMenu={(e) => handleContextMenu(e, app.id)}
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
