import Notepad from './Notepad/Notepad';
import IconNotepad from '../assets/icons/IconNotepad.svg';
import IconNewWindow from '../assets/icons/IconNewWindow.svg';
import IconTerminal from '../assets/icons/IconTerminal.svg';
import WelcomeCenter from './WelcomeCenter/WelcomeCenter';
import StatusPill from './WelcomeCenter/StatusPill';
import { Home, Info, Bell, Palette, Monitor, FileText, Download, LayoutGrid, HardDrive } from 'lucide-react';
import Terminal from './Terminal/Terminal';
import Files from './Files/Files';
import IconFiles from '../assets/icons/IconFiles.svg';
import Resume from './Resume/Resume';
import IconResume from '../assets/icons/IconResume.svg';
import IconStore from '../assets/icons/IconStore.svg';
import IconContact from '../assets/icons/IconContact.svg';
import IconSettings from '../assets/icons/IconSettings.svg';
import AppCenter from './AppCenter/AppCenter';
import ContactMe from './ContactMe/ContactMe';
import Settings from './Settings/Settings';
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
    id: 'files',
    name: 'Files',
    icon: IconFiles,
    component: <Files />,
    initialSize: { width: 800, height: 550 },
    showOnDesktop: true,
    showInLauncher: true,
    sidebar: {
      items: [
        { id: 'favorites', label: 'Favorites', type: 'section' },
        { id: 'desktop', label: 'Desktop', icon: Monitor },
        { id: 'documents', label: 'Documents', icon: FileText },
        { id: 'downloads', label: 'Downloads', icon: Download },
        { id: 'applications', label: 'Applications', icon: LayoutGrid },
        { id: 'locations', label: 'Locations', type: 'section' },
        { id: 'home', label: 'Home', icon: Home },
        { id: 'root', label: 'Onyx HD', icon: HardDrive },
      ],
      initialActiveId: 'home',
    },
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
    sidebar: {
      items: [
        { id: 'home', label: 'Home', icon: Home },
        { id: 'all-apps', label: 'All Apps', icon: Info }, // Using Info as placeholder, maybe Grid or AppWindow would be better if available
        { id: 'updates', label: 'Updates', icon: Bell },
      ],
      initialActiveId: 'home',
    },
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
    id: 'settings',
    name: 'Settings',
    icon: IconSettings,
    component: <Settings />,
    initialSize: { width: 700, height: 500 },
    showOnDesktop: false,
    showInLauncher: true,
    sidebar: {
      items: [
        { id: 'personalization', label: 'Personalization', icon: Palette },
        { id: 'about', label: 'About', icon: Info },
      ],
      initialActiveId: 'personalization',
    },
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
    sidebar: {
      items: [
        { id: 'home', label: 'Home', icon: Home },
        { id: 'about', label: 'About Onyx', icon: Info },
        { id: 'updates', label: "What's New", icon: Bell },
      ],
      initialActiveId: 'home',
      footer: <StatusPill />,
    },
  },
];

export default appList;
