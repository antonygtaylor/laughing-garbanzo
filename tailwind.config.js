/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        star: {
          dark: '#0f172a',
          board: '#1e293b',
          accent: '#f59e0b',
        }
      }
    },
  },
  plugins: [],
}
