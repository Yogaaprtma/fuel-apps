import { create } from 'zustand';

// Inisialisasi DOM saat pertama kali load agar tidak nunggu React mount
const initTheme = localStorage.getItem('fds_theme') || 'light';
if (initTheme === 'dark') {
  document.documentElement.setAttribute('data-theme', 'dark');
  document.documentElement.classList.add('dark');
}

const useTheme = create((set) => ({
  theme: initTheme,
  isDark: initTheme === 'dark',

  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    const root = document.documentElement;

    if (newTheme === 'dark') {
      root.setAttribute('data-theme', 'dark');
      root.classList.add('dark');
    } else {
      root.removeAttribute('data-theme');
      root.classList.remove('dark');
    }

    localStorage.setItem('fds_theme', newTheme);
    
    return { 
      theme: newTheme, 
      isDark: newTheme === 'dark' 
    };
  })
}));

export default useTheme;
