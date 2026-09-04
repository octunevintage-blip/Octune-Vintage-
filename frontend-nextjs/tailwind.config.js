/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        'vnv-black': '#000000',
        'vnv-white': '#ffffff',
        'vnv-light-gray': '#f4f4f4',
        'vnv-dark-gray': '#333333',
        'vnv-gray': '#999999',
      },
      fontFamily: {
        sans: ['var(--font-open-sans)', 'sans-serif'],
        display: ['var(--font-open-sans)', 'sans-serif'],
      },
      animation: {
        'marquee': 'marquee 30s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      }
    },
  },
  plugins: [],
}
