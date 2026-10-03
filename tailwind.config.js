/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // The Souled Store Exact Color Scale
        primary: {
          50: '#fdf2f2',
          100: '#fae5e5',
          200: '#f3c3c3',
          300: '#f09494',
          400: '#ea5252',
          500: '#e12d2d',
          600: '#bb1b1b',
          700: '#981616',
          800: '#741111',
          900: '#541212',
          950: '#360c0c',
        },
        brand: {
          DEFAULT: '#e12d2d',
          dark: '#bb1b1b',
          deep: '#981616',
          light: '#fae5e5',
          subtle: '#fdf2f2',
        },
        // Neutrals scale from The Souled Store
        neutral: {
          50: '#f7f7f7',
          100: '#eff0f0',
          200: '#dbdbdc',
          300: '#c1c1c3',
          400: '#9c9ea0',
          500: '#7d7f82',
          600: '#696b6d',
          700: '#58595b',
          800: '#414243',
          900: '#323334',
          950: '#212122',
        },
        // Swatch additions from user image
        swatch: {
          navy: '#282c3f',
          blush: '#ffebe7',
          slate: '#979a9f',
        },
        bg: {
          primary: '#ffffff',
          surface: '#f7f7f7',
          card: '#ffffff',
          dark: '#212122',
        },
        text: {
          primary: '#212122',
          secondary: '#58595b',
          muted: '#7d7f82',
          light: '#9c9ea0',
        },
        borderCol: '#eff0f0',
        borderDark: '#dbdbdc',
        accentAlert: '#e12d2d',
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
      },
      fontFamily: {
        body: ['"Source Sans Pro"', '"Source Sans 3"', 'sans-serif'],
        heading: ['"Source Sans Pro"', '"Source Sans 3"', 'sans-serif'],
      },
      fontSize: {
        'xs': '0.625rem',
        'sm': '0.813rem',
        'base': '0.938rem',
        'lg': '1.13rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.5rem',
      },
      borderRadius: {
        'sm': '0.1875rem',
        'md': '0.375rem',
        'xl': '0.75rem',
        '2xl': '1rem',
      },
      boxShadow: {
        'xs': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'sm': '0 2px 3px 0 rgba(0, 0, 0, 0.2)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1)',
        'soft': '0 2px 10px rgba(0, 0, 0, 0.04)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.06)',
        'float': '0 8px 30px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
};
