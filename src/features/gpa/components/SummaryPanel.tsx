import type { FC } from 'react';
import type { GpaSummary } from '../lib/degreeAudit';

interface SummaryPanelProps {
  summary: GpaSummary | null;
  semesterCount: number;
  courseCount: number;
}

const SummaryPanel: FC<SummaryPanelProps> = ({ summary, semesterCount, courseCount }) => {
  if (!summary) {
    return null;
  }

  return (
    <section className="gpa-summary">
      <div className="gpa-summary__item">
        <span className="gpa-summary__label">Overall GPA</span>
        <span className="gpa-summary__value">{summary.gpa !== null ? summary.gpa.toFixed(2) : 'N/A'}</span>
      </div>
      <div className="gpa-summary__item">
        <span className="gpa-summary__label">Semesters</span>
        <span className="gpa-summary__value">{semesterCount}</span>
      </div>
      <div className="gpa-summary__item">
        <span className="gpa-summary__label">Courses</span>
        <span className="gpa-summary__value">{courseCount}</span>
      </div>
    </section>
  );
};

export default SummaryPanel;
