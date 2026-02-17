import React, { forwardRef, useState, useRef, useEffect, useCallback } from 'react';
import { useWindowContext } from '../WindowContext';
import { useTaskbar } from './TaskbarContext';
import { ContextMenu, ContextMenuItemConfig } from '../ContextMenu';

interface TaskbarItemProps {
    appId: string;
    icon: string;
    title: string;
    isOpen: boolean;
    isActive: boolean;
    isPinned: boolean;
    windowIds: number[]; // All window IDs for this app
    activeWindowId?: number | null; // Global active window ID to check which specific window is active
}

const HOVER_OPEN_DELAY_MS = 260;
const HOVER_CLOSE_DELAY_MS = 180;

interface MenuAnchor {
    x: number;
    y: number;
}

const TaskbarItem = forwardRef<HTMLButtonElement, TaskbarItemProps>(({
    appId,
    icon,
    title,
    isOpen,
    isActive,
    isPinned,
    windowIds,
    activeWindowId,
}, ref) => {
    const { activateWindow, notifyMinimize, launchApp, getTaskbarTransformPos } = useWindowContext();
    const { togglePin, taskbarStyle } = useTaskbar();

    const [menuMode, setMenuMode] = useState<'hover' | 'context' | null>(null);
    const [menuAnchor, setMenuAnchor] = useState<MenuAnchor | null>(null);

    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const setRefs = (element: HTMLButtonElement | null) => {
        buttonRef.current = element;
        if (typeof ref === 'function') {
            ref(element);
        } else if (ref) {
            (ref as React.MutableRefObject<HTMLButtonElement | null>).current = element;
        }
    };

    const clearHoverTimeout = useCallback(() => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
        }
    }, []);

    const scheduleMenuMode = useCallback((nextMode: 'hover' | 'context' | null, delay: number) => {
        clearHoverTimeout();
        hoverTimeoutRef.current = setTimeout(() => {
            setMenuMode(nextMode);
        }, delay);
    }, [clearHoverTimeout]);

    const updateMenuAnchor = useCallback(() => {
        const button = buttonRef.current;
        if (!button) return;

        const buttonRect = button.getBoundingClientRect();
        const taskbarRect = button.closest('.taskbar')?.getBoundingClientRect();
        const estimatedMenuWidth = 220;
        const viewportPadding = 8;
        const centeredX = buttonRect.left + (buttonRect.width / 2) - (estimatedMenuWidth / 2);
        const maxX = Math.max(viewportPadding, window.innerWidth - estimatedMenuWidth - viewportPadding);
        const clampedX = Math.max(viewportPadding, Math.min(centeredX, maxX));
        const anchorY = Math.max(12, (taskbarRect ? taskbarRect.top : buttonRect.top) - 8);

        setMenuAnchor((previous) => {
            if (previous && Math.abs(previous.x - clampedX) < 1 && Math.abs(previous.y - anchorY) < 1) {
                return previous;
            }
            return { x: clampedX, y: anchorY };
        });
    }, []);

    const handleClick = () => {
        clearHoverTimeout();

        if (!isOpen) {
            setMenuMode(null);
            launchApp(appId);
            return;
        }

        if (menuMode === 'context' || menuMode === 'hover') {
            setMenuMode(null);
        }

        const activeAppWindowId = windowIds.find(id => id === activeWindowId);

        if (activeAppWindowId) {
            getTaskbarTransformPos(activeAppWindowId);
            notifyMinimize(activeAppWindowId, true);
        } else {
            const mostRecentWindowId = windowIds[windowIds.length - 1];
            if (mostRecentWindowId) {
                activateWindow(mostRecentWindowId);
            }
        }
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        clearHoverTimeout();
        updateMenuAnchor();
        setMenuMode('context'); // Show full menu on right click
    };

    const handleMouseEnter = () => {
        if (!isOpen) return;
        if (menuMode === 'context') return;

        // ONLY show hover menu if there is MORE THAN 1 instance
        if (windowIds.length <= 1) {
            clearHoverTimeout();
            return;
        }

        scheduleMenuMode('hover', HOVER_OPEN_DELAY_MS);
    };

    const handleMouseLeave = () => {
        if (menuMode === 'context') {
            clearHoverTimeout();
            return;
        }

        scheduleMenuMode(null, HOVER_CLOSE_DELAY_MS);
    };

    const handleMenuMouseEnter = () => {
        clearHoverTimeout();
    };

    const handleMenuMouseLeave = () => {
        scheduleMenuMode(null, HOVER_CLOSE_DELAY_MS);
    };

    useEffect(() => {
        return () => {
            clearHoverTimeout();
        };
    }, [clearHoverTimeout]);

    useEffect(() => {
        if (!menuMode) return;

        const handleOutsideInteraction = (event: Event) => {
            const target = event.target as Node | null;
            if (!target) return;

            const isButtonInteraction = !!buttonRef.current && buttonRef.current.contains(target);
            const isMenuInteraction = target instanceof Element && !!target.closest('.context-menu');

            if (isButtonInteraction || isMenuInteraction) return;
            setMenuMode(null);
        };

        document.addEventListener('pointerdown', handleOutsideInteraction, true);
        document.addEventListener('contextmenu', handleOutsideInteraction, true);

        return () => {
            document.removeEventListener('pointerdown', handleOutsideInteraction, true);
            document.removeEventListener('contextmenu', handleOutsideInteraction, true);
        };
    }, [menuMode]);

    useEffect(() => {
        if (!menuMode) {
            setMenuAnchor(null);
            return;
        }

        updateMenuAnchor();
        const handleViewportChange = () => updateMenuAnchor();

        window.addEventListener('resize', handleViewportChange);
        window.addEventListener('scroll', handleViewportChange, true);

        return () => {
            window.removeEventListener('resize', handleViewportChange);
            window.removeEventListener('scroll', handleViewportChange, true);
        };
    }, [menuMode, updateMenuAnchor]);

    const displayTitle = title;

    const renderWindowsIndicators = () => {
        if (taskbarStyle === 'floating' || !isOpen) return null;

        if (windowIds.length <= 1) {
            return <div className={`taskbar-indicator ${isActive ? 'active' : 'minimized-indicator'}`} />;
        }

        return (
            <div className="taskbar-indicator-group">
                <div className={`taskbar-indicator ${isActive ? 'active' : 'minimized-indicator'}`} />
            </div>
        );
    };

    const renderWindowList = () => {
        if (!menuMode || !menuAnchor) return null;

        // Double check condition for hover mode
        if (menuMode === 'hover' && windowIds.length <= 1) return null;

        const style: React.CSSProperties = {
            top: menuAnchor.y,
            left: menuAnchor.x,
            transform: 'translateY(-100%)',
            transformOrigin: 'bottom center',
        };

        const items: ContextMenuItemConfig[] = [];

        // Window list items
        if (isOpen) {
            items.push({ type: 'header', label: title });

            windowIds.forEach((wid, idx) => {
                items.push({
                    type: 'item',
                    label: `Instance ${idx + 1}`,
                    render: () => (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                            <span>Instance {idx + 1}</span>
                            {wid === activeWindowId && <span style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--welcome-accent-blue)' }} title="Active"></span>}
                        </div>
                    ),
                    onClick: () => {
                        activateWindow(wid);
                        setMenuMode(null);
                    }
                });
            });
        }

        if (menuMode === 'context') {
            if (isOpen && items.length > 0) {
                items.push({ type: 'separator' });
            }

            items.push({
                type: 'item',
                label: isPinned ? 'Unpin from Taskbar' : 'Pin to Taskbar',
                onClick: () => {
                    togglePin(appId);
                    setMenuMode(null);
                }
            });

            items.push({
                type: 'item',
                label: 'New Window',
                onClick: () => {
                    launchApp(appId);
                    setMenuMode(null);
                }
            });
        }

        return (
            <ContextMenu
                contextMenuItems={items}
                position={{ x: menuAnchor.x, y: menuAnchor.y }}
                onClose={() => setMenuMode(null)}
                style={style}
                onMouseEnter={handleMenuMouseEnter}
                onMouseLeave={handleMenuMouseLeave}
            />
        );
    };

    return (
        <>
            <button
                ref={setRefs}
                className={`taskbar-item ${isOpen ? 'open' : ''} ${isActive ? 'active' : ''} ${isPinned ? 'pinned' : ''} ${menuMode === 'context' ? 'context-open' : ''} ${taskbarStyle}`}
                onClick={handleClick}
                onContextMenu={handleContextMenu}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                title={displayTitle}
            >
                <div className="taskbar-item-content">
                    <img src={icon} alt={title} className="taskbar-icon" />
                    {renderWindowsIndicators()}
                    {taskbarStyle === 'floating' && isOpen && <div className="dock-indicator" />}
                </div>
            </button>
            {renderWindowList()}
        </>
    );
});

TaskbarItem.displayName = 'TaskbarItem';

export default TaskbarItem;
