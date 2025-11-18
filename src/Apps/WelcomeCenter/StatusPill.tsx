import { useEffect, useState } from 'react';
import { Terminal } from 'lucide-react';

type StatusResponse = {
  working_status?: string;
};

const STATUS_URL = '/projects/status.json';

export default function StatusPill() {
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    let mounted = true;
    fetch(STATUS_URL, { cache: 'no-cache' })
      .then<StatusResponse>((r) => r.json())
      .then((d) => { if (mounted) setStatus(d.working_status ?? ''); })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  return (
    <div className="rounded-xl bg-[var(--window-bg)] p-3 shadow-sm ring-1 ring-[var(--sidebar-border)]">
      <div className="mb-2 flex items-center gap-2 text-xs font-medium text-[var(--sidebar-item-text)] opacity-70">
        <Terminal className="h-3 w-3" />
        <span>System Status</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
        </span>
        <span className="text-xs font-medium text-[var(--sidebar-item-text)]">{status || 'System Idle'}</span>
      </div>
    </div>
  );
}

