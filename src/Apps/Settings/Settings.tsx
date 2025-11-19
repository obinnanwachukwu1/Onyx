import React, { useEffect, useState } from 'react';
import './Settings.css';
import { useWindowChrome } from '../../Components/WindowChromeContext';
import { setTheme, getTheme } from '../../Components/toggleTheme';

const Settings = () => {
  const { sidebarActiveId } = useWindowChrome();
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    setCurrentTheme(getTheme());
  }, []);

  const handleThemeChange = (theme: 'light' | 'dark') => {
    setTheme(theme);
    setCurrentTheme(theme);
  };

  const renderPersonalization = () => (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Personalization</h1>
      </div>
      
      <div className="settings-section">
        <h2>Theme</h2>
        <div className="settings-row">
          <span className="settings-label">Select your preferred theme mode</span>
        </div>
        <div className="theme-preview-container">
          <div 
            className={`theme-option ${currentTheme === 'light' ? 'active' : ''}`}
            onClick={() => handleThemeChange('light')}
          >
            <div className="theme-preview light"></div>
            <span>Light</span>
          </div>
          <div 
            className={`theme-option ${currentTheme === 'dark' ? 'active' : ''}`}
            onClick={() => handleThemeChange('dark')}
          >
            <div className="theme-preview dark"></div>
            <span>Dark</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAbout = () => (
    <div className="settings-container">
      <div className="settings-header">
        <h1>About</h1>
      </div>
      <div className="settings-section">
        <h2>System</h2>
        <div className="settings-row">
          <span className="settings-label">Onyx OS Web Desktop</span>
        </div>
        <div className="settings-row">
          <span className="settings-label">Version 1.0.0</span>
        </div>
      </div>
    </div>
  );

  switch (sidebarActiveId) {
    case 'personalization':
      return renderPersonalization();
    case 'about':
      return renderAbout();
    default:
      return renderPersonalization();
  }
};

export default Settings;
