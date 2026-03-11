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
        // 'system' or no value — use OS preference
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
      var stored = localStorage.getItem('theme');
      if (!stored || stored === 'system') {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  })();
`;
