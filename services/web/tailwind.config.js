/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js}"
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Space Grotesk', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace']
      },
      colors: {
        'studio': {
          'bg':              'rgb(var(--c-bg) / <alpha-value>)',
          'surface':         'rgb(var(--c-surface) / <alpha-value>)',
          'surface2':        'rgb(var(--c-surface2) / <alpha-value>)',
          'surface3':        'rgb(var(--c-surface3) / <alpha-value>)',
          'border':          'rgb(var(--c-border) / <alpha-value>)',
          'divider':         'rgb(var(--c-divider) / <alpha-value>)',
          'accent':          'rgb(var(--c-accent) / <alpha-value>)',
          'accent-hover':    'rgb(var(--c-accent-hover) / <alpha-value>)',
          'accent-pressed':  'rgb(var(--c-accent-pressed) / <alpha-value>)',
          'accent-subtle':   'rgb(var(--c-accent-subtle) / <alpha-value>)',
          'text':            'rgb(var(--c-text) / <alpha-value>)',
          'text-secondary':  'rgb(var(--c-text-secondary) / <alpha-value>)',
          'text-muted':      'rgb(var(--c-text-muted) / <alpha-value>)',
          'success':         'rgb(var(--c-success) / <alpha-value>)',
          'success-hover':   'rgb(var(--c-success-hover) / <alpha-value>)',
          'success-subtle':  'rgb(var(--c-success-subtle) / <alpha-value>)',
          'warning':         'rgb(var(--c-warning) / <alpha-value>)',
          'error':           'rgb(var(--c-danger) / <alpha-value>)',
          'danger':          'rgb(var(--c-danger) / <alpha-value>)',
        }
      }
    }
  },
  plugins: []
};
