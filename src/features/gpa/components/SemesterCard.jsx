import React from 'react';

function SemesterCard({
  semester,
  draft,
  isFormOpen,
  gradeOptions,
  onDraftChange,
  onAddCourse,
  onOpenForm,
  onCloseForm,
  onTermChange,
  onGradeChange,
  onDeleteCourse,
}) {
  const courseDraft = draft ?? { course: '', credits: '', grade: gradeOptions[0] ?? 'A' };
  const gradeOptionsForDraft = gradeOptions.includes(courseDraft.grade)
    ? gradeOptions
    : [courseDraft.grade, ...gradeOptions];

  return (
    <section className="gpa-semester">
      <header className="gpa-semester__header">
        <div className="gpa-semester__meta">
          <input
            className="gpa-semester__name"
            value={semester.term}
            onChange={(event) => onTermChange(semester.id, event.target.value)}
            aria-label="Semester name"
          />
          <p>{semester.courses.length} courses</p>
        </div>
        <div className="gpa-semester__metrics">
          <span>Term GPA: {semester.termGpa !== null ? semester.termGpa.toFixed(2) : 'N/A'}</span>
          <span>Running GPA: {semester.cumulativeGpa !== null ? semester.cumulativeGpa.toFixed(2) : 'N/A'}</span>
        </div>
      </header>

      {semester.courses.length > 0 ? (
        <table className="gpa-courses-table">
          <thead>
            <tr>
              <th scope="col">Course</th>
              <th scope="col">Grade</th>
              <th scope="col">Credits</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {semester.courses.map((course) => {
              const gradeChanged = course.grade !== course.originalGrade;
              const selectOptions = gradeOptions.includes(course.grade)
                ? gradeOptions
                : [course.grade, ...gradeOptions];
              return (
                <tr key={course.id} data-changed={gradeChanged ? 'true' : 'false'}>
                  <td>
                    <div className="gpa-course-cell">
                      <span className="gpa-course-cell__title">{course.course}</span>
                      {gradeChanged ? (
                        <span className="gpa-course-cell__tag">Original: {course.originalGrade}</span>
                      ) : null}
                    </div>
                  </td>
                  <td>
                    <select
                      className="gpa-grade-select"
                      value={course.grade}
                      onChange={(event) => onGradeChange(semester.id, course.id, event.target.value)}
                    >
                      {selectOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>{course.credits}</td>
                  <td>
                    <button
                      className="gpa-btn gpa-btn--link"
                      type="button"
                      onClick={() => onDeleteCourse(semester.id, course.id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p className="gpa-semester__empty">No courses yet. Add one below.</p>
      )}

      {isFormOpen ? (
        <form className="gpa-course-form" onSubmit={(event) => onAddCourse(semester.id, event)}>
          <input
            className="gpa-course-form__input"
            placeholder="Course (e.g., CS 1331)"
            value={courseDraft.course}
            onChange={(event) => onDraftChange(semester.id, 'course', event.target.value)}
            required
          />
          <input
            className="gpa-course-form__input gpa-course-form__input--narrow"
            type="number"
            min="0"
            step="0.5"
            placeholder="Credits"
            value={courseDraft.credits}
            onChange={(event) => onDraftChange(semester.id, 'credits', event.target.value)}
            required
          />
          <select
            className="gpa-course-form__input"
            value={courseDraft.grade}
            onChange={(event) => onDraftChange(semester.id, 'grade', event.target.value)}
          >
            {gradeOptionsForDraft.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <div className="gpa-course-form__actions">
            <button className="gpa-btn gpa-btn--small" type="submit">
              Save Course
            </button>
            <button className="gpa-btn gpa-btn--link" type="button" onClick={() => onCloseForm(semester.id)}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button className="gpa-btn gpa-btn--small" type="button" onClick={() => onOpenForm(semester.id)}>
          Add Course
        </button>
      )}
    </section>
  );
}

export default SemesterCard;
