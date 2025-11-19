import { type MouseEvent as ReactMouseEvent, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './ContextMenu.css';

export interface ContextMenuItemConfig {
  label?: string;
  onClick?: (event: ReactMouseEvent<HTMLDivElement>) => void;
  type?: 'item' | 'separator' | 'header';
  render?: () => React.ReactNode;
  onMouseEnter?: (event: ReactMouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: (event: ReactMouseEvent<HTMLDivElement>) => void;
}

interface ContextMenuProps {
  contextMenuItems: ContextMenuItemConfig[];
  position: { x: number; y: number };
  onClose: () => void;
  style?: React.CSSProperties;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const ContextMenu = ({ contextMenuItems, position, onClose, style, onMouseEnter, onMouseLeave }: ContextMenuProps): JSX.Element => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.context-menu')) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return createPortal(
    <div
      className="context-menu"
      style={{
        top: position.y,
        left: position.x,
        ...style,
      }}
      onContextMenu={(e) => e.preventDefault()}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {contextMenuItems.map((item, index) => {
        if (item.type === 'separator') {
          return <div key={index} className="context-menu-separator" />;
        }
        if (item.type === 'header') {
          return <div key={index} className="context-menu-header">{item.label}</div>;
        }

        return (
          <ContextMenuItem
            key={index}
            onClick={(event) => {
              if (item.onClick) {
                item.onClick(event);
                onClose();
              }
            }}
            label={item.label || ''}
            render={item.render}
            onMouseEnter={item.onMouseEnter}
            onMouseLeave={item.onMouseLeave}
          />
        );
      })}
    </div>,
    document.body
  );
};

interface ContextMenuItemProps {
  onClick: (event: ReactMouseEvent<HTMLDivElement>) => void;
  label: string;
  render?: () => React.ReactNode;
  onMouseEnter?: (event: ReactMouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: (event: ReactMouseEvent<HTMLDivElement>) => void;
}

const ContextMenuItem = ({ onClick, label, render, onMouseEnter, onMouseLeave }: ContextMenuItemProps): JSX.Element => {
  return (
    <div
      className="context-menu-item"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {render ? render() : label}
    </div>
  );
};

export { ContextMenu, ContextMenuItem };
