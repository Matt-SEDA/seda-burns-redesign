/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
      },
      colors: {
        surface: {
          0: '#09090b',
          1: '#111113',
          2: '#18181b',
          3: '#1f1f23',
        },
        accent: '#22d3ee',
        'accent-dim': '#0e7490',
        border: '#27272a',
      },
    },
  },
  plugins: [],
};
