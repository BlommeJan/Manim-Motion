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
          'bg': '#0a0a0f',
          'surface': '#12121a',
          'border': '#1e1e2e',
          'accent': '#6366f1',
          'accent-hover': '#818cf8',
          'text': '#e2e8f0',
          'text-muted': '#64748b',
          'success': '#22c55e',
          'warning': '#f59e0b',
          'error': '#ef4444'
        }
      }
    }
  },
  plugins: []
};
