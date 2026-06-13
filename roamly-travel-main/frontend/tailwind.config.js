/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      colors: {
        sand: { 50: '#fdf8f0', 100: '#f9edd8', 200: '#f2d9a8', 300: '#e8c070', 400: '#dca042', 500: '#c8882a' },
        ocean: { 50: '#f0f7f9', 100: '#d8edf2', 200: '#a8d4e2', 300: '#6ab4cb', 400: '#3a90ae', 500: '#1e6e8c' },
        earth: { 50: '#f5f0eb', 100: '#e8ddd1', 200: '#d0b89a', 300: '#b08f62', 400: '#8a6840', 500: '#6b4f2a' },
        dusk: { 900: '#0d1117', 800: '#161b27', 700: '#1e2535', 600: '#2a3347' },
      },
      backgroundImage: {
        'grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E\")",
      }
    },
  },
  plugins: [],
}
