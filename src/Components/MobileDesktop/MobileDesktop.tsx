import { useEffect, useRef } from 'react';
import './MobileDesktop.css';
import { useWindowContext } from '../WindowContext';

const MobileDesktop = (): JSX.Element => {
  const { launchApp } = useWindowContext();
  const hasLaunched = useRef<boolean>(false);

  useEffect(() => {
    if (!hasLaunched.current) {
      hasLaunched.current = true;
      const timer = window.setTimeout(() => {
        launchApp('welcome-center');
      }, 1000);

      return () => {
        window.clearTimeout(timer);
      };
    }

    return undefined;
  }, [launchApp]);

  return <div className="mobile-desktop" />;
};

export default MobileDesktop;
