/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Your existing design tokens mapped to Tailwind
        primary: '#ffffff',
        secondary: '#f4f6f8',
        accent: {
          DEFAULT: '#2563eb',
          hover: '#0056b3',
          dark: '#003d80',
        },
        text: '#23272f',
        danger: '#e11d48',
      },
      spacing: {
        // Your existing spacing tokens
        sm: '0.5rem',
        md: '1rem',
      },
      fontFamily: {
        // Clean, professional system font stack
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'sans-serif',
        ],
      },
      boxShadow: {
        'nav': '0 3px 16px rgba(0, 0, 0, 0.10)',
        'card': '0 2px 4px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 4px 8px rgba(0, 0, 0, 0.15)',
        'button': '0 2px 6px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
}

