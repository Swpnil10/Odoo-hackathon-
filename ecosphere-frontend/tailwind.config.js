/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#05070f',
          card: 'rgba(11, 15, 30, 0.5)',
          cardLight: 'rgba(20, 28, 54, 0.6)',
          border: 'rgba(255, 255, 255, 0.06)',
          borderHover: 'rgba(255, 255, 255, 0.15)',
          textMuted: '#94a3b8',
        },
        env: {
          primary: '#10b981',    // Emerald
          secondary: '#14b8a6',  // Teal
          glow: 'rgba(16, 185, 129, 0.15)',
        },
        social: {
          primary: '#8b5cf6',    // Violet
          secondary: '#ec4899',  // Pink/Rose
          glow: 'rgba(139, 92, 246, 0.15)',
        },
        gov: {
          primary: '#f59e0b',    // Amber
          secondary: '#f97316',  // Orange
          glow: 'rgba(245, 158, 11, 0.15)',
        },
      },
      scale: {
        '102': '1.02',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'spin-slow': 'spin 15s linear infinite',
        'pulse-glow': 'pulseGlow 4s ease-in-out infinite',
        'sway': 'sway 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', filter: 'blur(10px)' },
          '50%': { opacity: '0.8', filter: 'blur(16px)' },
        },
        sway: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '50%': { transform: 'rotate(4deg)' },
        }
      },
    },
  },
  plugins: [],
}
