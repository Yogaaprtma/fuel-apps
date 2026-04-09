/** @type {import('tailwindcss').Config} */

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],

  theme: {
    extend: {
      colors: {
        // Background layers
        void: '#030712',
        deep: '#060d1a',
        surface: '#0d1424',
        panel: '#111827',

        // Primary - Electric Orange
        orange: {
          50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa',
          300: '#fdba74', 400: '#fb923c', 500: '#f97316',
          600: '#ea6c0a', 700: '#c2570d', 800: '#9a4412', 900: '#7c3510',
        },

        // Secondary - Neon Cyan
        cyan: {
          50: '#ecfeff', 100: '#cffafe', 200: '#a5f3fc',
          300: '#67e8f9', 400: '#22d3ee', 500: '#06b6d4',
          600: '#0891b2', 700: '#0e7490', 800: '#155e75', 900: '#164e63',
        },

        // Text — gunakan struktur nested agar Tailwind bisa generate class dengan benar
        text: {
          primary: '#f0f4f8',
          secondary: '#8fa3bd',
          muted: '#4a6080',
        },

        // Borders
        border: '#1e2d42',
        'border-bright': '#2a3f5a',
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },

      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite linear',
        'float': 'float 3s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'bounce-subtle': 'bounceSub 2s ease-in-out infinite',
        'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
        'slide-down': 'slideDown 0.3s ease-out',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(24px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(249,115,22,0.3)' },
          '50%': { opacity: '0.7', boxShadow: '0 0 40px rgba(249,115,22,0.6)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        bounceSub: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },

      boxShadow: {
        'glow-orange': '0 0 30px rgba(249,115,22,0.4), 0 0 60px rgba(249,115,22,0.1)',
        'glow-cyan': '0 0 30px rgba(6,182,212,0.4), 0 0 60px rgba(6,182,212,0.1)',
        'glow-sm': '0 0 15px rgba(249,115,22,0.25)',
        'card': '0 8px 32px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.04) inset',
        'card-hover': '0 16px 48px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.06) inset',
        'nav': '0 -8px 32px rgba(0,0,0,0.5)',
      },

      backgroundImage: {
        'grid-pattern': 'linear-gradient(rgba(30,45,66,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(30,45,66,0.4) 1px, transparent 1px)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'shimmer-gradient': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
      },

      backdropBlur: {
        xs: '2px',
      },
    },
  },

  plugins: [],
};