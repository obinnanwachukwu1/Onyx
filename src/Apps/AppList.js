import React from 'react';
import Notepad from './Notepad/Notepad';
import IconNotepad from "../assets/icons/IconNotepad.svg"
import IconNewWindow from "../assets/icons/IconNewWindow.svg"
import IconTerminal from "../assets/icons/IconTerminal.svg"
import WelcomeCenter from './WelcomeCenter/WelcomeCenter';
import Terminal from './Terminal/Terminal';

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
      id: 'welcome-center',
      name: 'Welcome Center',
      icon: IconNewWindow,
      component: <WelcomeCenter />,
      initialSize: { width: 800, height: 800 },
      initialPosition: {x: (document.documentElement.clientWidth - 800) / 2, y: (document.documentElement.clientHeight - 800) / 2 },
      showOnDesktop: true,
      showInLauncher: true
    },
    {
      id: 'terminal',
      name: 'Terminal',
      icon: IconTerminal,
      component: <Terminal />,
      initialSize: { width: 640, height: 480 },
      showOnDesktop: false,
      showInLauncher: true
    },
];

export default appList;
