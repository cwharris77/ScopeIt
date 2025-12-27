/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,tsx}', './components/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#181922',
        backgroundSecondary: '#1f2937',
        primary: '#087f8c',
        secondary: '#433e3f',
        danger: '#EF4444',
      },
    },
  },
  plugins: [],
};
