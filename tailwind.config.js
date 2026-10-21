/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#8e44ad',
        primaryHover: '#732d91',
        dark: '#2c3e50',
        light: '#f8fbfc',
      }
    },
  },
  plugins: [],
}