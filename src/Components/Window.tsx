// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindowMinimize } from '@fortawesome/free-solid-svg-icons/faWindowMinimize';
import './Window.css';
import { faCircle, faX } from '@fortawesome/free-solid-svg-icons';
import { PanelLeft, PanelLeftOpen, X as LucideX } from 'lucide-react';
import { faWindowMaximize, faWindowRestore } from '@fortawesome/free-regular-svg-icons';
import { useWindowContext } from './WindowContext';
import { WindowChromeProvider } from './WindowChromeContext';

const Window = ({
  id,
  appId,
  appIcon,
  title,
  content,
  position,
  size,
  isMaximized,
  showInTaskbar,
  isActive,
  restoreSize,
  isRestoringFromTaskbar,
  renderMobile,
  zIndex,
  sidebar,
  sidebarActiveId: sidebarActiveIdProp
}) => {
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [rel, setRel] = useState({ x: 0, y: 0 });
  const [isOpening, setIsOpening] = useState(!isRestoringFromTaskbar);
  const [isClosing, setIsClosing] = useState(false);
  const [isMinimizing, setIsMinimizing] = useState(false);
  const [isMaximizing, setIsMaximizing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [initialPosition, setInitialPosition] = useState(null);
  const [resizeDirection, setResizeDirection] = useState(null);
  const { closingWindowID, activateWindow, setWindowPosition, setWindowSize, sendIntentToClose, sendIntentToMaximize, sendIntentToRestore, notifyClose, notifyMaximize, notifyMinimize, notifyRestore, getTaskbarTransformPos, afterRestoreFromTaskbar } = useWindowContext();
  const [sidebarActiveId, setSidebarActiveId] = useState(sidebarActiveIdFromProps());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerAnimatingOut, setDrawerAnimatingOut] = useState(false);
  const [drawerOpenActive, setDrawerOpenActive] = useState(false);
  const isMobileViewport = !!renderMobile;
  const [isSidebarMobileLayout, setIsSidebarMobileLayout] = useState(
    isMobileViewport || (size?.width ?? 0) <= 640
  );

  function sidebarActiveIdFromProps() {
    // Prefer provided active id on mount; otherwise first sidebar item
    if (typeof sidebarActiveIdProp !== 'undefined') return sidebarActiveIdProp;
    if (typeof sidebar !== 'undefined' && sidebar.items?.length) return sidebar.items[0].id;
    return undefined;
  }

  useEffect(() => {
    if (isOpening) {
      setTimeout(() => {
        setIsOpening(false);
      }, 250);
    } else if (isActive && isRestoringFromTaskbar) {
      getTaskbarTransformPos(id);
      setTimeout(() => {
        afterRestoreFromTaskbar(id);
        isRestoringFromTaskbar = false;
      }, 250);
    }
  }, [isOpening]);

  useEffect(() => {
    if (closingWindowID === id) {
      setIsClosing(true);
      setTimeout(() => {
        notifyClose(id);
      }, 250);
    }
  }, [closingWindowID])

  // Automatically switch sidebar into "mobile" layout when the window is narrow.
  // Still respect an explicit `renderMobile` (mobile viewport) from parents.
  useEffect(() => {
    const breakpoint = 640; // px
    // Predict the target width during maximize/restore animations so
    // the sidebar state matches the destination size for a correct animation.
    let predictiveWidth = size?.width ?? 0;
    try {
      if (isMaximizing) {
        const desktop = document.querySelector('.desktop') as HTMLElement | null;
        if (desktop) predictiveWidth = desktop.getBoundingClientRect().width;
      } else if (isRestoring && restoreSize?.width) {
        predictiveWidth = restoreSize.width;
      }
    } catch {}

    const shouldBeMobileSidebar = isMobileViewport || predictiveWidth <= breakpoint;
    setIsSidebarMobileLayout(shouldBeMobileSidebar);

    // Ensure drawer state matches destination layout for smooth animation
    if (isMaximizing && !shouldBeMobileSidebar) {
      // Going to a wide layout: close drawer so overlay doesn't linger
      setMobileMenuOpen(false);
    }
    if (isRestoring && shouldBeMobileSidebar) {
      // Restoring to a narrow layout: start with drawer hidden
      setMobileMenuOpen(false);
    }
  }, [isMobileViewport, size?.width, isMaximizing, isRestoring, restoreSize?.width]);

  // Whenever the layout crosses the sidebar/mobile breakpoint in either direction,
  // reset the sidebar drawer state so it doesn't "remember" being open.
  useEffect(() => {
    if (!isSidebarMobileLayout) {
      // Trigger closing animation if visible
      setMobileMenuOpen(false);
    }
  }, [isSidebarMobileLayout]);

  // Handle drawer mount/unmount to allow exit animation
  useEffect(() => {
    if (mobileMenuOpen) {
      setDrawerAnimatingOut(false);
      setDrawerVisible(true);
      setDrawerOpenActive(false);
      // Defer to two animation frames to ensure initial closed state is painted
      // before toggling to open, which triggers the transition.
      const raf1 = requestAnimationFrame(() => {
        const raf2 = requestAnimationFrame(() => setDrawerOpenActive(true));
        // store nested id on window to allow cleanup
        (window as any).__raf2 = raf2;
      });
      return () => {
        cancelAnimationFrame(raf1);
        if ((window as any).__raf2) cancelAnimationFrame((window as any).__raf2);
      };
    } else if (drawerVisible) {
      // Trigger closing animation
      setDrawerAnimatingOut(true);
      setDrawerOpenActive(false);
      const t = setTimeout(() => {
        setDrawerVisible(false);
        setDrawerAnimatingOut(false);
      }, 200);
      return () => clearTimeout(t);
    }
  }, [mobileMenuOpen]);

  const handleWindowClick = (e) => {
    e.stopPropagation();
    activateWindow(id);
  };

  const handleClosing = (e) => {
    sendIntentToClose(id);
  }

  const handleMinimizing = (e) => {
    getTaskbarTransformPos(id);
    setIsMinimizing(true);
    setTimeout(() => {
      notifyMinimize(id);
      setIsMinimizing(false);
    }, 250);
  }

  const toggleMaximizing = (e) => {
    if (!isMaximized) {
      sendIntentToMaximize(id);
      setIsMaximizing(true);
      setTimeout(() => {
        notifyMaximize(id);
        setIsMaximizing(false);
      }, 250)
    } else {
      sendIntentToRestore(id);
      setIsRestoring(true);
      setTimeout(() => {
        notifyRestore(id);
        setIsRestoring(false);
      }, 250)
    }
  }

  const normalizeEvent = (e) => {
    if (e.touches && e.touches.length > 0) {
      // Touch event
      return { pageX: e.touches[0].pageX, pageY: e.touches[0].pageY };
    }
    // Mouse event
    return { pageX: e.pageX, pageY: e.pageY };
  };

  const handleMouseDown = (e) => {
    const { pageX, pageY } = normalizeEvent(e);
    e.stopPropagation();
    setInitialPosition({ x: pageX, y: pageY });
    setRel({
      x: pageX - position.x,
      y: pageY - position.y,
    });
    document.body.style.userSelect = 'none';
    activateWindow(id);
  };

  const handleMouseMove = (e) => {
    const { pageX, pageY } = normalizeEvent(e);

    const desktop = document.querySelector('.desktop');
    const desktopBounds = desktop.getBoundingClientRect();

    if (initialPosition) {
      const deltaX = Math.abs(pageX - initialPosition.x);
      const deltaY = Math.abs(pageY - initialPosition.y);
      if (!dragging && (deltaX > 5 || deltaY > 5)) {
        setDragging(true);
      }

      if (dragging) {
        if (!isMaximized) {
          const newX = Math.max(
            0,
            Math.min(pageX - rel.x, desktopBounds.width - size.width)
          );
          const newY = Math.max(
            0,
            Math.min(pageY - rel.y, desktopBounds.height - size.height)
          );

          setWindowPosition(id, { x: newX, y: newY });
        } else {
          notifyRestore(id);
          setWindowSize(id, restoreSize);

          const newX = Math.max(
            0,
            Math.min(pageX - restoreSize.width / 2, desktopBounds.width - restoreSize.width)
          );
          const newY = Math.max(
            Math.min(pageY - 10, desktopBounds.height - restoreSize.height),
            0
          );

          setWindowPosition(id, { x: newX, y: newY });

        }
      }
    }

    if (resizing && resizeDirection) {
      const minWidth = 200;
      const minHeight = 150;

      let newX = position.x;
      let newY = position.y;
      let newWidth = size.width;
      let newHeight = size.height;

      // Right and bottom edges (existing behavior)
      if (resizeDirection.includes('right')) {
        newWidth = Math.max(
          minWidth,
          Math.min(pageX - position.x, desktopBounds.width - position.x)
        );
      }

      if (resizeDirection.includes('bottom')) {
        newHeight = Math.max(
          minHeight,
          Math.min(pageY - position.y, desktopBounds.height - position.y)
        );
      }

      // Left and top edges – adjust position and size together
      if (resizeDirection.includes('left')) {
        const maxX = position.x + size.width - minWidth;
        newX = Math.min(pageX, maxX);
        newX = Math.max(0, newX);
        newWidth = position.x + size.width - newX;
      }

      if (resizeDirection.includes('top')) {
        const maxY = position.y + size.height - minHeight;
        newY = Math.min(pageY, maxY);
        newY = Math.max(0, newY);
        newHeight = position.y + size.height - newY;
      }

      // Ensure window stays within desktop bounds
      if (newX + newWidth > desktopBounds.width) {
        const overflowX = newX + newWidth - desktopBounds.width;
        newWidth = Math.max(minWidth, newWidth - overflowX);
      }

      if (newY + newHeight > desktopBounds.height) {
        const overflowY = newY + newHeight - desktopBounds.height;
        newHeight = Math.max(minHeight, newHeight - overflowY);
      }

      if (newX !== position.x || newY !== position.y) {
        setWindowPosition(id, { x: newX, y: newY });
      }

      setWindowSize(id, { width: newWidth, height: newHeight });
    }
  };

  const handleMouseUp = () => {
    setDragging(false);
    setResizing(false);
    setResizeDirection(null);
    setInitialPosition(false);
    document.body.style.userSelect = '';
  };

  useEffect(() => {
    if (initialPosition || dragging || resizing) {
      // Add mouse and touch event listeners
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleMouseMove, { passive: false });
      document.addEventListener('touchend', handleMouseUp);
    } else {
      // Remove mouse and touch event listeners
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleMouseMove);
      document.removeEventListener('touchend', handleMouseUp);
    }

    // Cleanup on unmount
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleMouseMove);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [initialPosition, dragging, resizing]);

  const handleResizeStart = (e, direction) => {
    e.stopPropagation();
    setResizing(true);
    setResizeDirection(direction);
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    if (initialPosition || dragging || resizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [initialPosition, dragging, resizing]);

  const hasSidebar = !!(sidebar && sidebar.items?.length);
  const showHeader = !renderMobile || (renderMobile && hasSidebar);
  const SidebarIcon = mobileMenuOpen ? PanelLeftOpen : PanelLeft;

  return (
    <div
      className={`window ${renderMobile && isOpening ? 'window-mobile window-mobile-opening' : renderMobile && isClosing ? 'window-mobile window-mobile-closing' : renderMobile ? 'window-mobile' : isOpening ? 'window-opening' : isClosing ? 'window-closing' : isRestoringFromTaskbar ? 'window-restoring-from-taskbar' : isMinimizing ? 'window-minimizing' : isMaximizing ? 'window-maximizing' : isRestoring ? 'window-restoring' : ''} ${isMaximized || isMaximizing ? 'maximized' : ''} ${renderMobile ? '' : isActive ? 'active' : 'inactive'}`}
      style={{
        top: position.y,
        left: position.x,
        width: size.width,
        height: size.height,
        zIndex: zIndex,
      }}
      onMouseDown={handleWindowClick} // Notify App.js to bring this window to the front
    // onContextMenu={(e) => {e.stopPropagation(); e.preventDefault()}}
    >
      {showHeader ? (
        <div
          className={`window-header ${isActive ? 'active' : 'inactive'}`}
          onMouseDown={handleMouseDown}
          onDoubleClick={toggleMaximizing}
          onTouchStart={handleMouseDown}
        >
          <div className="window-header-left">
            {hasSidebar && isSidebarMobileLayout ? (
              <button
                className="caption-button sidebar-toggle-button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMobileMenuOpen((prev) => !prev);
                }}
                aria-label="Open sidebar"
              >
                <SidebarIcon className="mobile-menu-icon" />
              </button>
            ) : null}
          </div>

          {/* On mobile, omit icon/title entirely */}
          {!renderMobile ? (
            <div className="window-header-center">
              <img src={appIcon} className="window-icon" />
              <span className="window-title">{title}</span>
            </div>
          ) : (
            <div className="window-header-center" />
          )}

          {/* On mobile, hide caption buttons */}
          {!renderMobile ? (
            <div className="window-controls">
              <button className="caption-button" onClick={toggleMaximizing}><FontAwesomeIcon icon={faCircle} style={{ color: '#28C840' }} /></button>
              <button className="caption-button" onClick={handleMinimizing}><FontAwesomeIcon icon={faCircle} style={{ color: '#FDBC2E' }} /></button>
              <button className="caption-button" onClick={handleClosing}> <FontAwesomeIcon icon={faCircle} style={{ color: '#FF5E57' }} /></button>
            </div>
          ) : (
            <div className="window-controls" />
          )}
        </div>
      ) : null}
      <div className="window-content" style={{ display: 'flex', flexGrow: 1, width: '100%', height: '100%', position: 'relative' }}>
        {/* Optional window-managed sidebar */}
        {sidebar && sidebar.items?.length && !isSidebarMobileLayout ? (
          <aside
            className={`window-sidebar ${isActive ? 'active' : 'inactive'}`}
            style={{
              width: 220,
              minWidth: 180,
              borderRight: '1px solid var(--window-border-active)',
            }}
            role="navigation"
            aria-label="Window Sidebar"
          >
            <div className="window-sidebar-inner">
              {sidebar.items.map((item) => (
                <button
                  key={item.id}
                  className={`window-sidebar-item ${sidebarActiveId === item.id ? 'active' : ''}`}
                  onClick={() => setSidebarActiveId(item.id)}
                >
                  {item.icon ? <item.icon className="sidebar-item-icon" /> : null}
                  <span className="sidebar-item-label">{item.label}</span>
                </button>
              ))}
            </div>
            {sidebar.footer ? (
              <div className="window-sidebar-footer">
                {sidebar.footer}
              </div>
            ) : null}
          </aside>
        ) : null}

        {/* App content with chrome context */}
        <div
          style={{
            flexGrow: 1,
            width: '100%',
            height: '100%',
            overflow: 'auto'
          }}
        >
          {sidebar && sidebar.items?.length && isSidebarMobileLayout && drawerVisible ? (
            <div
              className={`${renderMobile ? 'window-mobile-drawer-overlay' : 'window-desktop-drawer-overlay'} ${drawerOpenActive && !drawerAnimatingOut ? 'overlay-open' : 'overlay-closing'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <div
                className={`${renderMobile ? 'window-mobile-drawer' : 'window-desktop-drawer'} ${isActive ? 'active' : 'inactive'} ${drawerOpenActive && !drawerAnimatingOut ? 'drawer-open' : 'drawer-closed'}`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="drawer-header">
                  {/* On desktop, hide the app title in the drawer header
                      to avoid duplicating the window titlebar text */}
                  {renderMobile ? <span className="drawer-title">{title}</span> : <span className="drawer-title"></span>}
                </div>
                <div className="drawer-items">
                  {sidebar.items.map((item) => (
                    <button
                      key={item.id}
                      className={`window-sidebar-item ${sidebarActiveId === item.id ? 'active' : ''}`}
                      onClick={() => { setSidebarActiveId(item.id); setMobileMenuOpen(false); }}
                    >
                      {item.icon ? <item.icon className="sidebar-item-icon" /> : null}
                      <span className="sidebar-item-label">{item.label}</span>
                    </button>
                  ))}
                </div>
                {sidebar.footer ? (
                  <div className="drawer-footer">
                    {sidebar.footer}
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
          <WindowChromeProvider value={{ sidebarActiveId, setSidebarActiveId, isWindowActive: !!isActive }}>
            {content}
          </WindowChromeProvider>
        </div>
      </div>
      {/* Corner + edge resize handles */}
      <div
        className="resize-handle resize-handle-bottom-right"
        onMouseDown={(e) => handleResizeStart(e, 'bottom-right')}
      />
      <div
        className="resize-handle resize-handle-bottom-left"
        onMouseDown={(e) => handleResizeStart(e, 'bottom-left')}
      />
      <div
        className="resize-handle resize-handle-top-right"
        onMouseDown={(e) => handleResizeStart(e, 'top-right')}
      />
      <div
        className="resize-handle resize-handle-top-left"
        onMouseDown={(e) => handleResizeStart(e, 'top-left')}
      />
    </div>
  );
};

export default Window;
