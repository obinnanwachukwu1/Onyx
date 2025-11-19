import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { App } from '../types';

interface FeaturedCarouselProps {
    apps: App[];
    onOpenApp: (app: App) => void;
}

const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({ apps, onOpenApp }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    // Fallback to first 3 apps if no featured apps are found
    const featuredApps = apps.filter(app => app.featured).length > 0
        ? apps.filter(app => app.featured)
        : apps.slice(0, 3);

    useEffect(() => {
        if (featuredApps.length === 0) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % featuredApps.length);
        }, 8000);
        return () => clearInterval(interval);
    }, [featuredApps]);

    const nextSlide = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % featuredApps.length);
    };

    const prevSlide = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentIndex((prev) => (prev === 0 ? featuredApps.length - 1 : prev - 1));
    };

    if (featuredApps.length === 0) return null;

    const currentApp = featuredApps[currentIndex];

    return (
        <div className="mb-8 md:mb-12 relative group/carousel">
            {/* Removed Featured title and reduced gap */}
            <div className="mb-4" />

            <div className="relative h-[240px] sm:h-[300px] md:h-[380px] lg:h-[420px] xl:h-[460px] w-full rounded-2xl md:rounded-[2rem] overflow-hidden shadow-2xl ring-1 ring-black/5">

                <div className="absolute inset-0 transition-all duration-700 ease-out transform">
                    <div
                        className="w-full h-full bg-cover bg-center transition-transform duration-[2000ms] hover:scale-105"
                        style={{
                            backgroundImage: currentApp.image ? `url(${currentApp.image})` : 'none',
                            backgroundColor: currentApp.image ? 'transparent' : '#0066cc'
                        }}
                        onClick={() => onOpenApp(currentApp)}
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
                            <div className="absolute bottom-0 left-0 p-5 sm:p-8 md:p-10 max-w-xl sm:max-w-2xl md:max-w-3xl">
                                <div className="mb-3 sm:mb-4 inline-flex items-center px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/10 text-white text-[10px] sm:text-xs font-medium uppercase tracking-wider">
                                    Featured App
                                </div>
                                <h2 className="text-2xl sm:text-4xl md:text-6xl font-bold text-white mb-2 sm:mb-4 tracking-tight drop-shadow-lg leading-tight">
                                    {currentApp.name}
                                </h2>
                                <p className="hidden sm:block text-base md:text-xl text-gray-100 mb-6 md:mb-8 line-clamp-2 leading-relaxed drop-shadow-md max-w-2xl">
                                    {currentApp.description}
                                </p>
                                <button
                                    className="px-4 sm:px-6 md:px-8 py-2.5 sm:py-3.5 md:py-4 bg-white text-gray-900 rounded-lg md:rounded-xl font-bold hover:bg-gray-50 transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 group/btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onOpenApp(currentApp);
                                    }}
                                >
                                    View Details
                                    <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-3 sm:bottom-5 right-1/2 translate-x-1/2 sm:translate-x-0 sm:right-6 md:right-10 flex gap-2 sm:gap-3 z-20">
                    {featuredApps.map((_, idx) => (
                        <button
                            key={idx}
                            className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex
                                ? 'bg-white w-6 sm:w-8'
                                : 'bg-white/40 w-2 hover:bg-white/60'
                                }`}
                            onClick={(e) => {
                                e.stopPropagation();
                                setCurrentIndex(idx);
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FeaturedCarousel;
