/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'chat': {
          'bg': '#0f0f0f',
          'surface': '#1a1a1a',
          'border': '#333333',
          'text': '#ffffff',
          'text-muted': '#888888',
          'accent': '#00ff00',
        }
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
} 