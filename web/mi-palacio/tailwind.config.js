/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta de lujo Palacio: negro / dorado / crema (docs/constitution.md §7.2).
        // Referencia visual original, no assets ni marcas reales.
        palacio: {
          black: '#12100E',
          charcoal: '#1E1B18',
          cream: '#F8F3E9',
          'cream-dark': '#EEE5D3',
          gold: '#B6893F',
          'gold-light': '#D8B978',
          'gold-dark': '#8C6A2F',
          ink: '#2A2622',
          muted: '#8A8078',
        },
      },
      fontFamily: {
        serif: ['"Iowan Old Style"', 'Georgia', '"Times New Roman"', 'serif'],
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          '"Noto Sans"',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        gold: '0 0 0 1px rgba(182, 137, 63, 0.35)',
      },
    },
  },
  plugins: [],
};
