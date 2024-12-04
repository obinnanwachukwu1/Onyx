import React from 'react';
import './Launcher.css';

const Launcher = ({ isVisible, onClose }) => {
  if (!isVisible) return null;

  return (
    <div className="launcher">
      <div className="launcher-content">
        <h3>Launcher</h3>
        <div className="launcher-items">
          <div className="launcher-item">Programs</div>
          <div className="launcher-item">Documents</div>
          <div className="launcher-item">Settings</div>
        </div>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default Launcher;
