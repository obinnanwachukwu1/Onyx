import './LaunchButton.css';
import IconCrystal from '../../assets/icons/IconCrystal.svg';

interface LaunchButtonProps {
  onClick: () => void;
  launcherVisible: boolean;
}

const LaunchButton = ({ onClick, launcherVisible }: LaunchButtonProps): JSX.Element => {
  return (
    <button className={`launch-button ${launcherVisible ? 'clicked' : ''}`} onClick={onClick}>
      <img src={IconCrystal} alt="Launch" className="launch-icon" />
    </button>
  );
};

export default LaunchButton;
