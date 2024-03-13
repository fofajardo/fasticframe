module.exports = {
  purge: {
    enabled: true,
    content: [
      './**/*.html',],
  },
  theme: {
    extend: {
      maxWidth: {
      '6': '6rem',
      },
      colors: {
        primary: {
          DEFAULT: '#124b0b',
          dark: '#233876',
        },
        secondary: {
          DEFAULT: "#cfc296",
        }
      },
      fontFamily: {
        'sans': ['Rubik','Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  variants: {},
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}
