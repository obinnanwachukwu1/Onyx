import './LaunchButton.css';
import IconCrystal from '../../assets/icons/IconCrystal.svg';

interface LaunchButtonProps {
  onClick: () => void;
  launcherVisible: boolean;
}

const LaunchButton = ({ onClick, launcherVisible }: LaunchButtonProps): JSX.Element => {
  return (
    <button className={`launch-button ${launcherVisible ? 'clicked' : ''}`} onClick={onClick}>
      <img src={IconCrystal} alt="Launch" className="launch-icon" loading="eager" decoding="sync" fetchPriority="high" />
    </button>
  );
};

export default LaunchButton;
