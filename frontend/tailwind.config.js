/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        radar: {
          bg: '#040D1A',
          card: '#070F1F',
          border: '#0E2040',
          cyan: '#00D4FF',
          amber: '#FFB020',
          green: '#00FF88',
          red: '#FF3860',
          purple: '#B57BFF',
          muted: '#4A6080',
        },
      },
      fontFamily: {
        display: ['Orbitron', 'monospace'],
        body: ['Exo 2', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-cyan': 'pulseCyan 2s ease-in-out infinite',
        'scan': 'scan 4s linear infinite',
        'fade-up': 'fadeUp 0.5s ease forwards',
        'blink': 'blink 1s step-end infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        pulseCyan: {
          '0%, 100%': { boxShadow: '0 0 5px #00D4FF44' },
          '50%': { boxShadow: '0 0 20px #00D4FFAA, 0 0 40px #00D4FF44' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        blink: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0 },
        },
      },
    },
  },
  plugins: [],
}
