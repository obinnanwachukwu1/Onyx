const THEME_ATTRIBUTE = 'data-theme';
const STORAGE_KEY = 'theme-preference';

const isDarkPreferred = (): boolean => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;

export default function toggleTheme(): void {
  const currentTheme = document.documentElement.getAttribute(THEME_ATTRIBUTE);
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

  document.documentElement.setAttribute(THEME_ATTRIBUTE, newTheme);
  localStorage.setItem(STORAGE_KEY, newTheme);
}

export const initializeTheme = (): void => {
  const savedTheme = localStorage.getItem(STORAGE_KEY);

  if (savedTheme) {
    document.documentElement.setAttribute(THEME_ATTRIBUTE, savedTheme);
  } else if (isDarkPreferred()) {
    document.documentElement.setAttribute(THEME_ATTRIBUTE, 'dark');
  }
};
