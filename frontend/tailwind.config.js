/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Crucial for that toggle button
  theme: {
    extend: {
      colors: {
        accent: {
          purple: '#6B46C1', // The circular progress color
          red: '#F56565',
          green: '#48BB78',
          blue: '#4299E1',
        },
        dark: {
          bg: '#1A202C',
          card: '#2D3748',
        }
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem', // For those extra bubbly cards
      }
    },
  },
  plugins: [],
}