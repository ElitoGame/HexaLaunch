/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,css,md,mdx,html,json,scss}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: 'var(--accent)',
        gray: 'rgb(92, 92, 92, .5)',
        text: 'var(--text)',
        background: 'var(--background)',
      },
    },
    plugins: [],
  },
};
