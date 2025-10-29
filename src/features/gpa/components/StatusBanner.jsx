import React from 'react';

function StatusBanner({ state, fileName }) {
  if (!state?.message) {
    return null;
  }

  return (
    <p className={`gpa-status gpa-status--${state.status}`}>
      {state.message}
      {fileName ? <span className="gpa-status__file">Loaded: {fileName}</span> : null}
    </p>
  );
}

export default StatusBanner;
