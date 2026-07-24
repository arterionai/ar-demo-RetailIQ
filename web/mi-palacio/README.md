# Mi Palacio

Superficie web de cliente del "Proyecto Espejo" / "Inteligencia Palacio". Prototipo de demo —
no es código de producción. Ver `docs/constitution.md` y `historia.md` (raíz del repo) para el
contexto narrativo y las reglas de arquitectura completas.

## Cómo correr

1. Levanta el backend real primero (en otra terminal, desde la raíz del repo):

   ```bash
   dotnet run --project src/Palacio.Returns.Api
   ```

   Debe quedar escuchando en `http://localhost:5163` (Swagger en `/swagger`). CORS ya está
   habilitado ahí para `http://localhost:5173`.

2. Levanta el proxy del concierge (en otra terminal, desde `web/mi-palacio/server/`):

   ```bash
   cd web/mi-palacio/server
   npm install
   npm start
   ```

   Queda escuchando en `http://localhost:5176` y llama a Azure OpenAI en nombre del Concierge
   Postcompra — ver `server/README.md` para el detalle completo (variables de entorno, de dónde
   las toma en desarrollo local, contrato de la API). La API key de Azure OpenAI vive únicamente
   en este proceso, nunca en el frontend.

3. Instala dependencias y arranca este proyecto:

   ```bash
   npm install
   npm run dev
   ```

   Vite está fijado al puerto **5173** (`vite.config.ts`, `strictPort: true`) para que coincida
   con la política de CORS del backend. Si algo más ya ocupa ese puerto, el dev server fallará
   en vez de tomar otro puerto silenciosamente — libera el 5173 antes de correr `npm run dev`.

4. Abre `http://localhost:5173`.

Si necesitas apuntar a otra URL, define en un `.env.local` antes de `npm run dev`:

- `VITE_RETURNS_API_BASE_URL` — URL de `Palacio.Returns.Api` (default `http://localhost:5163`).
- `VITE_CONCIERGE_PROXY_URL` — URL del proxy del concierge (default `http://localhost:5176`).

## Qué hace

- **Detalle de compra** (`src/features/purchase-detail`): vista post-compra del vestido de
  Sofía de la Garza (talla comprada 4, necesita talla 6 antes del sábado) con el botón
  "¿Necesitas ayuda con esta compra?".
- **Concierge Postcompra** (`src/features/concierge-chat`): chat de texto libre real, respaldado
  por Azure OpenAI a través del proxy propio en `web/mi-palacio/server/` (`useConciergeChat.ts`).
  La clienta escribe lo que quiera; el concierge abre la conversación preguntando proactivamente
  "¿En qué puedo ayudarte con tu compra?" sin esperar a que ella escriba primero. El modelo nunca
  decide ni ejecuta un cambio o devolución directamente (ADR-014, ver `docs/constitution.md`
  §3.1) — solo puede invocar una tool (`iniciar_cambio_de_talla`) cuando la clienta ya confirmó
  explícitamente que quiere proceder. Al recibir esa tool call, el frontend dispara en secuencia
  las llamadas reales ya existentes (idéntico orden al flujo guiado original):
  1. Reserva de talla en Palacio Polanco — **simulada localmente** (no existe endpoint de
     inventario en el backend hoy; ver `src/lib/order-fixture.ts` y
     `src/features/concierge-chat/api/concierge-actions.ts`, donde está comentado).
  2. `POST /api/returns` real contra Returns Orchestrator.
  3. `POST /api/returns/{id}/qr-code` real, y renderiza el QR con `qrcode.react` (canvas, sin
     depender de ningún servicio de imágenes de terceros — también se puede descargar como PNG).

  El resultado real (reserva, elegibilidad, QR) se le devuelve al modelo como respuesta de la
  tool para que anuncie el resultado de forma natural en el chat, en vez de inventarlo.
- **Momento de lujo digital** (`ConfirmationScreen.tsx`): se renderiza inline en el hilo del chat,
  justo debajo del mensaje del concierge que anuncia la reserva real: "Talla 6 reservada hasta
  mañana, 6:00 p. m. — Palacio Polanco — Tiempo estimado del proceso: 12 minutos" con el QR real.
- **Estatus de mi devolución** (`src/features/return-status`): ver sección siguiente.

## Reservado para el "live-build" de la demo

**No existe ningún endpoint `GET` en el backend hoy** — es intencional: se construye en vivo con
GitHub Copilot durante la presentación (el "momento killer en VS Code" de `historia.md` §7.2).

Por eso, `ReturnStatusPage.tsx` **no llama a ningún `GET /api/returns/{id}`**. Esa pantalla solo
muestra el último estado conocido en el navegador (la respuesta del `POST /api/returns` original
de la sesión, guardada en `AppStateProvider`) y una sección "Próximamente — Seguimiento en tiempo
real" claramente marcada como pendiente. El punto exacto de conexión futura está señalado con:

```ts
// TODO(demo-live-build): se conecta a GET /api/returns/{id} durante la presentación en vivo.
```

en `src/features/return-status/components/ReturnStatusPage.tsx`.

## Notas de implementación

- Los tipos en `src/lib/api-types.ts` reflejan campo por campo los DTOs reales de
  `Palacio.Returns.Api/DTOs` (verificado contra la API corriendo: `QrCodeResponseDto` serializa
  como `{ token, expiresAtUtc }`, no `{ qrToken, qrExpiresAtUtc }`).
- Todo elemento interactivo lleva `data-testid`.
- Paleta, tipografía y algunos assets puntuales (logo, fotos del vestido) se alinean con la
  identidad visual real de palaciodehierro.com, dentro del alcance acotado autorizado en
  `docs/constitution.md` §7.2: colores y logo tomados literalmente de una referencia visual
  puntual ya descargada (`brand-reference/`, gitignored, no se commitea cruda); Gotham y
  times_new_romanitalic/Vonnes (fuentes con licencia propia de Palacio) se sustituyen por
  equivalentes libres self-hosted vía `@fontsource` — Poppins y Playfair Display itálica.
  No se reproduce ningún otro contenido del sitio real (copy, layout completo, JS, etc.).
- `npm run build` compila sin errores (`tsc -b && vite build`).
- El proxy del concierge (`server/`) es un proyecto Node/Express **separado**, con su propio
  `package.json` — no participa del build de Vite ni de `tsc -b`. Ver `server/README.md`.
- Para correr la demo completa hacen falta 3 procesos: `dotnet run --project src/Palacio.Returns.Api`
  (puerto 5163), `npm start` en `web/mi-palacio/server` (puerto 5176) y `npm run dev` aquí (puerto
  5173).
