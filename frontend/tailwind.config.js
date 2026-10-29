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
        // PhishShield Core Nature Palette
        forest: {
          DEFAULT: '#404E3B',
          dark: '#303B2C',
          light: '#53654E',
        },
        sage: {
          DEFAULT: '#7B9669',
          hover: '#688258',
          light: '#94AC84',
          dim: 'rgba(123, 150, 105, 0.15)',
        },
        slateGreen: {
          DEFAULT: '#6C8480',
          dark: '#586E6A',
          light: '#889F9B',
          dim: 'rgba(108, 132, 128, 0.15)',
        },
        paleSage: {
          DEFAULT: '#BAC8B1',
          light: '#D3DDD0',
          dim: 'rgba(186, 200, 177, 0.25)',
        },
        lightGray: {
          DEFAULT: '#E6E6E6',
          bg: '#F4F7F4',
          card: '#FFFFFF',
          border: 'rgba(64, 78, 59, 0.12)',
        },

        // Semantic & Layout Tokens
        'page-bg': '#F4F7F4',
        accent: {
          DEFAULT: '#7B9669',
          hover: '#688258',
          dim: 'rgba(123, 150, 105, 0.15)',
          glow: 'rgba(123, 150, 105, 0.25)',
          dark: '#404E3B',
        },
        danger: {
          DEFAULT: '#DC2626',
          dim: 'rgba(220, 38, 38, 0.12)',
        },
        warning: {
          DEFAULT: '#D97706',
          dim: 'rgba(217, 119, 6, 0.12)',
        },
        glass: {
          DEFAULT: 'rgba(255, 255, 255, 0.90)',
          mid: 'rgba(255, 255, 255, 0.95)',
          strong: '#FFFFFF',
          hover: 'rgba(244, 247, 244, 0.95)',
        },
        cyber: {
          obsidian: '#404E3B',
          obsidianElevated: '#333F2F',
          card: '#FFFFFF',
          cardBorder: 'rgba(64, 78, 59, 0.12)',
          cyan: '#7B9669',
          cyanLight: '#94AC84',
          blue: '#6C8480',
          emerald: '#7B9669',
          amber: '#D97706',
          crimson: '#DC2626',
          crimsonBright: '#EF4444',
          muted: '#6C8480',
          borderTranslucent: 'rgba(64, 78, 59, 0.12)',
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
        'card-soft': '0 2px 14px rgba(64, 78, 59, 0.06)',
        'card-elevated': '0 8px 24px rgba(64, 78, 59, 0.08)',
        'sidebar': '4px 0 24px rgba(64, 78, 59, 0.08)',
      }
    },
  },
  plugins: [],
}
