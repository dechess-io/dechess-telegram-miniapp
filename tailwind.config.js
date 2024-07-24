const konstaConfig = require('konsta/config')
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = konstaConfig({
  mode: 'jit',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          '9f': '#5F729F',
          84: '#3E5384',
        },
        black: {
          12: '#121212',
          '1a': '#1E1C1A',
        },
        grey: {
          61: '#616161',
        },
        white: {
          fe: '#FFFEFE',
        },
      },
    },
    fontFamily: {
      space: ['"Space Grotesk"', ...defaultTheme.fontFamily.sans],
    },
  },
  plugins: [],
})
