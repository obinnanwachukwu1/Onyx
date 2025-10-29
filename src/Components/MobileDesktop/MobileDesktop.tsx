import { useEffect, useRef } from 'react';
import './MobileDesktop.css';
import { useWindowContext } from '../WindowContext';

const MobileDesktop = (): JSX.Element => {
  const { launchApp } = useWindowContext();
  const hasLaunched = useRef<boolean>(false);

  useEffect(() => {
    if (hasLaunched.current) {
      return;
    }

    const timer = window.setTimeout(() => {
      hasLaunched.current = true;
      launchApp('welcome-center');
    }, 1000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [launchApp]);

  return <div className="mobile-desktop" />;
};

export default MobileDesktop;
