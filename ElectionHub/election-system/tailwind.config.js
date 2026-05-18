/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primaryBg: '#0D0D0D',
        secondaryBg: '#111111',
        cardBg: '#151515',
        borderColor: '#1F1F1F',
        primaryGold: '#C9A84C',
        goldHover: '#8B6914',
        goldLight: '#F0D77A',
        successGreen: '#4CAF50',
        dangerRed: '#E53935',
        warningOrange: '#FB8C00',
        textPrimary: '#F5F0E8',
        textSecondary: '#9E9E9E',
        textMuted: '#616161',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Syne', 'sans-serif'],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #C9A84C' },
          '100%': { boxShadow: '0 0 20px #C9A84C, 0 0 30px #F0D77A' },
        }
      }
    },
  },
  plugins: [],
}
