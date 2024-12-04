import React from 'react';
import './DesktopIcon.css'; // Make sure to create this CSS file for styling

const DesktopIcon = ({ imageSrc, text, onClick }) => {
    return (
        <button className="icon-button" onDoubleClick={onClick}>
            <img src={imageSrc} alt={text} className="icon-image" />
            <span className="icon-text">{text}</span>
        </button>
    );
};

export default DesktopIcon;