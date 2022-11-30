/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,css,md,mdx,html,json,scss}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: '#5A6AFC',
        background: '#343434',
        gray: '#5C5C5C',
        text: '#DFDFDF',
      },
    },
  },
  plugins: [],
};
