const COURSE_CODE = /[A-Z]{2,4}\s(?:\d{4}|[1-4]XXX)/g;
const TERM_PATTERN = '(Spring|Summer|Fall|Winter)\\s+\\d{4}';
const TERM_REGEX = new RegExp(`${TERM_PATTERN}$`);
const GRADE_PATTERN = '(?:A|A-|A\\+|B|B-|B\\+|C|C-|C\\+|D|D-|D\\+|F|S|U|W|T)';
const GRADE_CRED_TERM_REGEX = new RegExp(`(${GRADE_PATTERN})\\s+(\\d+)\\s*${TERM_PATTERN}$`);
const IP_REGEX = new RegExp(`IP\\s*\\((\\d+)\\)\\s*${TERM_PATTERN}$`);
const TAIL_REGEX = new RegExp(
  `^(?:(${GRADE_PATTERN})\\s+(\\d+)\\s*${TERM_PATTERN}|IP\\s*\\((\\d+)\\)\\s*${TERM_PATTERN})$`,
);

const BASE_SCALE = 4;
const BASE_LETTER_POINTS: Record<string, number> = {
  A: 4,
  B: 3,
  C: 2,
  D: 1,
  F: 0,
};

export interface GradeConfig {
  scaleMax: number;
  usePlusMinus: boolean;
}

export interface RawCourse {
  course: string;
  grade: string;
  credits: number;
  term: string;
}

export interface CourseMetrics extends RawCourse {
  effectiveGrade: string;
  baseGrade: string | null;
  gradePoints: number | null;
  weightedCredits: number;
}

export interface GpaSummary {
  gradedCredits: number;
  gpa: number | null;
}

export const DEFAULT_GRADE_CONFIG: GradeConfig = {
  scaleMax: 4,
  usePlusMinus: false,
};

export const EDITABLE_GRADES = [
  'A+',
  'A',
  'A-',
  'B+',
  'B',
  'B-',
  'C+',
  'C',
  'C-',
  'D+',
  'D',
  'D-',
  'F',
  'S',
  'U',
  'IP',
] as const;

export type EditableGrade = (typeof EDITABLE_GRADES)[number];

export function truncate(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.trunc(value * factor) / factor;
}

function normalizeLine(line: string): string {
  return line.replace(/[ \t]+/g, ' ').trim();
}

function findCourseSegment(line: string): string | null {
  let lastMatch: RegExpExecArray | null = null;
  COURSE_CODE.lastIndex = 0;
  let match = COURSE_CODE.exec(line);
  while (match) {
    lastMatch = match;
    match = COURSE_CODE.exec(line);
  }

  return lastMatch ? line.slice(lastMatch.index).trim() : null;
}

function buildRawCourse(course: string, grade: string, credits: number, term: string): RawCourse {
  return {
    course,
    grade: grade.toUpperCase(),
    credits,
    term,
  };
}

function parseRowFromLine(line: string): RawCourse | null {
  const termMatch = line.match(TERM_REGEX);
  if (!termMatch) {
    return null;
  }

  const gradeCreditsMatch = line.match(GRADE_CRED_TERM_REGEX);
  if (gradeCreditsMatch) {
    const courseSegment = findCourseSegment(line.slice(0, gradeCreditsMatch.index).trim());
    if (!courseSegment) {
      return null;
    }

    const grade = gradeCreditsMatch[1];
    const credits = Number.parseInt(gradeCreditsMatch[2], 10);
    const term = termMatch[0];
    return buildRawCourse(courseSegment, grade, credits, term);
  }

  const ipMatch = line.match(IP_REGEX);
  if (ipMatch) {
    const courseSegment = findCourseSegment(line.slice(0, ipMatch.index).trim());
    if (!courseSegment) {
      return null;
    }

    const credits = Number.parseInt(ipMatch[1], 10);
    const term = termMatch[0];
    return buildRawCourse(courseSegment, 'IP', credits, term);
  }

  return null;
}

function parseRowFromMultiline(lines: string[], index: number): [RawCourse | null, number] {
  const line = lines[index];

  if (line.includes('Course Title') || line.includes('Satisfied by:')) {
    return [null, 1];
  }

  COURSE_CODE.lastIndex = 0;
  if (!COURSE_CODE.test(line)) {
    COURSE_CODE.lastIndex = 0;
    return [null, 1];
  }

  COURSE_CODE.lastIndex = 0;
  const singleLine = parseRowFromLine(line);
  if (singleLine) {
    return [singleLine, 1];
  }

  for (let lookahead = 1; lookahead <= 3; lookahead += 1) {
    const nextIndex = index + lookahead;
    if (nextIndex >= lines.length) {
      break;
    }

    const candidate = lines[nextIndex];
    const tailMatch = candidate.match(TAIL_REGEX);
    if (!tailMatch) {
      continue;
    }

    const termMatch = candidate.match(new RegExp(TERM_PATTERN));
    if (!termMatch) {
      continue;
    }

    const courseSegment = findCourseSegment(line);
    if (!courseSegment) {
      continue;
    }

    if (tailMatch[1]) {
      const grade = tailMatch[1];
      const credits = Number.parseInt(tailMatch[2], 10);
      return [buildRawCourse(courseSegment, grade, credits, termMatch[0]), lookahead + 1];
    }

    const credits = Number.parseInt(tailMatch[3], 10);
    return [buildRawCourse(courseSegment, 'IP', credits, termMatch[0]), lookahead + 1];
  }

  return [null, 1];
}

