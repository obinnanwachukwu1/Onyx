import React from 'react';
import Notepad from './Notepad/Notepad';
import IconNotepad from "../assets/icons/IconNotepad.svg"
import IconNewWindow from "../assets/icons/IconNewWindow.svg"
import WelcomeCenter from './WelcomeCenter/WelcomeCenter';

const appList = [
    {
      id: 'notepad',
      name: 'Notepad',
      icon: IconNotepad,
      component: <Notepad />,
      initialSize: { width: 600, height: 400 },
      showOnDesktop: true,
      showInLauncher: true
    },
    {
      id: 'welcomecenter',
      name: 'Welcome Center',
      icon: IconNewWindow,
      component: <WelcomeCenter />,
      initialSize: { width: 800, height: 800 },
      showOnDesktop: true,
      showInLauncher: true
    },
];

export default appList;
