import React, { useState, useEffect } from 'react';
import './Launcher.css';
import LauncherIcon from './LauncherIcon';
import IconNotepad from "../assets/icons/IconNotepad.svg"
import Notepad from '../Apps/Notepad/Notepad';


const Launcher = ({ isVisible, onClose, spawnWindow }) => {
  const [shouldRender, setShouldRender] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => setShouldRender(false), 500); // Matches animation duration
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!shouldRender) return null;

  return (
    <div className={`launcher ${isVisible ? "visible" : "hidden"}`}>
      <div className="launcher-content">
        <div className="launcher-header">
          <h2>Launcher</h2>
        </div>
        <div className="launcher-body">
          <LauncherIcon imageSrc={IconNotepad} text={"Notepad"} onClick={() => {
            spawnWindow("Notepad",<Notepad />, 
        {width: 500, height:500});
        onClose();
          }}/>
          <LauncherIcon imageSrc={IconNotepad} text={"Notepad"}/>
          <LauncherIcon imageSrc={IconNotepad} text={"Notepad"}/>
          <LauncherIcon imageSrc={IconNotepad} text={"Notepad"}/>
          <LauncherIcon imageSrc={IconNotepad} text={"Notepad"}/>
          <LauncherIcon imageSrc={IconNotepad} text={"Notepad"}/>
          <LauncherIcon imageSrc={IconNotepad} text={"Notepad"}/>
          <LauncherIcon imageSrc={IconNotepad} text={"Notepad"}/>
        </div>
        <div className="launcher-footer">

        </div>
      </div>
    </div>
  );
};

export default Launcher;
