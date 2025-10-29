import Notepad from './Notepad/Notepad';
import IconNotepad from '../assets/icons/IconNotepad.svg';
import IconNewWindow from '../assets/icons/IconNewWindow.svg';
import IconTerminal from '../assets/icons/IconTerminal.svg';
import WelcomeCenter from './WelcomeCenter/WelcomeCenter';
import Terminal from './Terminal/Terminal';
import Resume from './Resume/Resume';
import IconResume from '../assets/icons/IconResume.svg';
import IconStore from '../assets/icons/IconStore.svg';
import IconContact from '../assets/icons/IconContact.svg';
import AppCenter from './AppCenter/AppCenter';
import ContactMe from './ContactMe/ContactMe';
import { AppDefinition, WindowStartPosition } from '../types/windows';

const appList: AppDefinition[] = [
  {
    id: 'terminal',
    name: 'Terminal',
    icon: IconTerminal,
    component: <Terminal />,
    initialSize: { width: 640, height: 480 },
    showOnDesktop: false,
    showInLauncher: true,
  },
  {
    id: 'resume',
    name: 'My Resume',
    icon: IconResume,
    component: <Resume />,
    initialSize: { width: 640, height: 600 },
    showOnDesktop: true,
    showInLauncher: true,
  },
  {
    id: 'appcenter',
    name: 'App Center',
    icon: IconStore,
    component: <AppCenter />,
    initialSize: { width: 640, height: 600 },
    showOnDesktop: true,
    showInLauncher: true,
  },
  {
    id: 'contactme',
    name: 'Contact Me',
    icon: IconContact,
    component: <ContactMe />,
    initialSize: { width: 640, height: 600 },
    showOnDesktop: true,
    showInLauncher: true,
  },
  {
    id: 'notepad',
    name: 'Notepad',
    icon: IconNotepad,
    component: <Notepad />,
    initialSize: { width: 600, height: 400 },
    showOnDesktop: false,
    showInLauncher: true,
  },
  {
    id: 'welcome-center',
    name: 'Welcome Center',
    icon: IconNewWindow,
    component: <WelcomeCenter />,
    initialSize: { width: 800, height: 800 },
    initialPosition: WindowStartPosition.CENTERSCREEN,
    showOnDesktop: false,
    showInLauncher: true,
  },
];

export default appList;
