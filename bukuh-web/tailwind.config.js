/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef9ff',
          100: '#d8f0ff',
          200: '#b9e5ff',
          300: '#86d5ff',
          400: '#45beff',
          500: '#1499ff',
          600: '#0978db',
          700: '#0b63b3',
          800: '#0e538f',
          900: '#113e64'
        }
      },
      boxShadow: {
        soft: '0 10px 30px rgba(2,12,27,0.12)'
      },
      borderRadius: {
        xl2: '1.25rem'
      }
    }
  },
  plugins: []
}
