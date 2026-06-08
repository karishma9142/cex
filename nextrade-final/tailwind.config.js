/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne',           'sans-serif'],
        body:    ['"DM Sans"',      'sans-serif'],
        mono:    ['"JetBrains Mono"','monospace'],
      },
      colors: {
        bg:      '#06080b',
        bg2:     '#0b0e13',
        bg3:     '#101318',
        bg4:     '#161b22',
        border:  '#1c2230',
        border2: '#252d3d',
        ink:     '#edf0f5',
        ink2:    '#7a8499',
        ink3:    '#3d4558',
        blue:    '#3b82f6',
        green:   '#22c55e',
        red:     '#ef4444',
      },
      animation: {
        'fade-up':   'fadeUp .55s ease both',
        'fade-up-2': 'fadeUp .55s .08s ease both',
        'fade-up-3': 'fadeUp .55s .16s ease both',
        'fade-up-4': 'fadeUp .55s .24s ease both',
        'fade-up-5': 'fadeUp .55s .32s ease both',
        'blink':     'blink 2s ease-in-out infinite',
        'ticker':    'ticker 22s linear infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to:   { opacity: '1', transform: 'none' },
        },
        blink: {
          '0%,100%': { opacity: '1' },
          '50%':     { opacity: '.25' },
        },
        ticker: {
          from: { transform: 'translateX(0)' },
          to:   { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}
