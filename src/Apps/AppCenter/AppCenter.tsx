import { useEffect, useRef, useState } from "react";
import LoadingScreen from "../../components/LoadingScreen/LoadingScreen";
import "./AppCenter.animations.css";
import "./AppCenter.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFaceFrown, faSearch, faRefresh } from "@fortawesome/free-solid-svg-icons";
import { useWindowChrome, useWindowInitialReveal, useWindowLaunchAnimation } from "../../components/WindowChromeContext";
import FeaturedCarousel from "./components/FeaturedCarousel";
import AppGrid from "./components/AppGrid";
import AppDetail from "./components/AppDetail";
import { App } from "./types";

const MAX_SCREENSHOT_COUNT = 4;

const assetSlugOverrides: Record<string, string> = {
  "AI Q&A Tool": "AIQA",
  "Agent Arena": "AgentArena",
  "Dungeon Crawler": "DungeonCrawler",
  "Interview Prepper": "InterviewPrepper",
  "SmartCare.ai": "SmartCare",
};

const getAssetSlug = (appName: string) =>
  assetSlugOverrides[appName] ?? appName.replace(/[^a-z0-9]+/gi, "");

const assetExists = async (path: string) => {
  try {
    const response = await fetch(path, { method: "HEAD", cache: "no-cache" });
    return response.ok;
  } catch {
    return false;
  }
};

const hydrateAppAssets = async (app: App): Promise<App> => {
  const slug = getAssetSlug(app.name);
  const icon = `/projects/${slug}/logo.webp`;
  const image = `/projects/${slug}/banner.webp`;
  const screenshots = Array.from(
    { length: MAX_SCREENSHOT_COUNT },
    (_, index) => `/projects/${slug}/s${index + 1}.webp`
  );

  const [hasIcon, hasImage, screenshotAvailability] = await Promise.all([
    assetExists(icon),
    assetExists(image),
    Promise.all(screenshots.map(assetExists)),
  ]);

  return {
    ...app,
    icon: hasIcon ? icon : undefined,
    image: hasImage ? image : undefined,
    screenshots: screenshots.filter((_, index) => screenshotAvailability[index]),
  };
};

const AppCenter = () => {
  const [apps, setApps] = useState<App[]>([]);
  const [currentApp, setCurrentApp] = useState<App | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [prevSidebarId, setPrevSidebarId] = useState<string | null>(null);
  const [tabAnimationNonce, setTabAnimationNonce] = useState(0);
  const previousSidebarIdRef = useRef<string | undefined>(undefined);
  const playLaunchAnimation = useWindowLaunchAnimation();
  const { markInitialRevealReady } = useWindowInitialReveal();

  // Get sidebar state from Window context
  const { sidebarActiveId, setSidebarActiveId } = useWindowChrome();

  useEffect(() => {
    let cancelled = false;

    const loadApps = async () => {
      try {
        const response = await fetch('/projects/project_list.json', { cache: "no-cache" });
        if (!response.ok) throw new Error('Failed to fetch projects');

        const data = await response.json() as App[];
        const hydratedApps = await Promise.all(data.map(hydrateAppAssets));

        if (cancelled) return;

        setApps(hydratedApps);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to fetch projects');
        setLoading(false);
      }
    };

    loadApps();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!loading) {
      markInitialRevealReady?.();
    }
  }, [loading, markInitialRevealReady]);

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
    const categories = apps
      .map(app => app.category)
      .filter((category): category is string => Boolean(category));
    return ["All", ...new Set(categories)];
  };

  const parseReleaseDate = (releaseDate?: string) => {
    if (!releaseDate) return 0;

    const trimmed = releaseDate.trim();
    const normalized = /^\d{4}$/.test(trimmed) ? `January 1, ${trimmed}` : trimmed;
    const timestamp = Date.parse(normalized);
    return Number.isNaN(timestamp) ? 0 : timestamp;
  };

  const getRecommendedApps = () => {
    const MAX_RECOMMENDED = 6;

    return sortAppsByRecency(apps)
      .slice(0, MAX_RECOMMENDED);
  };

  const sortAppsByRecency = (entries: App[]) => {
    return [...entries]
      .sort((a, b) => {
        const releaseDiff = parseReleaseDate(b.releaseDate) - parseReleaseDate(a.releaseDate);
        if (releaseDiff !== 0) return releaseDiff;

        const idA = Number.parseInt(String(a.id), 10);
        const idB = Number.parseInt(String(b.id), 10);
        const safeIdA = Number.isNaN(idA) ? 0 : idA;
        const safeIdB = Number.isNaN(idB) ? 0 : idB;
        return safeIdB - safeIdA;
      });
  };

  useEffect(() => {
    const previousSidebarId = previousSidebarIdRef.current;

    if (
      previousSidebarId &&
      previousSidebarId !== sidebarActiveId &&
      sidebarActiveId &&
      (sidebarActiveId === 'home' || sidebarActiveId === 'all-apps')
    ) {
      setTabAnimationNonce((previous) => previous + 1);
    }

    previousSidebarIdRef.current = sidebarActiveId;
  }, [sidebarActiveId]);

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
                sidebarActiveId === 'all-apps' ? 'All Apps' : 'App Center'}
            </h1>
            <p className="text-base sm:text-lg text-muted font-medium max-w-2xl">
              {sidebarActiveId === 'home' ? 'Explore the best apps for you' :
                sidebarActiveId === 'all-apps' ? 'Browse the complete catalog' :
                  'Browse the app catalog'}
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
          <div
            key={`home-${tabAnimationNonce}`}
            className={`space-y-10 lg:space-y-12 ${playLaunchAnimation || tabAnimationNonce > 0 ? 'animate-in fade-in duration-500' : ''}`}
          >
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
                apps={getRecommendedApps()}
                onOpenApp={openApp}
                searchTerm={searchTerm}
                selectedCategory="All"
              />
            </div>
          </div>
        )}

        {/* All Apps Tab Content */}
        {sidebarActiveId === 'all-apps' && (
          <div
            key={`all-apps-${tabAnimationNonce}`}
            className={`space-y-6 ${playLaunchAnimation || tabAnimationNonce > 0 ? 'animate-in fade-in duration-500' : ''}`}
          >
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
              apps={sortAppsByRecency(apps)}
              onOpenApp={openApp}
              searchTerm={searchTerm}
              selectedCategory={selectedCategory}
              compactMissingMedia
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AppCenter;
