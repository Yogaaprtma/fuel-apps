/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        flame: {
          DEFAULT: '#FF6B35',
          50: '#FFF4F0', 100: '#FFE4D9', 200: '#FFC9B3',
          300: '#FFAD8D', 400: '#FF9267', 500: '#FF6B35',
          600: '#E85A25', 700: '#C44A1A', 800: '#A03B12',
          900: '#7D2C0B', 950: '#5A1E07',
        },
        slate: {
          850: '#1a2234', 900: '#111827', 950: '#0a0f1a',
        },
        'fuel-blue': { DEFAULT: '#1B4F8A', light: '#2D7DD2' },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Syne', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
      },
    },
  },
  plugins: [],
};