function baseGrade(letter: string | null): string | null {
  if (!letter) {
    return null;
  }

  const upper = letter.trim().toUpperCase();
  if (!upper) {
    return null;
  }

  const first = upper[0];
  return BASE_LETTER_POINTS[first] !== undefined ? first : null;
}

function normalizeGrade(grade: string): string {
  return grade.trim().toUpperCase();
}

function effectiveGrade(grade: string, config: GradeConfig): string {
  const normalized = normalizeGrade(grade);
  if (!config.usePlusMinus) {
    return normalized.replace(/[+-]$/, '');
  }
  return normalized;
}

function letterBasePoints(letter: string, scaleMax: number): number | null {
  const base = BASE_LETTER_POINTS[letter];
  if (typeof base !== 'number') {
    return null;
  }
  const multiplier = scaleMax / BASE_SCALE;
  return Number((base * multiplier).toFixed(4));
}

function applyPlusMinus(basePoints: number, grade: string, config: GradeConfig): number {
  const adjustmentBase = 0.3 * (config.scaleMax / BASE_SCALE);
  if (!config.usePlusMinus) {
    return basePoints;
  }

  if (grade.endsWith('+')) {
    return Math.min(config.scaleMax, Number((basePoints + adjustmentBase).toFixed(4)));
  }

  if (grade.endsWith('-')) {
    return Math.max(0, Number((basePoints - adjustmentBase).toFixed(4)));
  }

  return basePoints;
}

export function applyGrade<T extends { grade: string }>(course: T, grade: string): T {
  return {
    ...course,
    grade: normalizeGrade(grade),
  };
}

export function computeCourseMetrics(course: RawCourse, config: GradeConfig): CourseMetrics {
  const effective = effectiveGrade(course.grade, config);
  const base = baseGrade(effective);

  if (!base) {
    return {
      ...course,
      effectiveGrade: effective,
      baseGrade: null,
      gradePoints: null,
      weightedCredits: 0,
    };
  }

  if (/(?:^S|^U|^IP|^T|^W)/.test(effective)) {
    return {
      ...course,
      effectiveGrade: effective,
      baseGrade: base,
      gradePoints: null,
      weightedCredits: 0,
    };
  }

  const basePoints = letterBasePoints(base, config.scaleMax);
  if (basePoints === null) {
    return {
      ...course,
      effectiveGrade: effective,
      baseGrade: null,
      gradePoints: null,
      weightedCredits: 0,
    };
  }

  const adjusted = applyPlusMinus(basePoints, effective, config);
  const gradePoints = Number(adjusted.toFixed(3));
  const weightedCredits = Number((gradePoints * course.credits).toFixed(3));

  return {
    ...course,
    effectiveGrade: effective,
    baseGrade: base,
    gradePoints,
    weightedCredits,
  };
}

export function parseDegreeAudit(text: string): RawCourse[] {
  const lines = text
    .split(/\r?\n/)
    .map(normalizeLine)
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return [];
  }

  const rows: RawCourse[] = [];

  for (let index = 0; index < lines.length; ) {
    const [row, consumed] = parseRowFromMultiline(lines, index);
    if (row) {
      rows.push(row);
    }
    index += consumed;
  }

  const seen = new Set<string>();
  const uniqueRows: RawCourse[] = [];

  rows.forEach((row) => {
    const key = `${row.course}|${row.grade}|${row.credits}|${row.term}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueRows.push(row);
    }
  });

  return uniqueRows;
}

export function summarizeGpa(rows: RawCourse[], config: GradeConfig): GpaSummary {
  let gradedCredits = 0;
  let totalWeighted = 0;

  rows.forEach((row) => {
    const metrics = computeCourseMetrics(row, config);
    if (metrics.gradePoints !== null) {
      gradedCredits += row.credits;
      totalWeighted += metrics.weightedCredits;
    }
  });

  const gpa = gradedCredits > 0 ? truncate(totalWeighted / gradedCredits, 2) : null;

  return {
    gradedCredits,
    gpa,
  };
}
