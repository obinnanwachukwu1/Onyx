import { useEffect } from 'react';
import GpaPlanner from '../features/gpa/GpaPlanner';

const GPAPage = (): JSX.Element => {
  useEffect(() => {
    const previous = document.title;
    document.title = 'GPA Planner';
    return () => {
      document.title = previous;
    };
  }, []);

  return <GpaPlanner />;
};

export default GPAPage;
