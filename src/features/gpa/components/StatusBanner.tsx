import type { FC } from 'react';
import type { ParseState } from '../types';

interface StatusBannerProps {
  state: ParseState;
  fileName: string | null;
}

const StatusBanner: FC<StatusBannerProps> = ({ state, fileName }) => {
  if (!state?.message) {
    return null;
  }

  return (
    <p className={`gpa-status gpa-status--${state.status}`}>
      {state.message}
      {fileName ? <span className="gpa-status__file">Loaded: {fileName}</span> : null}
    </p>
  );
};

export default StatusBanner;
