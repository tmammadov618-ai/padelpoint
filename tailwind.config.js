/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        charcoal:      '#3A3A3A',
        'charcoal-lt': '#4E4E4E',
        lime:          '#C8E63C',
        'lime-dark':   '#A8C420',
        'lime-pale':   'rgba(200,230,60,0.1)',
        terra:         '#D4875A',
        'terra-light': '#E8A47C',
        'terra-pale':  'rgba(212,135,90,0.1)',
        ivory:         '#FFFFFF',
        'off-white':   '#F5F5F3',
        'gray-ui':     '#888888',
        'gray-light':  '#E8E8E5',
        'gray-mid':    '#CCCCCA',
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontWeight: {
        black: '900',
      },
      boxShadow: {
        card:  '0 1px 4px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.1)',
      },
      borderRadius: {
        DEFAULT: '8px',
        lg: '10px',
        xl: '12px',
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
