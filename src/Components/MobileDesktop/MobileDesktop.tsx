import { useEffect, useRef } from 'react';
import './MobileDesktop.css';
import { useWindowContext } from '../WindowContext';

interface MobileDesktopProps {
  disableAutoStart?: boolean;
}

const MobileDesktop = ({ disableAutoStart = false }: MobileDesktopProps): JSX.Element => {
  const { launchApp } = useWindowContext();
  const hasLaunched = useRef<boolean>(false);

  useEffect(() => {
    if (hasLaunched.current || disableAutoStart) {
      return;
    }

    const timer = window.setTimeout(() => {
      hasLaunched.current = true;
      launchApp('welcome-center');
    }, 1000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [launchApp, disableAutoStart]);

  return <div className="mobile-desktop" />;
};

export default MobileDesktop;
