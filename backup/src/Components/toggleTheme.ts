const THEME_ATTRIBUTE = 'data-theme';
const STORAGE_KEY = 'theme-preference';

const isDarkPreferred = (): boolean => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;

export function setTheme(theme: 'light' | 'dark'): void {
  document.documentElement.setAttribute(THEME_ATTRIBUTE, theme);
  localStorage.setItem(STORAGE_KEY, theme);
}

export function getTheme(): 'light' | 'dark' {
  return document.documentElement.getAttribute(THEME_ATTRIBUTE) as 'light' | 'dark' || (isDarkPreferred() ? 'dark' : 'light');
}

export default function toggleTheme(): void {
  const currentTheme = getTheme();
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
}

export const initializeTheme = (): void => {
  const savedTheme = localStorage.getItem(STORAGE_KEY);

  if (savedTheme) {
    document.documentElement.setAttribute(THEME_ATTRIBUTE, savedTheme);
  } else if (isDarkPreferred()) {
    document.documentElement.setAttribute(THEME_ATTRIBUTE, 'dark');
  }
};
