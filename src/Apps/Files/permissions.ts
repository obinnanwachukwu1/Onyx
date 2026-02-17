const USER_HOME_PATH = '/Users/root';
const SYSTEM_PATH = '/System';

const ROOT_LEVEL_READ_ONLY_PATHS = new Set([
  '/',
  '/Applications',
  '/Users',
  SYSTEM_PATH,
]);

const USER_HOME_PROTECTED_PATHS = new Set([
  '/Users/root/Desktop',
  '/Users/root/Documents',
  '/Users/root/Downloads',
]);

export const normalizePath = (path: string): string => {
  if (!path || path.trim() === '') return '/';
  const withLeadingSlash = path.startsWith('/') ? path : `/${path}`;
  const compacted = withLeadingSlash.replace(/\/+/g, '/');
  if (compacted !== '/' && compacted.endsWith('/')) return compacted.slice(0, -1);
  return compacted;
};

export const joinPath = (parentPath: string, childName: string): string => {
  const base = normalizePath(parentPath);
  return base === '/' ? `/${childName}` : `${base}/${childName}`;
};

const isSameOrDescendant = (path: string, base: string): boolean => {
  const normalizedPath = normalizePath(path);
  const normalizedBase = normalizePath(base);
  return normalizedPath === normalizedBase || normalizedPath.startsWith(`${normalizedBase}/`);
};

export const isSystemLockedPath = (path: string): boolean =>
  isSameOrDescendant(path, SYSTEM_PATH);

export const canOpenPath = (path: string): boolean =>
  !isSystemLockedPath(path);

export const canCreateInDirectory = (path: string): boolean =>
  isSameOrDescendant(path, USER_HOME_PATH) && !isSystemLockedPath(path);

export const canEditPath = (path: string): boolean =>
  isSameOrDescendant(path, USER_HOME_PATH) && !isSystemLockedPath(path);

export const canDeletePath = (path: string): boolean => {
  const normalized = normalizePath(path);
  if (ROOT_LEVEL_READ_ONLY_PATHS.has(normalized)) return false;
  if (normalized === USER_HOME_PATH) return false;
  if (USER_HOME_PROTECTED_PATHS.has(normalized)) return false;
  if (!isSameOrDescendant(normalized, USER_HOME_PATH)) return false;
  if (isSystemLockedPath(normalized)) return false;
  return true;
};

export const canRenamePath = (path: string): boolean => {
  const normalized = normalizePath(path);
  if (ROOT_LEVEL_READ_ONLY_PATHS.has(normalized)) return false;
  if (normalized === USER_HOME_PATH) return false;
  if (USER_HOME_PROTECTED_PATHS.has(normalized)) return false;
  if (!isSameOrDescendant(normalized, USER_HOME_PATH)) return false;
  if (isSystemLockedPath(normalized)) return false;
  return true;
};

