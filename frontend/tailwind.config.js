/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // <- Wichtig für Vite
  ],
  darkMode: 'class', // Nur aktivieren wenn explizit eine "dark" Klasse gesetzt wird
  theme: {
    extend: {},
  },
  plugins: [],
}