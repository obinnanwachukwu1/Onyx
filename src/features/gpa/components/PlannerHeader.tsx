import type { FC } from 'react';
import { RotateCcw, Settings, UploadCloud, Plus } from 'lucide-react';

interface PlannerHeaderProps {
  onOpenSettings: () => void;
  onReset: () => void;
  onUpload: () => void;
  onAddSemester: () => void;
}

const PlannerHeader: FC<PlannerHeaderProps> = ({ onOpenSettings, onReset, onUpload, onAddSemester }) => {
  return (
    <header className="gpa-planner__header gpa-topbar">
      <h1 className="gpa-planner__title">GPA Planner</h1>
      <div className="gpa-planner__actions">
        <button className="gpa-btn gpa-btn--ghost" type="button" onClick={onUpload}>
          <UploadCloud className="gpa-icon" />
          Upload
        </button>
        <button className="gpa-btn gpa-btn--primary" type="button" onClick={onAddSemester}>
          <Plus className="gpa-icon" />
          Add Semester
        </button>
        <button className="gpa-btn gpa-btn--ghost" type="button" onClick={onReset}>
          <RotateCcw className="gpa-icon" />
          Reset
        </button>
        <button className="gpa-btn gpa-btn--ghost" type="button" onClick={onOpenSettings} aria-label="Open GPA settings">
          <Settings className="gpa-icon" />
        </button>
      </div>
    </header>
  );
};

export default PlannerHeader;
