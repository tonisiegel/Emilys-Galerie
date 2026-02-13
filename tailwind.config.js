/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Emily's Galerie - Pastell & Erdtöne
        sage: {
          50: '#f6f7f6',
          100: '#e3e7e3',
          200: '#c7d1c7',
          300: '#a3b3a3',
          400: '#7d917d',
          500: '#5f755f',
          600: '#4b5d4b',
          700: '#3d4b3d',
          800: '#333e33',
          900: '#2b342b',
        },
        sand: {
          50: '#fdfcfa',
          100: '#f7f3ed',
          200: '#efe7db',
          300: '#e4d5c1',
          400: '#d4bda0',
          500: '#c4a582',
          600: '#b08d68',
          700: '#937356',
          800: '#785e49',
          900: '#634e3e',
        },
        cream: {
          50: '#fefdfb',
          100: '#fcf9f3',
          200: '#f9f3e8',
          300: '#f3e8d6',
          400: '#e8d5b8',
          500: '#dcc299',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

