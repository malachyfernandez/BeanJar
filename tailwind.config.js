/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      // Add custom utility class "l" for red background
      colors: {
        'l': '#ef4444' // red-500
      }
    },
  },
  plugins: [],
};
