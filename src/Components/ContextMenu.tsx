import { type MouseEvent as ReactMouseEvent } from 'react';
import './ContextMenu.css';

export interface ContextMenuItemConfig {
  label: string;
  onClick: (event: ReactMouseEvent<HTMLDivElement>) => void;
}

interface ContextMenuProps {
  contextMenuItems: ContextMenuItemConfig[];
  position: { x: number; y: number };
  onClose: () => void;
}

const ContextMenu = ({ contextMenuItems, position, onClose }: ContextMenuProps): JSX.Element => {
  return (
    <div
      className="context-menu"
      style={{
        top: position.y,
        left: position.x,
      }}
    >
      {contextMenuItems.map((item, index) => (
        <ContextMenuItem
          key={index}
          onClick={(event) => {
            item.onClick(event);
            onClose();
          }}
          label={item.label}
        />
      ))}
    </div>
  );
};

interface ContextMenuItemProps {
  onClick: (event: ReactMouseEvent<HTMLDivElement>) => void;
  label: string;
}

const ContextMenuItem = ({ onClick, label }: ContextMenuItemProps): JSX.Element => {
  return (
    <div className="context-menu-item" onClick={onClick}>
      {label}
    </div>
  );
};

export { ContextMenu, ContextMenuItem };
