/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Consolas', 'Liberation Mono', 'Menlo', 'monospace'],
        sans: ['JetBrains Mono', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        chat: {
          bg: '#0f0f0f',           // Very dark background
          surface: '#1a1a1a',      // Slightly lighter surface
          border: '#2a2a2a',       // Border color
          text: '#ffffff',         // Primary text
          'text-muted': '#a0a0a0', // Secondary text
          primary: '#27abde',       // Primary blue
          secondary: '#00a99e',     // Secondary green
          accent: '#27abde',        // Accent (primary blue)
          success: '#00a99e',       // Success (green)
          warning: '#fbbf24',       // Warning
          error: '#ef4444',         // Error
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #27abde 0%, #00a99e 100%)',
        'gradient-primary-hover': 'linear-gradient(135deg, #2196d6 0%, #009a90 100%)',
        'gradient-subtle': 'linear-gradient(135deg, rgba(39, 171, 222, 0.1) 0%, rgba(0, 169, 158, 0.1) 100%)',
      },
    },
  },
  plugins: [],
} 