import type { FC, FormEvent } from 'react';
import SemesterCard from './SemesterCard';
import type { CourseDraft, PlannerSemesterDisplay } from '../types';

interface SemesterListProps {
  semesters: PlannerSemesterDisplay[];
  drafts: Partial<Record<string, CourseDraft>>;
  openForms: Partial<Record<string, boolean>>;
  gradeOptions: string[];
  onDraftChange: (semesterId: string, field: keyof CourseDraft, value: string) => void;
  onAddCourse: (semesterId: string, event: FormEvent<HTMLFormElement>) => void;
  onOpenForm: (semesterId: string) => void;
  onCloseForm: (semesterId: string) => void;
  onTermChange: (semesterId: string, term: string) => void;
  onGradeChange: (semesterId: string, courseId: string, grade: string) => void;
  onDeleteCourse: (semesterId: string, courseId: string) => void;
}

const SemesterList: FC<SemesterListProps> = ({
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
}) => {
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
};

export default SemesterList;
