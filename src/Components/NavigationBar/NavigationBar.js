import React, { useRef, useEffect, useState, useContext } from 'react';
import './NavigationBar.css';
import Clock from './Clock';
import LaunchButton from './LaunchButton';
import { useWindowContext } from '../WindowContext';

const NavigationBar = React.forwardRef(( {windows, setButtonPosition}, ref) => {
  const {activateWindow, toggleLauncherVisibility, launcherVisible} = useWindowContext();
  const buttonRefs = useRef({});
  const handleRightClick = (e, val) => {
    e.stopPropagation();
    e.preventDefault();
    console.log(val);
  };

  return (
    <div ref={ref} className="navigation-bar" onContextMenu={(e) => handleRightClick(e, 2)}>
      <LaunchButton onClick={toggleLauncherVisibility}/>
    </div>
  );
});

export default NavigationBar;
