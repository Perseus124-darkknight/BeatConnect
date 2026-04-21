export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../packages/shared/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ec4899',   // Match legacy pink
        secondary: '#06b6d4', // Match cyan accent
      },
      fontFamily: {
        main: ['Outfit', 'sans-serif'],
        heading: ['Bebas Neue', 'cursive'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Bebas Neue', 'cursive'],
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      }
    },
  },
  plugins: [],
}
