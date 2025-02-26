import React, { useState, useEffect, useContext } from 'react';
import './MobileDesktop.css'
import appList from '../../Apps/AppList';
import { AppManagerContext } from '../AppManagerContext';
const MobileDesktop = () => {
  const [launched, setLaunched] = useState(false);
  const {launchApp} = useContext(AppManagerContext);
  
  const hasLaunched = React.useRef(false);
  useEffect(() => {
    if (!hasLaunched.current) {
    hasLaunched.current = true;
    setTimeout(() => {
      launchApp("welcome-center");
    }, 1000);
    }
  }, []);

    return (
        <div className="mobile-desktop">
        </div>        
    )
}
export default MobileDesktop;
