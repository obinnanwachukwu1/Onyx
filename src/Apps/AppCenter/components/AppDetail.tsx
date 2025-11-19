import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, Download, Code, Calendar, Tag } from 'lucide-react';
import { siGithub } from 'simple-icons';
import { App } from '../types';

interface AppDetailProps {
    app: App;
    onBack: () => void;
}

const AppDetail: React.FC<AppDetailProps> = ({ app, onBack }) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [stack, setStack] = useState(true);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const ro = new ResizeObserver(entries => {
            for (const entry of entries) {
                const width = entry.contentRect.width;
                setStack(width < 960);
            }
        });
        ro.observe(el);
        // Initial measurement
        setStack(el.clientWidth < 960);
        return () => ro.disconnect();
    }, []);
    return (
        <div className="app-detail-page visible">
            <div className="px-6 sm:px-8 md:px-10">
                <button
                    className="inline-flex items-center gap-2 py-1 text-[var(--muted-text)] hover:text-blue-600 transition-colors"
                    onClick={onBack}
                    title="Back to Apps"
                >
                    <ChevronLeft className="w-5 h-5" />
                    <span>Back to Apps</span>
                </button>
            </div>

            <div className="app-detail-body">
                <div ref={containerRef} className="app-detail-content animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto bg-[var(--card-bg)] text-[var(--text-color)] rounded-2xl md:rounded-3xl shadow-none overflow-hidden px-6 sm:px-8 md:px-10">
                <div className="app-detail-hero flex flex-col md:flex-row items-center md:items-stretch py-6 sm:py-8 md:py-10 border-b border-[var(--card-border)] gap-6 md:gap-8 text-center md:text-left">
                    <div className="app-detail-icon-container shrink-0">
                        <div className="app-detail-icon w-24 h-24 sm:w-28 sm:h-28 md:w-40 md:h-40 bg-[var(--subtle-bg)] rounded-2xl flex items-center justify-center shadow-inner p-5 sm:p-6">
                            {app.icon && <img src={app.icon} className="w-full h-full object-contain drop-shadow-sm" alt={app.name} />}
                        </div>
                    </div>

                    <div className="app-detail-info grow flex flex-col justify-center">
                        <h1 className="app-detail-name text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--heading-text)] mb-2 sm:mb-3 tracking-tight">{app.name}</h1>
                        <div className="app-detail-meta flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3 mb-4 sm:mb-6">
                            <span className="app-detail-category bg-blue-50 px-4 py-1.5 rounded-full text-sm font-semibold text-blue-600 border border-blue-100">
                                {app.category || 'Application'}
                            </span>
                            {app.tags && (
                                <div className="app-detail-tags flex flex-wrap gap-2">
                                    {app.tags.map((tag, idx) => (
                                        <span key={idx} className="app-tag flex items-center gap-1.5 bg-[var(--subtle-bg)] px-3 py-1.5 rounded-full text-sm text-[var(--muted-text)] border border-[var(--card-border)]">
                                            <Tag className="w-3.5 h-3.5 text-[var(--muted-text-2)]" /> {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="app-action-buttons flex flex-col sm:flex-row flex-wrap gap-3">
                            {app.canTry && (
                                <button
                                    className="app-primary-button w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg sm:rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 active:scale-95"
                                    onClick={() => window.open(app.trial)}
                                >
                                    <Download className="w-5 h-5" /> Try Now
                                </button>
                            )}
                            {app.github && (
                                <button
                                    className="app-secondary-button w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 bg-[var(--card-bg)] text-[var(--text-color)] border border-[var(--card-border)] rounded-lg sm:rounded-xl font-semibold transition-all flex items-center justify-center gap-2 active:scale-95"
                                    onClick={() => window.open(app.github)}
                                >
                                    <svg
                                        className="w-5 h-5"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path d={siGithub.path} />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {app.screenshots && app.screenshots.length > 0 && (
                    <div className="app-screenshots-section py-5 sm:py-8 md:py-10 border-b border-[var(--card-border)] bg-[color:var(--subtle-bg)]/50">
                        <h3 className="section-title text-lg sm:text-xl font-bold text-[var(--heading-text)] mb-4 sm:mb-6 flex items-center gap-2">
                            Screenshots
                        </h3>
                        <div className="app-screenshots-gallery flex gap-4 sm:gap-6 overflow-x-auto pb-4 sm:pb-6 scrollbar-hide snap-x">
                            {app.screenshots.map((src, index) => (
                                <div key={index} className="screenshot-item flex-none w-[260px] sm:w-[320px] md:w-[400px] rounded-lg sm:rounded-xl overflow-hidden shadow-md border border-[var(--card-border)] snap-center transition-transform hover:scale-[1.02]">
                                    <img src={src} alt={`${app.name} screenshot ${index + 1}`} className="w-full h-auto object-cover" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className={`app-description-section py-5 sm:py-8 md:py-10 ${stack ? 'grid grid-cols-1 gap-6' : 'grid lg:grid-cols-3 gap-8 lg:gap-10'}`}> 
                    <div className={`${stack ? '' : 'lg:col-span-2'}`}> 
                        <h3 className="section-title text-lg sm:text-xl font-bold text-[var(--heading-text)] mb-3 sm:mb-4">About this project</h3>
                        <div className="app-description max-w-none text-[var(--text-color)] leading-relaxed">
                            <p>{app.fullDescription || app.description}</p>
                        </div>
                    </div>

                    <div className={`app-additional-info space-y-4 sm:space-y-6 ${stack ? '' : 'lg:col-span-1'}`}> 
                        <div className={`bg-transparent sm:bg-[var(--subtle-bg)] rounded-none sm:rounded-2xl p-0 sm:p-6 border-0 sm:border sm:border-[var(--card-border)] w-full sm:w-auto max-w-sm mx-auto ${stack ? '' : 'lg:mx-0'} ${stack ? '' : 'lg:sticky lg:top-6'}`}> 
                            <h4 className="font-semibold text-[var(--heading-text)] mb-2 sm:mb-4 text-lg">Details</h4>
                            <div className="space-y-4">
                                <div className="info-item flex items-start gap-3 text-sm">
                                    <Calendar className="w-5 h-5 text-[var(--muted-text-2)] mt-0.5" />
                                    <div>
                                        <span className="block text-[var(--muted-text)] text-[11px] uppercase tracking-wider font-semibold mb-0.5">Released</span>
                                        <span className="text-[var(--heading-text)] font-semibold">{app.releaseDate || 'N/A'}</span>
                                    </div>
                                </div>
                                {app.technologies && (
                                    <div className="info-item flex items-start gap-3 text-sm">
                                        <Code className="w-5 h-5 text-[var(--muted-text-2)] mt-0.5" />
                                        <div>
                                            <span className="block text-[var(--muted-text)] text-[11px] uppercase tracking-wider font-semibold mb-0.5">Built with</span>
                                            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-1.5">
                                                {app.technologies.map((tech, i) => (
                                                    <span key={i} className="inline-block bg-[var(--card-bg)] border border-[var(--card-border)] px-2 py-0.5 rounded text-xs text-[var(--text-color)] font-medium">
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                </div>
            </div>
        </div>
    );
};

export default AppDetail;
