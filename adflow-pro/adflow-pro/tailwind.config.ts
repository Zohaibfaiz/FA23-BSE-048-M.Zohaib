import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        syne:  ['var(--font-syne)', 'sans-serif'],
        inter: ['var(--font-inter)', 'sans-serif'],
        display: ['var(--font-syne)', 'sans-serif'],
      },
      colors: {
        brand: {
          purple: '#8B5CF6',
          blue:   '#3B82F6',
          cyan:   '#06B6D4',
        },
        surface: '#0F1629',
        card:    '#111827',
      },
      animation: {
        shimmer: 'shimmer 1.6s infinite linear',
      },
    },
  },
  plugins: [],
};

export default config;
