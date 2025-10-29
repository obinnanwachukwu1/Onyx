import type { CourseMetrics, GradeConfig } from './lib/degreeAudit';

export type GradeOption = string;

export interface CourseDraft {
  course: string;
  credits: string;
  grade: string;
}

export type CourseSource = 'parsed' | 'manual';

export interface PlannerCourse {
  id: string;
  source: CourseSource;
  originalGrade: string;
  term: string;
  course: string;
  credits: number;
  grade: string;
}

export interface PlannerSemester {
  id: string;
  term: string;
  courses: PlannerCourse[];
}

export interface SemesterCourseWithMetrics extends PlannerCourse {
  metrics: CourseMetrics;
}

export interface PlannerSemesterDisplay extends PlannerSemester {
  courses: SemesterCourseWithMetrics[];
  termGpa: number | null;
  cumulativeGpa: number | null;
  gradedCredits: number;
}

export type PlannerCourseDrafts = Record<string, CourseDraft>;
export type PlannerOpenForms = Record<string, boolean>;

export type ParseStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface ParseState {
  status: ParseStatus;
  message: string | null;
}

export interface GradeConfigState extends GradeConfig {}
