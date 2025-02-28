export const toggleTheme = () => {
    // Check current theme
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // Set the theme
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // Store preference in localStorage
    localStorage.setItem('theme-preference', newTheme);
};

// Make it accessible from the console
window.toggleTheme = toggleTheme;
  
  export const initializeTheme = () => {
    // Check for saved preference
    const savedTheme = localStorage.getItem('theme-preference');
    
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      // Use system preference if no saved preference
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  };