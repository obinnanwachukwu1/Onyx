import type { FC } from 'react';

interface SettingsModalProps {
  open: boolean;
  scale: number;
  usePlusMinus: boolean;
  onScaleChange: (value: string) => void;
  onTogglePlusMinus: () => void;
  onClose: () => void;
}

const SettingsModal: FC<SettingsModalProps> = ({
  open,
  scale,
  usePlusMinus,
  onScaleChange,
  onTogglePlusMinus,
  onClose,
}) => {
  if (!open) {
    return null;
  }

  return (
    <div className="gpa-modal" role="dialog" aria-modal="true">
      <div className="gpa-modal__card">
        <header className="gpa-modal__header">
          <h2>GPA Settings</h2>
          <button className="gpa-btn gpa-btn--link" type="button" onClick={onClose}>
            Close
          </button>
        </header>
        <div className="gpa-modal__body">
          <label className="gpa-modal__row">
            <span>Maximum GPA scale</span>
            <input
              className="gpa-modal__input"
              type="number"
              min="3"
              max="5"
              step="0.1"
              value={scale}
              onChange={(event) => onScaleChange(event.target.value)}
            />
          </label>
          <label className="gpa-modal__row gpa-modal__row--checkbox">
            <input type="checkbox" checked={usePlusMinus} onChange={onTogglePlusMinus} />
            <span>Count +/- adjustments</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
