/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
extend: {
  colors: {
    border: '#e5e7eb',

    // KEEP your existing primary (don't remove)
    primary: {
      50:  '#eef2ff',
      100: '#e0e7ff',
      200: '#c7d2fe',
      400: '#818cf8',
      500: '#6366f1',
      600: '#4f46e5',
      700: '#4338ca',
      800: '#3730a3',
      900: '#312e81',
    },

    // 🌞 LIGHT MODE (image 2)
    light: {
      primary: '#6482AD',
      secondary: '#7FA1C3',
      bg: '#F5EDED',
      card: '#E2DAD6',
    },

    // 🌙 DARK MODE (image 1)
    dark: {
      primary: '#3F3B6C',
      secondary: '#624F82',
      accent: '#9F73AB',
      highlight: '#A3C7D6',
    },
  },

  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
  },

  animation: {
    'fade-in': 'fadeIn 0.4s ease-out',
    'slide-up': 'slideUp 0.3s ease-out',
    'slide-in': 'slideIn 0.3s ease-out',
  },

  keyframes: {
    fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
    slideUp: { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
    slideIn: { from: { opacity: 0, transform: 'translateX(-16px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
  },
},
  },
  plugins: [],
};