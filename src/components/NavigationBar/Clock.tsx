import { useEffect, useState } from 'react';
import './Clock.css';

const Clock = (): JSX.Element => {
  const [time, setTime] = useState<Date>(new Date());

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return <div className="taskbar-clock clock"> {formattedTime}</div>;
};

export default Clock;
