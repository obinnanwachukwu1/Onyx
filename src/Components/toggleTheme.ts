const THEME_ATTRIBUTE = 'data-theme';
const COOKIE_NAME = 'theme';

// Cookie utilities
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

function setCookie(name: string, value: string, days: number = 365): void {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

const isDarkPreferred = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
};

export function setTheme(theme: 'light' | 'dark'): void {
  document.documentElement.setAttribute(THEME_ATTRIBUTE, theme);
  setCookie(COOKIE_NAME, theme);
  // Also keep localStorage as fallback for the inline script
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('theme-preference', theme);
  }
}

export function getTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return document.documentElement.getAttribute(THEME_ATTRIBUTE) as 'light' | 'dark' || (isDarkPreferred() ? 'dark' : 'light');
}

export default function toggleTheme(): void {
  if (typeof window === 'undefined') return;
  const currentTheme = getTheme();
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
}

export const initializeTheme = (): void => {
  if (typeof window === 'undefined') return;
  
  // Priority: cookie > localStorage > system preference
  const cookieTheme = getCookie(COOKIE_NAME);
  const savedTheme = cookieTheme || localStorage.getItem('theme-preference');

  if (savedTheme === 'dark' || savedTheme === 'light') {
    document.documentElement.setAttribute(THEME_ATTRIBUTE, savedTheme);
    // Sync cookie if it was from localStorage
    if (!cookieTheme && savedTheme) {
      setCookie(COOKIE_NAME, savedTheme);
    }
  } else if (isDarkPreferred()) {
    document.documentElement.setAttribute(THEME_ATTRIBUTE, 'dark');
  }
};

// Server-side helper to extract theme from cookie header
export function getThemeFromCookies(cookieHeader: string | null): 'light' | 'dark' {
  if (!cookieHeader) return 'light';
  const match = cookieHeader.match(new RegExp('(^| )' + COOKIE_NAME + '=([^;]+)'));
  return match && (match[2] === 'dark' || match[2] === 'light') ? match[2] : 'light';
}
