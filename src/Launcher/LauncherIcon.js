import React from 'react';
import './LauncherIcon.css'; // Make sure to create this CSS file for styling

const LauncherIcon = ({ imageSrc, text, onClick }) => {
    return (
        <button className="launcher-icon-button" onClick={onClick}>
            <img src={imageSrc} alt={text} className="launcher-icon-image" />
            <span className="launcher-icon-text">{text}</span>
        </button>
    );
};

export default LauncherIcon;