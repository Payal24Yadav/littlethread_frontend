/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx,html}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF6B35',
        secondary: '#45B7D1',
        'accent-orange': '#FFB347',
        'accent-blue': '#45B7D1',
        'accent-green': '#96CEB4',
        'accent-pink': '#FF6BCB',
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '1rem',
          lg: '2rem',
          xl: '4rem',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 6px 18px rgba(16,24,40,0.06)',
      }
    },
  },
  plugins: [],
}
