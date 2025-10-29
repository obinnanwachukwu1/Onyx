import React, { useEffect, useMemo, useRef, useState } from 'react';
import PlannerHeader from './components/PlannerHeader';
import StatusBanner from './components/StatusBanner';
import SummaryPanel from './components/SummaryPanel';
import EmptyState from './components/EmptyState';
import SemesterList from './components/SemesterList';
import SettingsModal from './components/SettingsModal';
import { extractTextFromPdf } from './lib/pdf';
import {
  EDITABLE_GRADES,
  DEFAULT_GRADE_CONFIG,
  applyGrade,
  computeCourseMetrics,
  parseDegreeAudit,
  summarizeGpa,
  truncate,
} from './lib/degreeAudit';
import './GpaPlanner.css';

const SEASON_ORDER = {
  Winter: 0,
  Spring: 1,
  Summer: 2,
  Fall: 3,
};

let idCounter = 0;
function createId(prefix) {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter.toString(36)}`;
}

function parseTermSortKey(term) {
  const [season = '', yearStr = '0'] = term.split(/\s+/);
  const year = Number.parseInt(yearStr, 10) || 0;
  const seasonOrder = SEASON_ORDER[season] ?? -1;
  return { seasonOrder, year };
}

function compareTermsAsc(a, b) {
  const aKey = parseTermSortKey(a);
  const bKey = parseTermSortKey(b);
  if (aKey.year !== bKey.year) {
    return aKey.year - bKey.year;
  }
  return aKey.seasonOrder - bKey.seasonOrder;
}

function compareTermsDesc(a, b) {
  const aKey = parseTermSortKey(a);
  const bKey = parseTermSortKey(b);
  if (aKey.year !== bKey.year) {
    return bKey.year - aKey.year;
  }
  return bKey.seasonOrder - aKey.seasonOrder;
}

function normalizeGradeOptions(usePlusMinus) {
  if (usePlusMinus) {
    return EDITABLE_GRADES;
  }
  return EDITABLE_GRADES.filter((grade) => !/[+-]$/.test(grade));
}

function GpaPlanner() {
  const fileInputRef = useRef(null);
  const [semesters, setSemesters] = useState([]);
  const [parseState, setParseState] = useState({ status: 'idle', message: null });
  const [selectedFileName, setSelectedFileName] = useState(null);
  const [filteredOutCount, setFilteredOutCount] = useState(0);
  const [gradeConfig, setGradeConfig] = useState(DEFAULT_GRADE_CONFIG);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [courseDrafts, setCourseDrafts] = useState({});
  const [openCourseForms, setOpenCourseForms] = useState({});

  const gradeOptions = useMemo(() => normalizeGradeOptions(gradeConfig.usePlusMinus), [gradeConfig.usePlusMinus]);

  const allCourses = useMemo(
    () =>
      semesters.flatMap((semester) =>
        semester.courses.map((course) => ({
          course: course.course,
          grade: course.grade,
          credits: course.credits,
          term: semester.term,
        })),
      ),
    [semesters],
  );

  const overallSummary = useMemo(() => {
    if (allCourses.length === 0) {
      return null;
    }
    return summarizeGpa(allCourses, gradeConfig);
  }, [allCourses, gradeConfig]);

  const semesterDisplays = useMemo(() => {
    let cumulativeCredits = 0;
    let cumulativeWeighted = 0;

    const orderedAsc = [...semesters].sort((a, b) => compareTermsAsc(a.term, b.term));

    const computed = orderedAsc.map((semester) => {
      const courseDisplays = semester.courses.map((course) => {
        const raw = {
          course: course.course,
          grade: course.grade,
          credits: course.credits,
          term: semester.term,
        };
        const metrics = computeCourseMetrics(raw, gradeConfig);
        return {
          ...course,
          metrics,
        };
      });

      const graded = courseDisplays.filter((course) => course.metrics.gradePoints !== null);
      const termCredits = graded.reduce((total, course) => total + course.credits, 0);
      const termWeighted = graded.reduce((total, course) => total + course.metrics.weightedCredits, 0);
      const termGpa = termCredits > 0 ? truncate(termWeighted / termCredits, 2) : null;

      cumulativeCredits += termCredits;
      cumulativeWeighted += termWeighted;
      const cumulativeGpa = cumulativeCredits > 0 ? truncate(cumulativeWeighted / cumulativeCredits, 2) : null;

      return {
        ...semester,
        courses: courseDisplays,
        termGpa,
        cumulativeGpa,
        gradedCredits: termCredits,
      };
    });

    return computed.sort((a, b) => compareTermsDesc(a.term, b.term));
  }, [semesters, gradeConfig]);

  useEffect(() => {
    const root = document.getElementById('root');
    document.body.classList.add('gpa-mode');
    if (root) {
      root.classList.add('gpa-mode');
    }

    return () => {
      document.body.classList.remove('gpa-mode');
      if (root) {
        root.classList.remove('gpa-mode');
      }
    };
  }, []);

  useEffect(() => {
    setCourseDrafts((prev) => {
      let changed = false;
      const next = { ...prev };
      Object.entries(prev).forEach(([semesterId, draft]) => {
        if (!gradeOptions.includes(draft.grade)) {
          next[semesterId] = {
            ...draft,
            grade: gradeOptions[0] ?? draft.grade,
          };
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [gradeOptions]);

  const handleUploadButton = () => {
    fileInputRef.current?.click();
  };

  const handleResetPlanner = () => {
    setSemesters([]);
    setCourseDrafts({});
    setOpenCourseForms({});
    setFilteredOutCount(0);
    setSelectedFileName(null);
    setParseState({ status: 'idle', message: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const ensureSemesterDraft = (semesterId) => {
    setCourseDrafts((prev) => {
      if (prev[semesterId]) {
        return prev;
      }
      return {
        ...prev,
        [semesterId]: {
          course: '',
          credits: '',
          grade: gradeOptions[0] ?? 'A',
        },
      };
    });
  };

  const handleFileSelection = async (event) => {
    const [file] = event.target.files ?? [];
    event.target.value = '';

    if (!file) {
      return;
    }

    if (file.type && file.type !== 'application/pdf') {
      setParseState({ status: 'error', message: 'Please select a PDF file.' });
      return;
    }

    setParseState({ status: 'loading', message: 'Parsing your audit…' });
    setSelectedFileName(file.name);
    setFilteredOutCount(0);

    try {
      const text = await extractTextFromPdf(file);
      const rows = parseDegreeAudit(text);

      if (rows.length === 0) {
        setSemesters([]);
        setOpenCourseForms({});
        setParseState({
          status: 'error',
          message: 'Could not find any courses in this file. Make sure it is a DegreeWorks audit.',
        });
        return;
      }

      const filteredRows = rows.filter((row) => row.grade !== 'T' && row.grade !== 'W');
      const removedCount = rows.length - filteredRows.length;

      if (filteredRows.length === 0) {
        setSemesters([]);
        setOpenCourseForms({});
        setFilteredOutCount(removedCount);
        setParseState({
          status: 'error',
          message: 'Only transfer/withdrawal entries were detected. Add semesters manually instead.',
        });
        return;
      }

      const grouped = new Map();
      filteredRows.forEach((row) => {
        const termCourses = grouped.get(row.term) ?? [];
        const id = createId('course');
        termCourses.push({
          id,
          source: 'parsed',
          originalGrade: row.grade,
          term: row.term,
          course: row.course,
          credits: row.credits,
          grade: row.grade,
        });
        grouped.set(row.term, termCourses);
      });

      const groupedSemesters = [...grouped.keys()]
        .sort(compareTermsAsc)
        .map((term) => ({
          id: createId('semester'),
          term,
          courses: grouped.get(term) ?? [],
        }));

      setSemesters(groupedSemesters);
      setOpenCourseForms({});
      setFilteredOutCount(removedCount);
      setParseState({
        status: 'ready',
        message:
          removedCount > 0
            ? `${filteredRows.length} courses loaded. ${removedCount} transfer/withdrawal entries hidden.`
            : `${filteredRows.length} courses loaded successfully.`,
      });
    } catch (error) {
      console.error('[DegreeWorks] Failed to parse PDF', error);
      setSemesters([]);
      setOpenCourseForms({});
      setParseState({ status: 'error', message: 'Something went wrong while reading your PDF.' });
    }
  };

  const openCourseForm = (semesterId) => {
    ensureSemesterDraft(semesterId);
    setOpenCourseForms((prev) => ({
      ...prev,
      [semesterId]: true,
    }));
  };

  const closeCourseForm = (semesterId) => {
    setOpenCourseForms((prev) => {
      if (!prev[semesterId]) {
        return prev;
      }
      const { [semesterId]: _removed, ...rest } = prev;
      return rest;
    });
  };

  const handleDraftChange = (semesterId, field, value) => {
    ensureSemesterDraft(semesterId);
    setCourseDrafts((prev) => ({
      ...prev,
      [semesterId]: {
        ...prev[semesterId],
        [field]: value,
      },
    }));
  };

  const handleAddCourse = (semesterId, event) => {
    event.preventDefault();
    const draft = courseDrafts[semesterId];
    if (!draft) {
      return;
    }

    const credits = Number.parseFloat(draft.credits);
    if (!draft.course.trim() || Number.isNaN(credits) || credits <= 0) {
      return;
    }

    setSemesters((prev) =>
      prev.map((semester) => {
        if (semester.id !== semesterId) {
          return semester;
        }

        const id = createId('course');
        const raw = {
          course: draft.course.trim(),
          grade: draft.grade,
          credits,
          term: semester.term,
        };
        const nextCourse = {
          ...raw,
          id,
          source: 'manual',
          originalGrade: draft.grade,
        };

        return {
          ...semester,
          courses: [...semester.courses, nextCourse],
        };
      }),
    );

    setCourseDrafts((prev) => ({
      ...prev,
      [semesterId]: {
        course: '',
        credits: '',
        grade: draft.grade,
      },
    }));

    openCourseForm(semesterId);
  };

  const handleDeleteCourse = (semesterId, courseId) => {
    setSemesters((prev) =>
      prev.map((semester) => {
        if (semester.id !== semesterId) {
          return semester;
        }
        return {
          ...semester,
          courses: semester.courses.filter((course) => course.id !== courseId),
        };
      }),
    );
  };

  const handleGradeChange = (semesterId, courseId, nextGrade) => {
    setSemesters((prev) =>
      prev.map((semester) => {
        if (semester.id !== semesterId) {
          return semester;
        }
        return {
          ...semester,
          courses: semester.courses.map((course) => {
            if (course.id !== courseId) {
              return course;
            }
            const updatedRaw = applyGrade(course, nextGrade);
            return {
              ...course,
              grade: updatedRaw.grade,
            };
          }),
        };
      }),
    );
  };

  const handleTermNameChange = (semesterId, nextTerm) => {
    setSemesters((prev) =>
      prev.map((semester) =>
        semester.id === semesterId
          ? {
              ...semester,
              term: nextTerm,
              courses: semester.courses.map((course) => ({
                ...course,
                term: nextTerm,
              })),
            }
          : semester,
      ),
    );
  };

  const handleAddSemester = () => {
    const hadSemesters = semesters.length > 0;
    const newSemester = {
      id: createId('semester'),
      term: 'New Semester',
      courses: [],
    };
    setSemesters((prev) => [...prev, newSemester]);
    if (!hadSemesters) {
      setParseState({ status: 'ready', message: 'Add courses to build your plan.' });
    }
  };

  const togglePlusMinus = () => {
    setGradeConfig((prev) => ({
      ...prev,
      usePlusMinus: !prev.usePlusMinus,
    }));
  };

  const handleScaleChange = (value) => {
    const numeric = Number.parseFloat(value);
    if (Number.isNaN(numeric) || numeric <= 0) {
      return;
    }
    setGradeConfig((prev) => ({
      ...prev,
      scaleMax: Number(numeric.toFixed(2)),
    }));
  };

  return (
    <main className="gpa-planner">
      <PlannerHeader
        onOpenSettings={() => setSettingsOpen(true)}
        onReset={handleResetPlanner}
        onUpload={handleUploadButton}
        onAddSemester={handleAddSemester}
      />

      <input
        ref={fileInputRef}
        id="audit-upload"
        className="gpa-uploader__input"
        type="file"
        accept="application/pdf"
        onChange={handleFileSelection}
      />

      <section className="gpa-layout">
        <aside className="gpa-sidebar">
          <SummaryPanel summary={overallSummary} semesterCount={semesters.length} courseCount={allCourses.length} />
          <div className="gpa-sidebar__meta">
            <div className="gpa-scale-note">
              <span>Scale {gradeConfig.scaleMax.toFixed(2)}</span>
              <span>{gradeConfig.usePlusMinus ? '± grades enabled' : '± grades disabled'}</span>
            </div>
            {filteredOutCount > 0 ? (
              <p className="gpa-notice">{filteredOutCount} transfer/withdrawal entries were ignored.</p>
            ) : null}
          </div>
        </aside>

        <div className="gpa-content">
          <StatusBanner state={parseState} fileName={selectedFileName} />

          {semesters.length === 0 ? (
            <EmptyState onUpload={handleUploadButton} onAddSemester={handleAddSemester} />
          ) : (
            <>
              <SemesterList
                semesters={semesterDisplays}
                drafts={courseDrafts}
                openForms={openCourseForms}
                gradeOptions={gradeOptions}
                onDraftChange={handleDraftChange}
                onAddCourse={handleAddCourse}
                onOpenForm={openCourseForm}
                onCloseForm={closeCourseForm}
                onTermChange={handleTermNameChange}
                onGradeChange={handleGradeChange}
                onDeleteCourse={handleDeleteCourse}
              />
              <div className="gpa-footer-actions">
                <button className="gpa-btn" type="button" onClick={handleAddSemester}>
                  Add Another Semester
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      <SettingsModal
        open={settingsOpen}
        scale={gradeConfig.scaleMax}
        usePlusMinus={gradeConfig.usePlusMinus}
        onScaleChange={handleScaleChange}
        onTogglePlusMinus={togglePlusMinus}
        onClose={() => setSettingsOpen(false)}
      />
    </main>
  );
}

export default GpaPlanner;
