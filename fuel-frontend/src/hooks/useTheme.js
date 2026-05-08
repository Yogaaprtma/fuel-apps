import { useEffect, useState } from 'react';

/**
 * Hook untuk Dark Mode — simpan preferensi di localStorage
 * Gunakan di App.jsx agar berlaku global
 */
export default function useTheme() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('fds_theme') || 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
    localStorage.setItem('fds_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');
  const isDark = theme === 'dark';

  return { theme, isDark, toggleTheme };
}
