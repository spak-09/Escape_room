/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        facility: {
          dark: '#0a0d14',
          panel: '#111726',
          border: '#1e293b',
          terminal: '#0f172a',
          cyan: '#06b6d4',
          emerald: '#10b981',
          crimson: '#ef4444',
          amber: '#f59e0b',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
