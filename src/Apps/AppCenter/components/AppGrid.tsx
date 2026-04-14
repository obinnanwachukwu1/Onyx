import React from 'react';
import { Search, Box } from 'lucide-react';
import { App } from '../types';

interface AppGridProps {
    apps: App[];
    onOpenApp: (app: App) => void;
    searchTerm: string;
    selectedCategory: string;
    compactMissingMedia?: boolean;
}

const AppGrid: React.FC<AppGridProps> = ({
    apps,
    onOpenApp,
    searchTerm,
    selectedCategory,
    compactMissingMedia = false,
}) => {
    const filteredApps = apps.filter(app => {
        const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "All" || app.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const appsWithBanner = filteredApps.filter((app) => Boolean(app.image));
    const appsWithoutBanner = filteredApps.filter((app) => !app.image);

    if (filteredApps.length === 0) {
        return (
            <div className="no-results py-20">
                <div className="bg-subtle p-6 rounded-full mb-4">
                    <Search className="w-10 h-10 text-muted-2" />
                </div>
                <h3 className="text-xl font-semibold text-heading mb-2">No apps found</h3>
                <p className="text-muted">Try adjusting your search or filters</p>
            </div>
        );
    }

    const renderBannerCard = (app: App) => {
        const usingIconAsBanner = Boolean(app.image && app.icon && app.image === app.icon);
        return (
            <div
                key={app.id}
                className="group relative bg-card rounded-2xl border border-card shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full"
                onClick={() => onOpenApp(app)}
            >
                <div className="aspect-[16/9] w-full bg-subtle flex items-center justify-center transition-colors relative overflow-hidden">
                    {app.image ? (
                        <img 
                            src={app.image}
                            alt={`${app.name} banner`}
                            className={`w-full h-full transition-transform duration-500 group-hover:scale-105 ${usingIconAsBanner ? 'object-contain p-6 sm:p-8' : 'object-cover'}`}
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement?.classList.add('fallback-icon');
                            }}
                        />
                    ) : app.icon ? (
                        <img 
                            src={app.icon} 
                            alt={app.name} 
                            className="w-20 h-20 object-contain drop-shadow-md transition-transform duration-500 group-hover:scale-110"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement?.classList.add('fallback-icon');
                            }}
                        />
                    ) : (
                        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                            <Box className="w-8 h-8" />
                        </div>
                    )}

                    {!app.icon && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-4xl font-bold text-muted-2 select-none">{app.name.charAt(0)}</span>
                        </div>
                    )}
                </div>

                <div className="p-5 flex flex-col flex-grow">
                    <div className="mb-2">
                        <h3 className="font-bold text-lg text-heading group-hover:text-blue-600 transition-colors line-clamp-1">{app.name}</h3>
                    </div>

                    <p className="text-sm text-muted line-clamp-2 leading-relaxed mb-4 flex-grow">
                        {app.description}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-card mt-auto">
                        <span className="text-xs font-medium text-muted-2">Free</span>
                        <div className="px-3 py-1.5 bg-subtle text-blue-600 text-xs font-bold rounded-full group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            GET
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderCompactCard = (app: App) => (
        <button
            key={app.id}
            className="group w-full text-left bg-card rounded-2xl border border-card shadow-sm hover:shadow-lg transition-all duration-300 px-4 py-4"
            onClick={() => onOpenApp(app)}
        >
            <div className="flex items-start gap-4">
                <div className="shrink-0 w-12 h-12 rounded-xl bg-subtle border border-card flex items-center justify-center overflow-hidden">
                    {app.icon ? (
                        <img src={app.icon} alt={app.name} className="w-8 h-8 object-contain" />
                    ) : (
                        <span className="text-lg font-bold text-muted-2 select-none">{app.name.charAt(0)}</span>
                    )}
                </div>
                <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-base text-heading group-hover:text-blue-600 transition-colors line-clamp-1 mb-1">{app.name}</h3>
                    <p className="text-sm text-muted line-clamp-2 leading-relaxed">{app.description}</p>
                </div>
            </div>
        </button>
    );

    const renderBannerGrid = (entries: App[]) => (
        <div
            className="grid gap-5 sm:gap-6 p-1 items-stretch justify-center [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]"
        >
            {entries.map(renderBannerCard)}
        </div>
    );

    const renderCompactGrid = (entries: App[]) => (
        <div className="grid gap-3 sm:gap-4 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
            {entries.map(renderCompactCard)}
        </div>
    );

    if (!compactMissingMedia) {
        return renderBannerGrid(filteredApps);
    }

    return (
        <div className="space-y-8">
            {appsWithBanner.length > 0 && renderBannerGrid(appsWithBanner)}

            {appsWithoutBanner.length > 0 && (
                <section className="space-y-4">
                    {appsWithBanner.length > 0 && (
                        <div className="px-1">
                            <h3 className="text-lg sm:text-xl font-bold text-heading tracking-tight">More Apps</h3>
                        </div>
                    )}
                    {renderCompactGrid(appsWithoutBanner)}
                </section>
            )}
        </div>
    );
};

export default AppGrid;
