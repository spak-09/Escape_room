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
          // 4-Tier Surface Elevation Hierarchy
          base: '#0a0d14',         // Deepest background
          surface: '#0f1422',      // Primary structural panel
          elevated: '#151c2e',     // Elevated modules, cards & consoles
          overlay: '#1a233a',      // Modals, drawers, and floating panels

          // Hairline Structural Borders
          border: '#1e293b',       // Standard sub-border
          'border-strong': '#2e3d56', // Prominent/active edge
          'border-active': '#0ea5e9', // Focused / selected border

          // Semantic Text Contrast Hierarchy
          text: {
            primary: '#f1f5f9',    // High-contrast headings and primary telemetry
            secondary: '#94a3b8',  // Descriptive body labels
            muted: '#64748b',      // Sub-telemetry & timestamps
          },

          // Controlled Tactical Accents (Restrained luminescence)
          cyan: '#0ea5e9',         // Primary tactical / inspection vector
          emerald: '#10b981',      // Verification / secured state
          amber: '#f59e0b',        // Warning / caution state
          crimson: '#f43f5e',      // Critical alert / security breach

          // Legacy Compatibility Tokens
          dark: '#0a0d14',
          panel: '#0f1422',
          terminal: '#0b0f19',
          slate: '#334155',
          muted: '#64748b',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'ui-monospace', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-sweep': 'radarSweep 4s linear infinite',
        'scanline': 'scanline 8s linear infinite',
        'heartbeat': 'heartbeat 1.2s ease-in-out infinite',
      },
      keyframes: {
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '14%': { transform: 'scale(1.15)' },
          '28%': { transform: 'scale(1)' },
          '42%': { transform: 'scale(1.15)' },
          '70%': { transform: 'scale(1)' },
        },
      },
      boxShadow: {
        // Restrained tactical glows
        'tactical-cyan': '0 0 16px rgba(14, 165, 233, 0.25)',
        'tactical-emerald': '0 0 16px rgba(16, 185, 129, 0.25)',
        'tactical-crimson': '0 0 16px rgba(244, 63, 94, 0.3)',
        'tactical-amber': '0 0 16px rgba(245, 158, 11, 0.25)',
        'neon-cyan': '0 0 16px rgba(14, 165, 233, 0.25)',
        'neon-emerald': '0 0 16px rgba(16, 185, 129, 0.25)',
        'neon-crimson': '0 0 16px rgba(244, 63, 94, 0.3)',
        'neon-amber': '0 0 16px rgba(245, 158, 11, 0.25)',
      },
    },
  },
  plugins: [],
};
