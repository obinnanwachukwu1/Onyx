import React, { useState, useEffect } from 'react';
import "./Clock.css"

const Clock = () => {
  const [time, setTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const intervalId = setInterval(() => {
      setTime(new Date());
    }, 1000); // Update every 1000ms (1 second)

    return () => clearInterval(intervalId); // Cleanup the interval on component unmount
  }, []);

  // Format the time to display it nicely
  const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return <div className="taskbar-clock clock"> {formattedTime}</div>;
};

export default Clock;
