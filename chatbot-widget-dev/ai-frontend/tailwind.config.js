/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#ec4899', // pink-500
          foreground: '#ffffff'
        },
        secondary: {
          DEFAULT: '#06b6d4', // cyan-500
          foreground: '#ffffff'
        },
        bg: {
          dark: '#05050a',
        },
        muted: {
          DEFAULT: '#a1a1aa',
        }
      },
      backgroundColor: {
        glass: 'rgba(255, 255, 255, 0.03)',
      },
      borderColor: {
        glass: 'rgba(255, 255, 255, 0.1)',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
        display: ['"Bebas Neue"', 'cursive'],
        sans: ['Outfit', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
}
