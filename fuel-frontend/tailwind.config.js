/** @type {import('tailwindcss').Config} */

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',

  theme: {
    extend: {
      colors: {
        // Light background layers
        'bg-base':    '#F8FAFF',
        'bg-surface': '#FFFFFF',
        'bg-muted':   '#F1F5F9',
        'bg-hover':   '#EFF6FF',

        // Primary — Blue Energy
        primary: {
          50:  '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
          DEFAULT: '#2563EB',
        },

        // Secondary — Orange (accent/warning/fuel)
        accent: {
          50:  '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
          DEFAULT: '#F97316',
        },

        // Success
        success: {
          50:  '#ECFDF5',
          100: '#D1FAE5',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          DEFAULT: '#10B981',
        },

        // Warning
        warning: {
          50:  '#FFFBEB',
          100: '#FEF3C7',
          400: '#FBBF24',
          500: '#F59E0B',
          DEFAULT: '#F59E0B',
        },

        // Danger
        danger: {
          50:  '#FEF2F2',
          100: '#FEE2E2',
          400: '#F87171',
          500: '#EF4444',
          DEFAULT: '#EF4444',
        },

        // Text hierarchy
        'text-heading': '#0F172A',
        'text-body':    '#334155',
        'text-muted':   '#64748B',
        'text-subtle':  '#94A3B8',
        'text-placeholder': '#CBD5E1',

        // Borders
        'border-base':   '#E2E8F0',
        'border-strong': '#CBD5E1',
        'border-focus':  '#3B82F6',
      },

      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },

      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
      },

      boxShadow: {
        'xs':    '0 1px 2px rgba(0,0,0,0.05)',
        'sm':    '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
        'md':    '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -1px rgba(0,0,0,0.05)',
        'lg':    '0 10px 15px -3px rgba(0,0,0,0.07), 0 4px 6px -2px rgba(0,0,0,0.04)',
        'xl':    '0 20px 25px -5px rgba(0,0,0,0.08), 0 10px 10px -5px rgba(0,0,0,0.04)',
        '2xl':   '0 25px 50px -12px rgba(0,0,0,0.15)',
        'card':  '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 8px 25px rgba(37,99,235,0.10), 0 1px 3px rgba(0,0,0,0.06)',
        'sidebar': '1px 0 0 #E2E8F0',
        'topbar':  '0 1px 0 #E2E8F0',
        'bottom-nav': '0 -1px 0 #E2E8F0, 0 -4px 16px rgba(0,0,0,0.06)',
        'btn-primary': '0 1px 3px rgba(37,99,235,0.3), 0 1px 2px rgba(37,99,235,0.2)',
        'btn-primary-hover': '0 4px 12px rgba(37,99,235,0.35)',
        'input-focus': '0 0 0 3px rgba(59,130,246,0.15)',
        'modal': '0 25px 60px rgba(0,0,0,0.15)',
      },

      animation: {
        'fade-in':       'fadeIn 0.3s ease-out',
        'slide-up':      'slideUp 0.35s ease-out',
        'slide-down':    'slideDown 0.25s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'scale-in':      'scaleIn 0.2s ease-out',
        'shimmer':       'shimmer 2s infinite linear',
        'spin-slow':     'spin 3s linear infinite',
        'pulse-dot':     'pulseDot 2s ease-in-out infinite',
        'bounce-subtle': 'bounceSub 1.5s ease-in-out infinite',
      },

      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        slideDown: {
          '0%':   { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',      opacity: '1' },
        },
        slideInLeft: {
          '0%':   { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)',      opacity: '1' },
        },
        scaleIn: {
          '0%':   { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)',    opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%':      { opacity: '0.6', transform: 'scale(0.85)' },
        },
        bounceSub: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-3px)' },
        },
      },
    },
  },

  plugins: [],
};