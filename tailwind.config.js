/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,css,md,mdx,html,json,scss}'],
  darkMode: 'class',
  important: true,
  theme: {
    extend: {
      colors: {
        accent: 'var(--accent)',
        gray: 'rgb(92, 92, 92, .5)',
        text: 'var(--text)',
        background: 'var(--background)',
        neutral: 'var(--neutral)',
        mainHexagonBg: 'var(--mainHexagonBg)',
        mainHexagonIcon: 'var(--mainHexagonIcon)',
        mainHexagonBorder: 'var(--mainHexagonBorder)',
        mainHexagonRadius: 'var(--mainHexagonRadius)',
        mainHexagonBorderWidth: 'var(--mainHexagonBorderWidth)',
        mainHexagonBorderStyle: 'var(--mainHexagonBorderStyle)',

        subHexagonBg: 'var(--subHexagonBg)',
        subHexagonIcon: 'var(--subHexagonIcon)',
        subHexagonBorder: 'var(--subHexagonBorder)',
        subHexagonRadius: 'var(--subHexagonRadius)',
        subHexagonBorderWidth: 'var(--subHexagonBorderWidth)',
        subHexagonBorderStyle: 'var(--subHexagonBorderStyle)',

        hoverHexagonBg: 'var(--hoverHexagonBg)',
        hoverHexagonIcon: 'var(--hoverHexagonIcon)',
        hoverHexagonBorder: 'var(--hoverHexagonBorder)',
        hoverHexagonRadius: 'var(--hoverHexagonRadius)',
        hoverHexagonBorderWidth: 'var(--hoverHexagonBorderWidth)',
        hoverHexagonBorderStyle: 'var(--hoverHexagonBorderStyle)',
        hoverHexagonBg: 'var(--hoverHexagonBg)',
      },
      scale: {
        97: '0.97',
      },
    },
    plugins: [],
  },
};
