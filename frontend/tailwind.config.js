import { tailwindTheme } from './src/styles/designSystem.js';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: tailwindTheme,
  },
  plugins: [],
};
