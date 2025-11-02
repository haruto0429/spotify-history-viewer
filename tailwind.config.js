/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'spotify-green': '#1DB954',
        'spotify-dark': '#121212',
        'spotify-dark-secondary': '#181818',
        'spotify-dark-tertiary': '#1E1E1E',
        'spotify-text-primary': '#FFFFFF',
        'spotify-text-secondary': '#B3B3B3',
        'spotify-text-muted': '#6A6A6A',
        'spotify-border': '#2A2A2A',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
