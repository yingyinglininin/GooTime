/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "main-yellow": "#FFC727",
        "main-red": "#E23424",
        "main-blue": "#0073CC",
        "main-green": "#2A9D8F",
        "main-gray": "#4A5568",
      },
    },
  },
  plugins: [],
};
