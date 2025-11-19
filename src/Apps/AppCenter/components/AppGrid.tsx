import React from 'react';
import { Search, Box } from 'lucide-react';
import { App } from '../types';

interface AppGridProps {
    apps: App[];
    onOpenApp: (app: App) => void;
    searchTerm: string;
    selectedCategory: string;
}

const AppGrid: React.FC<AppGridProps> = ({ apps, onOpenApp, searchTerm, selectedCategory }) => {
    const filteredApps = apps.filter(app => {
        const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "All" || app.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    if (filteredApps.length === 0) {
        return (
            <div className="no-results py-20">
                <div className="bg-gray-50 p-6 rounded-full mb-4">
                    <Search className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No apps found</h3>
                <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
        );
    }

    return (
        <div
            className="grid gap-6 p-1 items-stretch justify-center"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 340px))' }}
        >
            {filteredApps.map((app) => (
                <div
                    key={app.id}
                    className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full"
                    onClick={() => onOpenApp(app)}
                >
                    <div className="aspect-[16/9] w-full bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors relative overflow-hidden">
                        {app.icon ? (
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
                        
                        {/* Fallback for when image fails to load (handled by onError above, but this is for initial render if no icon) */}
                        {!app.icon && (
                             <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-4xl font-bold text-gray-200 select-none">{app.name.charAt(0)}</span>
                             </div>
                        )}
                    </div>

                    <div className="p-5 flex flex-col flex-grow">
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">{app.name}</h3>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-1">{app.category || "Application"}</p>
                            </div>
                        </div>

                        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed mb-4 flex-grow">
                            {app.description}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                            <span className="text-xs font-medium text-gray-400">Free</span>
                            <div className="px-3 py-1.5 bg-gray-50 text-blue-600 text-xs font-bold rounded-full group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                GET
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AppGrid;
