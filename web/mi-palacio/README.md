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

2. Instala dependencias y arranca este proyecto:

   ```bash
   npm install
   npm run dev
   ```

   Vite está fijado al puerto **5173** (`vite.config.ts`, `strictPort: true`) para que coincida
   con la política de CORS del backend. Si algo más ya ocupa ese puerto, el dev server fallará
   en vez de tomar otro puerto silenciosamente — libera el 5173 antes de correr `npm run dev`.

3. Abre `http://localhost:5173`.

Si necesitas apuntar a otra URL de la API (por ejemplo, un despliegue de demo), define
`VITE_RETURNS_API_BASE_URL` en un `.env.local` antes de `npm run dev`.

## Qué hace

- **Detalle de compra** (`src/features/purchase-detail`): vista post-compra del vestido de
  Sofía de la Garza (talla comprada 4, necesita talla 6 antes del sábado) con el botón
  "¿Necesitas ayuda con esta compra?".
- **Concierge Postcompra** (`src/features/concierge-chat`): panel de chat guiado que sigue el
  guion de `historia.md` §3.1. Al aceptar el cambio, dispara en secuencia:
  1. Reserva de talla en Palacio Polanco — **simulada localmente** (no existe endpoint de
     inventario en el backend hoy; ver `src/lib/order-fixture.ts` y
     `src/features/concierge-chat/api/concierge-actions.ts`, donde está comentado).
  2. `POST /api/returns` real contra Returns Orchestrator.
  3. `POST /api/returns/{id}/qr-code` real, y renderiza el QR con `qrcode.react` (canvas, sin
     depender de ningún servicio de imágenes de terceros — también se puede descargar como PNG).
- **Momento de lujo digital** (`ConfirmationScreen.tsx`): "Talla 6 reservada hasta mañana, 6:00
  p. m. — Palacio Polanco — Tiempo estimado del proceso: 12 minutos" con el QR real.
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
- Paleta e ilustraciones son originales (negro/dorado/crema, inspiración genérica de e-commerce
  de lujo) — no se hizo scraping de ningún sitio real ni se reproducen logos/marcas reales
  (`docs/constitution.md` §7.2).
- `npm run build` compila sin errores (`tsc -b && vite build`).
