import React from 'react';
import SemesterCard from './SemesterCard';

function SemesterList({
  semesters,
  drafts,
  openForms,
  gradeOptions,
  onDraftChange,
  onAddCourse,
  onOpenForm,
  onCloseForm,
  onTermChange,
  onGradeChange,
  onDeleteCourse,
}) {
  return (
    <div className="gpa-semester-list">
      {semesters.map((semester) => (
        <SemesterCard
          key={semester.id}
          semester={semester}
          draft={drafts[semester.id]}
          isFormOpen={Boolean(openForms[semester.id])}
          gradeOptions={gradeOptions}
          onDraftChange={onDraftChange}
          onAddCourse={onAddCourse}
          onOpenForm={onOpenForm}
          onCloseForm={onCloseForm}
          onTermChange={onTermChange}
          onGradeChange={onGradeChange}
          onDeleteCourse={onDeleteCourse}
        />
      ))}
    </div>
  );
}

export default SemesterList;
