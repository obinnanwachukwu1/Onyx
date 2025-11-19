interface LauncherIconProps {
  imageSrc: string;
  text: string;
  onClick: () => void;
  variant?: 'grid' | 'list';
}

const LauncherIcon = ({ imageSrc, text, onClick, variant = 'grid' }: LauncherIconProps): JSX.Element => {
  if (variant === 'list') {
    return (
      <button 
        className="group flex w-full items-center gap-3 p-2 rounded-lg hover:bg-[var(--sidebar-item-hover-bg)] bg-transparent transition-colors text-left"
        onClick={onClick}
      >
        <img src={imageSrc} alt={text} className="w-8 h-8 object-contain drop-shadow-sm" />
        <div className="flex flex-col">
          <span className="text-sm font-medium text-[var(--text-color)]/90 group-hover:text-[var(--text-color)]">{text}</span>
          <span className="text-xs text-[var(--text-color)]/50">Application</span>
        </div>
      </button>
    );
  }

  return (
    <button 
      className="group flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-[var(--sidebar-item-hover-bg)] bg-transparent transition-all duration-200 active:scale-95"
      onClick={onClick}
    >
      <img 
        src={imageSrc} 
        alt={text} 
        className="w-12 h-12 object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:drop-shadow-xl" 
      />
      <span className="text-xs font-medium text-[var(--text-color)]/80 text-center line-clamp-2 group-hover:text-[var(--text-color)] transition-colors">
        {text}
      </span>
    </button>
  );
};

export default LauncherIcon;
