import './LaunchButton.css';
import IconCrystal from '../../assets/icons/IconCrystal.svg';

interface LaunchButtonProps {
  onClick: () => void;
}

const LaunchButton = ({ onClick }: LaunchButtonProps): JSX.Element => {
  return (
    <button className="launch-button-mobile" onClick={onClick}>
      <img src={IconCrystal} alt="Launch" className="launch-icon" />
    </button>
  );
};

export default LaunchButton;
