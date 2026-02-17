import React, { useEffect, useState } from 'react';
import './Settings.css';
import { useWindowChrome } from '../../Components/WindowChromeContext';
import { setTheme, getTheme } from '../../Components/toggleTheme';
import { useTaskbar, TaskbarStyle } from '../../Components/Taskbar/TaskbarContext';

const Settings = () => {
  const { sidebarActiveId } = useWindowChrome();
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');
  const { taskbarStyle, setTaskbarStyle } = useTaskbar();

  useEffect(() => {
    setCurrentTheme(getTheme());
  }, []);

  const handleThemeChange = (theme: 'light' | 'dark') => {
    setTheme(theme);
    setCurrentTheme(theme);
  };

  const handleTaskbarStyleChange = (style: TaskbarStyle) => {
    setTaskbarStyle(style);
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

      <div className="settings-section">
        <h2>Taskbar</h2>
        <div className="settings-row">
          <span className="settings-label">Select your preferred taskbar style</span>
        </div>
        <div className="theme-preview-container">
          <div 
            className={`theme-option ${taskbarStyle === 'windows' ? 'active' : ''}`}
            onClick={() => handleTaskbarStyleChange('windows')}
          >
             {/* Simple preview for Windows style */}
            <div className="taskbar-preview windows">
                <div className="preview-bar"></div>
            </div>
            <span>Windows 11</span>
          </div>
          <div 
            className={`theme-option ${taskbarStyle === 'mac' ? 'active' : ''}`}
            onClick={() => handleTaskbarStyleChange('mac')}
          >
            {/* Simple preview for Mac style */}
            <div className="taskbar-preview mac">
                <div className="preview-dock"></div>
            </div>
            <span>macOS Dock</span>
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
