import React, { useState, useEffect } from "react";
import LoadingScreen from "../../Components/LoadingScreen/LoadingScreen";
import "./AppCenter.animations.css";
import "./AppCenter.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFaceFrown, faSearch, faRefresh } from "@fortawesome/free-solid-svg-icons";
import { useWindowChrome } from "../../Components/WindowChromeContext";
import FeaturedCarousel from "./components/FeaturedCarousel";
import AppGrid from "./components/AppGrid";
import AppDetail from "./components/AppDetail";
import { App } from "./types";

const AppCenter = () => {
  const [apps, setApps] = useState<App[]>([]);
  const [currentApp, setCurrentApp] = useState<App | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [prevSidebarId, setPrevSidebarId] = useState<string | null>(null);

  // Get sidebar state from Window context
  const { sidebarActiveId, setSidebarActiveId } = useWindowChrome();

  useEffect(() => {
    fetch('/projects/project_list.json', { cache: "no-cache" })
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch projects');
        return response.json();
      })
      .then(data => {
        setApps(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Reset view when sidebar tab changes
  useEffect(() => {
    if (sidebarActiveId) {
      setCurrentApp(null);
      setSearchTerm("");
      if (sidebarActiveId === 'all-apps') {
        setSelectedCategory("All");
      }
    }
  }, [sidebarActiveId]);

  const openApp = (app: App) => {
    setCurrentApp(app);
    // Remember current sidebar tab and clear highlight while viewing details
    setPrevSidebarId(sidebarActiveId ?? null);
    setSidebarActiveId?.(null as any);
  };

  const goBack = () => {
    setCurrentApp(null);
    if (prevSidebarId) {
      setSidebarActiveId?.(prevSidebarId as any);
      setPrevSidebarId(null);
    }
  };

  const getCategories = () => {
    if (!apps.length) return ["All"];
    const categories = apps.map(app => app.category).filter(Boolean);
    return ["All", ...new Set(categories)];
  };

  if (loading) return <LoadingScreen />;

  if (error) {
    return (
      <div className="error-state">
        <div className="error-icon">
          <FontAwesomeIcon icon={faFaceFrown} size="3x" />
        </div>
        <h2>Something Went Wrong</h2>
        <p>We're having trouble loading the App Center right now.</p>
        <p className="error-code">Error: {error}</p>
        <button className="app-primary-button" onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }

  // If an app is selected, show the detail view regardless of the tab
  if (currentApp) {
    return <AppDetail app={currentApp} onBack={goBack} />;
  }

  return (
    <div className="app-center-container h-full overflow-y-auto overflow-x-hidden">
      <div className="px-5 sm:px-8 md:px-10 lg:px-12 py-6 md:py-8 lg:py-10 max-w-6xl mx-auto">

        {/* Header with Search - Common across tabs unless hidden */}
        <header className="flex flex-col md:flex-row md:flex-wrap md:items-end justify-between mb-6 lg:mb-8 gap-4 md:gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-heading tracking-tight mb-1 sm:mb-2">
              {sidebarActiveId === 'home' ? 'Discover' :
                sidebarActiveId === 'all-apps' ? 'All Apps' :
                  sidebarActiveId === 'updates' ? 'Updates' : 'App Center'}
            </h1>
            <p className="text-base sm:text-lg text-muted font-medium max-w-2xl">
              {sidebarActiveId === 'home' ? 'Explore the best apps for you' :
                sidebarActiveId === 'all-apps' ? 'Browse the complete catalog' :
                  'Latest changes and improvements'}
            </p>
          </div>

          <div className="w-full md:w-auto flex flex-row items-center gap-3 md:gap-4">
            <div className="relative flex-1 min-w-0 group">
              <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-2 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Search apps..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex min-w-0 pl-11 pr-4 py-3 input-bg border-2 border-transparent focus:bg-card focus:border-blue-500 rounded-2xl transition-all outline-none font-medium text-body"
              />
            </div>
            <div className="">
              <button
                className="p-3 text-muted hover:text-blue-600 bg-card border border-card hover:border-blue-200 rounded-xl transition-colors duration-200 outline-none shadow-sm"
                onClick={() => setLoading(true)}
                title="Refresh"
              >
                <FontAwesomeIcon icon={faRefresh} className="text-lg" />
              </button>
            </div>
          </div>
        </header>

        {/* Home Tab Content */}
        {sidebarActiveId === 'home' && (
          <div className="space-y-10 lg:space-y-12 animate-in fade-in duration-500">
            {!searchTerm && <FeaturedCarousel apps={apps} onOpenApp={openApp} />}

            <div>
              <div className="flex items-center justify-between mb-4 sm:mb-6 px-1">
                <h2 className="text-2xl font-bold text-heading tracking-tight">Recommended for You</h2>
                <button
                  className="group flex items-center gap-1 px-4 py-2 rounded-full bg-subtle text-blue-600 text-sm font-semibold hover:pr-3 transition-all duration-300 outline-none"
                  onClick={() => setSidebarActiveId?.('all-apps')}
                >
                  View All
                  <span className="w-0 overflow-hidden group-hover:w-4 transition-all duration-300">→</span>
                </button>
              </div>
              <AppGrid
                apps={apps.slice(0, 6)} // Show first 6 as recommended
                onOpenApp={openApp}
                searchTerm={searchTerm}
                selectedCategory="All"
              />
            </div>
          </div>
        )}

        {/* All Apps Tab Content */}
        {sidebarActiveId === 'all-apps' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {getCategories().map(category => (
                <button
                  key={category}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-subtle text-muted hover:brightness-110'
                    }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>

            <AppGrid
              apps={apps}
              onOpenApp={openApp}
              searchTerm={searchTerm}
              selectedCategory={selectedCategory}
            />
          </div>
        )}

        {/* Updates Tab Content */}
        {sidebarActiveId === 'updates' && (
          <div className="max-w-2xl mx-auto animate-in fade-in duration-500">
            <div className="space-y-8">
              <div className="relative pl-8 border-l-2 border-blue-500">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-500 border-4 border-white shadow-sm"></div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1 block">Just Now</span>
                <h3 className="text-lg font-bold text-heading mb-2">App Center Redesign</h3>
                <p className="text-muted leading-relaxed">
                  Welcome to the new App Center! We've completely overhauled the design to provide a better browsing experience.
                  Enjoy the new sidebar navigation, improved search, and beautiful app details.
                </p>
              </div>

              <div className="relative pl-8 border-l-2 border-gray-200">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-gray-300 border-4 border-white"></div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-2 mb-1 block">Previous</span>
                <h3 className="text-lg font-bold text-heading mb-2">Performance Improvements</h3>
                <p className="text-muted leading-relaxed">
                  Optimized loading times and smoother transitions across the system.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AppCenter;
