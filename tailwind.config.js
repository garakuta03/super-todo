/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0EA5E9',
          hover: '#0284C7',
        },
        purple: {
          DEFAULT: '#A855F7',
          light: '#E9D5FF',
        },
      },
    },
  },
  plugins: [],
}
