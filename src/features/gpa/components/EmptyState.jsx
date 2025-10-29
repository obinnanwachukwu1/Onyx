import React from 'react';
import { UploadCloud } from 'lucide-react';

function EmptyState({ onUpload, onAddSemester }) {
  return (
    <section className="gpa-empty">
      <p>Nothing here yet. Upload a DegreeWorks PDF or start by adding a semester.</p>
      <div className="gpa-empty__actions">
        <button className="gpa-btn gpa-btn--primary" type="button" onClick={onUpload}>
          <UploadCloud size={18} />
          Upload Audit
        </button>
        <button className="gpa-btn" type="button" onClick={onAddSemester}>
          Add Semester
        </button>
      </div>
    </section>
  );
}

export default EmptyState;
