/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0F172A',
        card: '#1E293B',
        sidebar: '#111827',
        primary: '#3B82F6',
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444',
        text: '#F8FAFC',
        secondary: '#94A3B8',
        border: '#334155',
      },
      fontFamily: {
        sans: ['Inter', 'Geist', 'Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Geist', 'Manrope', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 40px rgba(59, 130, 246, 0.16)',
      },
      backgroundImage: {
        'grid-fade': 'radial-gradient(circle at top, rgba(59,130,246,0.16), transparent 35%), linear-gradient(135deg, rgba(15,23,42,0.98), rgba(2,6,23,1))',
      },
    },
  },
  plugins: [],
};