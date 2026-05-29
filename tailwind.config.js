/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bebas Neue"', 'cursive'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        void: '#080808',
        surface: '#0f0f0f',
        panel: '#141414',
        border: '#1f1f1f',
        muted: '#2a2a2a',
        accent: {
          red: '#e63946',
          orange: '#f4913d',
          green: '#39d353',
          gold: '#f5c542',
        },
        text: {
          primary: '#f0f0f0',
          secondary: '#888',
          muted: '#444',
        }
      },
      boxShadow: {
        'glow-red': '0 0 20px rgba(230,57,70,0.3)',
        'glow-green': '0 0 20px rgba(57,211,83,0.3)',
        'glow-gold': '0 0 20px rgba(245,197,66,0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease forwards',
        'slide-up': 'slideUp 0.4s ease forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
