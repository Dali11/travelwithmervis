/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,html}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bricolage Grotesque"', '"Avenir Next"', '"Trebuchet MS"', 'system-ui', 'sans-serif'],
        body: ['Figtree', 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      colors: {
        accent: '#ffb547',
        'accent-ink': '#2a1a00',
      },
    },
  },
  plugins: [],
};
