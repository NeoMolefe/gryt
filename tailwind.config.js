/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-bg)',
        card: 'var(--color-card)',
        elevated: 'var(--color-elevated)',
        border: 'var(--color-border)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-muted': 'var(--color-text-muted)',
        brand: {
          orange: 'var(--color-brand-orange)',
          'orange-hover': 'var(--color-brand-orange-hover)',
        },
        phase: {
          foundation: 'var(--color-phase-foundation)',
          build: 'var(--color-phase-build)',
          peak: 'var(--color-phase-peak)',
          deload: 'var(--color-phase-deload)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
