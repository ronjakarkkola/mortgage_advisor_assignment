/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0E2238',
          800: '#15304D',
          700: '#1C3D60',
          600: '#28547F',
        },
        'sg': {
          700: '#256E4C',
          600: '#2F8F62',
          500: '#3FA876',
          100: '#E5F6ED',
        },
        'sb': {
          600: '#3A6489',
          500: '#4A7CA8',
          100: '#E7F0F8',
        },
        'sa': {
          600: '#B9762A',
          100: '#FBF0DF',
        },
        'sr': {
          600: '#C0443F',
          100: '#FBE9E8',
        },
      },
      fontFamily: {
        display: ['Manrope', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'Menlo', 'monospace'],
      },
      keyframes: {
        bounce3: {
          '0%, 60%, 100%': { transform: 'translateY(0)', opacity: '0.5' },
          '30%': { transform: 'translateY(-4px)', opacity: '1' },
        },
        toastIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        bounce3: 'bounce3 1.2s infinite',
        toastIn: 'toastIn 0.2s ease',
      },
    },
  },
  plugins: [],
}
