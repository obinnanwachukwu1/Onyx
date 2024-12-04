import React from 'react';
import { useState } from 'react';
import './ContextMenu.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretRight } from '@fortawesome/free-solid-svg-icons';

const ContextMenu = ({ contextMenuItems, position, onClose}) => {
    return (
        <div className="context-menu" style={{
            top: position.y,
            left: position.x,
          }}>
            {contextMenuItems.map((item, index) => (
                <ContextMenuItem 
                    key={index} 
                    onClick={(e) => {
                        item.onClick(e);
                        onClose();
                    }} 
                    label={item.label} 
                />
            ))}
        </div>
    );
};

const ContextMenuItem = ({ onClick, label}) => {

    return (
        <div className="context-menu-item" onClick={onClick}>
            {label}
        </div>
    );
};

export { ContextMenu, ContextMenuItem };