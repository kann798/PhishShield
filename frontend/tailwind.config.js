/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'page-bg': '#07111f',
        accent: {
          DEFAULT: '#10b981',
          hover: '#059669',
          dim: 'rgba(16, 185, 129, 0.18)',
          glow: 'rgba(16, 185, 129, 0.40)',
        },
        danger: {
          DEFAULT: '#f87171',
          dim: 'rgba(248, 113, 113, 0.14)',
        },
        glass: {
          DEFAULT: 'rgba(255, 255, 255, 0.07)',
          mid: 'rgba(255, 255, 255, 0.10)',
          strong: 'rgba(255, 255, 255, 0.14)',
          hover: 'rgba(255, 255, 255, 0.12)',
        },
        cyber: {
          obsidian: '#07111f',
          obsidianElevated: '#081428',
          card: 'rgba(8, 20, 40, 0.55)',
          cardBorder: 'rgba(255, 255, 255, 0.13)',
          cyan: '#10b981',
          cyanLight: '#34d399',
          blue: '#059669',
          emerald: '#10b981',
          amber: '#fbbf24',
          crimson: '#f87171',
          crimsonBright: '#ef4444',
          muted: 'rgba(255, 255, 255, 0.60)',
          borderTranslucent: 'rgba(255, 255, 255, 0.13)',
        }
      },
      fontFamily: {
        sans: ['DM Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Bricolage Grotesque', 'sans-serif'],
        display: ['Bricolage Grotesque', 'sans-serif'],
        mono: ['JetBrains Mono', 'Space Mono', 'Fira Code', 'monospace'],
        grotesk: ['Bricolage Grotesque', 'sans-serif'],
      },
      boxShadow: {
        'glow-emerald': '0 0 20px rgba(16, 185, 129, 0.35)',
        'glow-emerald-lg': '0 0 30px rgba(16, 185, 129, 0.5)',
        'glow-crimson': '0 0 20px rgba(248, 113, 113, 0.35)',
        'card-glass': '0 32px 64px rgba(0, 0, 0, 0.35)',
      }
    },
  },
  plugins: [],
}
