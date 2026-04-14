import './DesktopIcon.css';

interface DesktopIconProps {
  imageSrc: string;
  text: string;
  handleDesktopIconDoubleClick: () => void;
}

const DesktopIcon = ({ imageSrc, text, handleDesktopIconDoubleClick }: DesktopIconProps): JSX.Element => {
  return (
    <button className="icon-button" onDoubleClick={handleDesktopIconDoubleClick}>
      <img src={imageSrc} alt={text} className="icon-image" loading="eager" decoding="sync" fetchPriority="high" />
      <span className="icon-text">{text}</span>
    </button>
  );
};

export default DesktopIcon;
