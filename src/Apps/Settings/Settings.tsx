import { useEffect, useState } from 'react';
import './Settings.css';
import { useWindowChrome } from '../../components/WindowChromeContext';
import { setTheme, getTheme } from '../../components/toggleTheme';
import { useTaskbar, TaskbarStyle } from '../../components/Taskbar/TaskbarContext';

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
          <span className="settings-label">Select your preferred taskbar layout</span>
        </div>
        <div className="theme-preview-container">
          <div 
            className={`theme-option ${taskbarStyle === 'classic' ? 'active' : ''}`}
            onClick={() => handleTaskbarStyleChange('classic')}
          >
            <div className="taskbar-preview classic">
                <div className="preview-bar"></div>
            </div>
            <span>Classic</span>
          </div>
          <div 
            className={`theme-option ${taskbarStyle === 'modern' ? 'active' : ''}`}
            onClick={() => handleTaskbarStyleChange('modern')}
          >
            <div className="taskbar-preview modern">
                <div className="preview-bar"></div>
            </div>
            <span>Modern</span>
          </div>
          <div 
            className={`theme-option ${taskbarStyle === 'floating' ? 'active' : ''}`}
            onClick={() => handleTaskbarStyleChange('floating')}
          >
            <div className="taskbar-preview floating">
                <div className="preview-dock"></div>
            </div>
            <span>Floating</span>
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
          <span className="settings-label">Version 2.0.0</span>
        </div>
      </div>
      <div className="settings-section">
        <h2>Attribution</h2>
        <div className="settings-row">
          <span className="settings-label">Icon theme: Colloid Icon Theme by Vince Liuice</span>
        </div>
        <div className="settings-row">
          <span className="settings-label">
            Source:{' '}
            <a
              className="settings-link"
              href="https://github.com/vinceliuice/Colloid-icon-theme"
              target="_blank"
              rel="noopener noreferrer"
            >
              github.com/vinceliuice/Colloid-icon-theme
            </a>
          </span>
        </div>
        <div className="settings-row">
          <span className="settings-label">License: GPL-3.0</span>
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
