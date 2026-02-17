import React, { forwardRef, useState, useRef, useEffect } from 'react';
import { useWindowContext } from '../WindowContext';
import { useTaskbar } from './TaskbarContext';
import { createPortal } from 'react-dom';
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
    const { activateWindow, notifyMinimize, launchApp } = useWindowContext();
    const { togglePin, taskbarStyle } = useTaskbar();

    const [menuMode, setMenuMode] = useState<'hover' | 'context' | null>(null);

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

    const handleClick = (e: React.MouseEvent) => {
        if (!isOpen) {
            launchApp(appId);
            return;
        }

        if (menuMode) {
            setMenuMode(null);
            return;
        }

        const activeAppWindowId = windowIds.find(id => id === activeWindowId);

        if (activeAppWindowId) {
            notifyMinimize(activeAppWindowId);
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
        setMenuMode('context'); // Show full menu on right click
    };

    const handleMouseEnter = () => {
        if (!isOpen) return;
        if (menuMode === 'context') return;

        // ONLY show hover menu if there is MORE THAN 1 instance
        if (windowIds.length <= 1) return;

        hoverTimeoutRef.current = setTimeout(() => {
            setMenuMode('hover');
        }, 400);
    };

    const handleMouseLeave = () => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
        }

        hoverTimeoutRef.current = setTimeout(() => {
            setMenuMode(null);
        }, 300);
    };

    const handleMenuMouseEnter = () => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
        }
    };

    const handleMenuMouseLeave = () => {
        hoverTimeoutRef.current = setTimeout(() => {
            setMenuMode(null);
        }, 300);
    };

    useEffect(() => {
        const closeMenu = (e: MouseEvent) => {
            if (buttonRef.current && buttonRef.current.contains(e.target as Node)) {
                return;
            }
            setMenuMode(null);
        };

        if (menuMode) {
            window.addEventListener('click', closeMenu);
        }
        return () => {
            window.removeEventListener('click', closeMenu);
            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        };
    }, [menuMode]);

    const displayTitle = title;

    const renderWindowsIndicators = () => {
        if (taskbarStyle !== 'windows' || !isOpen) return null;

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
        if (!menuMode || !buttonRef.current) return null;

        // Double check condition for hover mode
        if (menuMode === 'hover' && windowIds.length <= 1) return null;

        const rect = buttonRef.current.getBoundingClientRect();

        // Position the menu above the taskbar item
        // We use 'bottom' instead of 'top' to let it grow upwards
        const style: React.CSSProperties = {
            top: 'auto',
            bottom: window.innerHeight - rect.top + 10,
            left: rect.left,
            transformOrigin: 'bottom left', // Animate from bottom
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
                position={{ x: rect.left, y: 0 }} // y is ignored due to style override
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
                className={`taskbar-item ${isOpen ? 'open' : ''} ${isActive ? 'active' : ''} ${isPinned ? 'pinned' : ''} ${taskbarStyle}`}
                onClick={handleClick}
                onContextMenu={handleContextMenu}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                title={displayTitle}
            >
                <div className="taskbar-item-content">
                    <img src={icon} alt={title} className="taskbar-icon" />
                    {renderWindowsIndicators()}
                    {taskbarStyle === 'mac' && isOpen && <div className="dock-indicator" />}
                </div>
            </button>
            {renderWindowList()}
        </>
    );
});

TaskbarItem.displayName = 'TaskbarItem';

export default TaskbarItem;
