/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta de marca real de El Palacio de Hierro (docs/constitution.md §7.2),
        // extraída de common.css de palaciodehierro.com — ver
        // brand-reference/palaciodehierro (gitignored, solo tokens puntuales aquí).
        // gold-dark/muted se oscurecieron ligeramente respecto al valor crudo del sitio
        // para cumplir contraste WCAG AA como texto sobre fondos claros.
        palacio: {
          black: '#181818', // texto/logo principal real
          charcoal: '#2E2E2E', // hover state derivado del ink real
          white: '#FFFFFF', // fondo base real
          'off-white': '#FAFAFA', // fondo base secundario real
          cream: '#F3F2F0', // fondo de PDP real ("crema cálido")
          'cream-dark': '#EAE7E2', // paneles secundarios sobre crema
          gold: '#EBB349', // acento dorado real de marca
          'gold-light': '#F5D795',
          'gold-dark': '#8A5E12', // AA-safe para texto sobre crema/blanco
          ink: '#181818',
          muted: '#5C5C5C', // AA-safe (>=4.5:1 sobre crema/blanco)
          error: '#BA0000', // real
        },
      },
      fontFamily: {
        // Gotham y times_new_romanitalic/Vonnes son de licencia propia de Palacio de
        // Hierro — se sustituyen por equivalentes libres self-hosted vía @fontsource
        // (ver src/main.tsx), con carácter similar (geométrica + serif itálica editorial).
        serif: ['"Playfair Display"', 'Georgia', '"Times New Roman"', 'serif'],
        sans: ['Poppins', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Helvetica', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        gold: '0 0 0 1px rgba(182, 137, 63, 0.35)',
      },
    },
  },
  plugins: [],
};
