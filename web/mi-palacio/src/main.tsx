import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Tipografía de marca (self-hosted vía @fontsource, sin CDN externo) — ver
// brand-reference/ (Gotham/Vonnes reales) sustituidas por equivalentes libres:
// Poppins para UI/cuerpo, Playfair Display itálica para titulares editoriales.
import '@fontsource/poppins/300.css';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '@fontsource/playfair-display/400-italic.css';
import '@fontsource/playfair-display/500-italic.css';
import '@fontsource/playfair-display/600-italic.css';
import '@fontsource/playfair-display/700-italic.css';

import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
