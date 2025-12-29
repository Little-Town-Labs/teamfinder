/**
 * Theme initialization script
 * This runs immediately on page load to prevent flash of wrong theme
 */
export const themeScript = `
  (function() {
    function getThemePreference() {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem('theme');
        if (stored === 'dark' || stored === 'light') {
          return stored;
        }
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    function applyTheme(theme) {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }

    // Apply theme immediately
    const theme = getThemePreference();
    applyTheme(theme);

    // Listen for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  })();
`;
