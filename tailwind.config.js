const withMT = require('@material-tailwind/react/utils/withMT')

module.exports = withMT({
  mode: 'jit',
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1rem',
    },
    screens: {
      xs: '376px',
      sm: '460px',
      md: '768px',
      '2md': '900px',
      lg: '1024px',
      xl: '1440px',
      '2xl': '1536px',
    },
    extend: {
      height: {
        100: '100px',
        55: '55px',
        80: '80px',
        160: '160px',
        64: '64px',
        24: '24px',
        54: '54px',
        227: '227px',
        238: '238px',
      },
      width: {
        342: '342px',
        155: '155px',
        100: '100px',
        80: '80px',
        192: '192px',
        398: '398px',
        24: '24px',
        137: '137px',
        398: '398px',
        127: '127px',
      },
      borderWidth: {
        8: '8px',
      },
      colors: {
        'md-light-surface-2': 'transparent',
        'md-light-on-secondary-container': 'yellow',
        'md-light-primary': 'transparent',
        'md-light-on-surface-variant': 'white',
        btnprimary: 'rgba(141, 28, 254, 1)',
        t1: 'rgb(239,250,13)',
        black: {
          100: '#000000',
          '1a': '#1E1C1A',
        },
        gray: {
          100: '#f2f4f7',
          200: '#e1e4e9',
          300: '#dadcdf',
          400: '#cfd4dc',
          500: '#a0a7b5',
          600: '#9ea5b2',
          700: '#818a98',
          800: '#848c9b',
          900: '#6b7381',
        },
        grey: {
          100: '#3F3F3F',
          200: '#303030',
          300: '#848C9B',
          400: 'linear-gradient(45deg, #303030 0%,#000000 100%)',
        },
        normal: {
          100: '#545a65',
          200: '#3d434c',
          300: '#282c32',
          400: '#292c33',
          500: '#1e2126',
          600: '#14161a',
        },
        primary: {
          100: '#56abff',
          200: '#007efb',
          300: '#0072e2',
          400: '#005ab4',
        },
        success: {
          100: '#7ddb91',
          200: '#33b04e',
        },
        error: {
          100: '#ff6f50',
          200: '#db330e',
        },
        active: {
          100: '#5679ff',
          200: '#1e4cff',
        },
        purple: {
          100: '#6c5dd3',
        },
        pink: {
          100: '#ff98e5',
        },
        'sea-green': {
          100: '#24ba9d',
        },
        cotta: {
          100: '#ed705f',
        },
        vanilla: {
          100: '#D9D9D9',
        },
        darkgreen: {
          100: '#1E2126',
        },
        yellow: {
          100: '#B18617',
          200: '#E3C043',
        },
        blue: {
          100: '#1F2428',
          200: '#009ED0',
          300: 'linear-gradient(45deg, #67E4FF 0%,#009ED0 100%)',
        },
      },
      backgroundImage: {
        'black-linear': 'linear-gradient(180deg, #303030 0%, #000 100%)',
        top1: 'linear-gradient(116.86deg, rgba(13, 13, 14, 0.77) 12.8%, rgba(23, 23, 23, 0.77) 86.03%)',
        bottom1:
          'radial-gradient(68.62% 260.46%  at 50% 50%, #6ADBFF 0%, #6D6AFF 42.71%, #FC6AFF 100%)',
        bottom2:
          'radial-gradient(68.62% 260.46% at 50% 50%, #6D6AFF 0%, #3549FF 56.25%, #6ADBFF 100%)',
        bottom3:
          'radial-gradient(68.62% 260.46% at 50% 50%, #6AFFAF 0%, #35AAFF 56.25%, #6AF6FF 100%)',
        bottom4:
          'radial-gradient(68.62% 260.46% at 50% 50%, #FF8E6A 0%, #A635FF 56.25%, #B56AFF 100%) ',
        roadmap: 'linear-gradient(209.07deg, #3D434C 10.27%, #000000 82.13%)',
        roadmap4: 'linear-gradient(182.12deg, #3D434C 1.79%, #000000 98.22%)',
        ex: "url('/images/bg-ext-section.png')",
        headerTop:
          'linear-gradient(270deg, #000000 0%, #5116CE 35.42%, #8021DF 68.75%, #000000 100%)',
        'blue-gradient': 'linear-gradient(to right, #67E4FF, #009ED0)',
        'black-gradient': 'linear-gradient(to right, #303030, #000000)',
        'blue-gradient-1': 'linear-gradient(25deg, #005f80 0%,#009ED0 100%)',
        'darkblue-gradient': 'linear-gradient(to bottom right, #1F2428, #2E3E5E)',
        'green-gradient': 'linear-gradient(to right, #98FF32, #EFFF38)',
      },
      boxShadow: {
        form: '87px 79px 47px rgba(0, 0, 0, 0.01), 49px 45px 40px rgba(0, 0, 0, 0.05), 22px 20px 29px rgba(0, 0, 0, 0.09), 5px 5px 16px rgba(0, 0, 0, 0.1), 0px 0px 0px rgba(0, 0, 0, 0.1);',
        general: '0px -3px 0px 0px rgba(0, 0, 0, 0.20) inset',
      },
    },
    fontFamily: {
      sans: ['Planet Gamers', 'Space Grotesk'],
      planet: 'Planet Gamers',
      spaceGrotesk: 'Space Grotesk',
    },
  },
  plugins: [require('tailwind-scrollbar-hide')],
})
