/** @type {import('tailwindcss').Config} */

/*
 * INDUSTRIAL REDACTED — CLASSIFIED DIGITAL SECURITY FACILITY
 * -------------------------------------------------------------------------
 * Visual identity: incident-response workstation / secure operations room.
 *   Surfaces  : neutral charcoal tiers (base -> surface -> elevated)
 *   Accent    : industrial amber (#D69A45) used sparingly as an edge highlight
 *   Typography: off-white ink -> steel -> muted -> subtle
 *   Status    : restrained, never neon
 *
 * The legacy `slate`/`cyan`/`sky`/`emerald`/`amber`/`red`/`rose`/`pink`
 * scales are intentionally re-pointed at this palette so every existing
 * utility class in the codebase resolves to the new design system without
 * component rewrites. Component structure, class usage and behavior are
 * untouched — only the resolved color values change.
 */

const industrial = {
  // Neutral surface elevation hierarchy
  base: '#0B0C0D',
  deep: '#080909',
  surface: '#121416',
  'surface-2': '#181A1D',
  elevated: '#1E2023',

  // Discipline borders
  border: '#2A2D30',
  'border-strong': '#3A3E42',
  'border-active': '#D69A45',

  // Typographic contrast hierarchy
  ink: '#E7E4DC',
  'ink-2': '#D3D0C7',
  'ink-3': '#B7B4AC',
  steel: '#8B9096',
  muted: '#6F747A',
  subtle: '#555A60',

  // Primary accent (industrial amber)
  amber: '#D69A45',
  'amber-bright': '#E6B15A',
  'amber-deep': '#C08434',
  'amber-900': '#3A2A12',
  'amber-950': '#241B0E',

  // Status
  success: '#78A878',
  warning: '#D69A45',
  danger: '#C85C58',
  info: '#8FA6B8',
};

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
          base: industrial.base,           // Deepest background
          deep: industrial.deep,           // Insets, document wells
          surface: industrial.surface,     // Primary structural panel
          'surface-2': industrial['surface-2'], // Secondary operational panel
          elevated: industrial.elevated,   // Elevated modules, cards & consoles
          overlay: industrial.elevated,    // Modals, drawers, and floating panels

          // Hairline Structural Borders
          border: industrial.border,             // Standard sub-border
          'border-strong': industrial['border-strong'], // Prominent/active edge
          'border-active': industrial['border-active'], // Focused / selected border

          // Semantic Text Contrast Hierarchy
          text: {
            primary: industrial.ink,     // High-contrast headings and primary telemetry
            secondary: industrial.steel, // Descriptive body labels
            muted: industrial.muted,     // Sub-telemetry & timestamps
          },

          // Controlled Industrial Accents
          amber: industrial.amber,
          'amber-bright': industrial['amber-bright'],
          accent: industrial.amber,
          success: industrial.success,
          warning: industrial.warning,
          danger: industrial.danger,
          info: industrial.info,
          steel: industrial.steel,

          // Legacy Compatibility Tokens (retained so existing references resolve)
          dark: industrial.base,
          panel: industrial.surface,
          terminal: industrial.deep,
          slate: industrial['border-strong'],
          muted: industrial.muted,
          cyan: industrial.amber,
          emerald: industrial.success,
          crimson: industrial.danger,
        },

        /*
         * Legacy raw-scale bridge -------------------------------------------
         * These keep existing component classes working while removing the
         * old cyan/teal/navy visual language from the rendered interface.
         */

        // Surfaces + typography + borders (the workhorse scale)
        slate: {
          50: '#F5F3EE',
          100: industrial.ink,
          200: industrial['ink-2'],
          300: industrial['ink-3'],
          400: industrial.steel,
          500: industrial.muted,
          600: industrial.subtle,
          700: industrial['border-strong'],
          800: industrial.border,
          900: industrial['surface-2'],
          950: industrial.base,
        },

        // Primary tactical accent -> industrial amber
        cyan: {
          50: '#FBF4E8',
          100: '#F1E0C2',
          200: '#EFC77F',
          300: industrial['amber-bright'],
          400: industrial.amber,
          500: industrial['amber-deep'],
          600: '#A06E2C',
          700: '#7C5522',
          800: '#553A18',
          900: industrial['amber-900'],
          950: industrial['amber-950'],
        },

        // Focus / selected states -> amber edge highlight
        sky: {
          50: '#FBF4E8',
          100: '#F1E0C2',
          200: '#EFC77F',
          300: industrial['amber-bright'],
          400: industrial.amber,
          500: industrial['amber-deep'],
          600: '#A06E2C',
          700: '#7C5522',
          800: '#553A18',
          900: industrial['amber-900'],
          950: industrial['amber-950'],
        },

        // Caution / warning -> amber (same family, restrained treatment)
        amber: {
          50: '#FBF4E8',
          100: '#F1E0C2',
          200: '#EFC77F',
          300: industrial['amber-bright'],
          400: industrial.amber,
          500: industrial['amber-deep'],
          600: '#A06E2C',
          700: '#7C5522',
          800: '#553A18',
          900: industrial['amber-900'],
          950: industrial['amber-950'],
        },

        // Verification / secured state -> muted institutional green
        emerald: {
          50: '#F0F5F0',
          100: '#D8E6D8',
          200: '#B6CDB6',
          300: '#96BE96',
          400: industrial.success,
          500: '#628C62',
          600: '#517451',
          700: '#405C40',
          800: '#2F452F',
          900: '#223322',
          950: '#131C13',
        },

        // Critical alert / breach -> muted signal red
        red: {
          50: '#F7EDEC',
          100: '#EBCFCD',
          200: '#DCA5A2',
          300: '#D5807C',
          400: industrial.danger,
          500: industrial.danger,
          600: '#A94A47',
          700: '#8A3B39',
          800: '#52231F',
          900: '#3A1A19',
          950: '#26110F',
        },

        rose: {
          50: '#F7EDEC',
          100: '#EBCFCD',
          200: '#DCA5A2',
          300: '#D5807C',
          400: industrial.danger,
          500: industrial.danger,
          600: '#A94A47',
          700: '#8A3B39',
          800: '#52231F',
          900: '#3A1A19',
          950: '#26110F',
        },

        // Sector identifier tone (messaging / social engineering)
        // Remapped to restrained info steel so no foreign hue remains.
        pink: {
          50: '#F0F4F7',
          100: '#DCE6ED',
          200: '#C4D2DD',
          300: '#A8BCCB',
          400: industrial.info,
          500: '#71889A',
          600: '#5A6E7E',
          700: '#485866',
          800: '#33414D',
          900: '#26313A',
          950: '#171D22',
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
        // Restrained ambient highlights — no neon halos.
        'tactical-cyan': '0 0 12px rgba(214, 154, 69, 0.14)',
        'tactical-emerald': '0 0 12px rgba(120, 168, 120, 0.14)',
        'tactical-crimson': '0 0 12px rgba(200, 92, 88, 0.16)',
        'tactical-amber': '0 0 12px rgba(214, 154, 69, 0.14)',
        'neon-cyan': '0 0 10px rgba(214, 154, 69, 0.12)',
        'neon-emerald': '0 0 10px rgba(120, 168, 120, 0.12)',
        'neon-crimson': '0 0 10px rgba(200, 92, 88, 0.14)',
        'neon-amber': '0 0 10px rgba(214, 154, 69, 0.12)',
      },
    },
  },
  plugins: [],
};
