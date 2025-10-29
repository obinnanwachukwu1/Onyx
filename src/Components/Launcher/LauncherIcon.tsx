import './LauncherIcon.css';

interface LauncherIconProps {
  imageSrc: string;
  text: string;
  onClick: () => void;
}

const LauncherIcon = ({ imageSrc, text, onClick }: LauncherIconProps): JSX.Element => {
  return (
    <button className="launcher-icon-button" onClick={onClick}>
      <img src={imageSrc} alt={text} className="launcher-icon-image" />
      <span className="launcher-icon-text">{text}</span>
    </button>
  );
};

export default LauncherIcon;
