import './LoadingScreen.css';

const LoadingScreen = (): JSX.Element => {
  return (
    <div className="loading-screen">
      <div className="spinner" />
      <p>Fetching Resources</p>
    </div>
  );
};

export default LoadingScreen;
