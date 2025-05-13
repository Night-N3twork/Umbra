/** @type {import('tailwindcss').Config} */
import forms from '@tailwindcss/forms';

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#f24769',
        secondary: '#8d0be5',
        dark: {
          900: '#121212',
          800: '#181818',
          700: '#282828',
          600: '#383838',
          500: '#484848',
          400: '#B3B3B3',
          300: '#D1D1D1',
          200: '#E0E0E0',
          100: '#FFFFFF',
        },
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [forms],
};
