# Guion de demo en vivo — Inteligencia Palacio

> **Propósito de este documento**: qué cuenta usar, qué escribir/hacer y qué esperar en cada escena
> de la demo, para que quien presente (o ensaye) no tenga que improvisar. Distingue explícitamente
> lo **verificado en vivo** (ya lo probamos y funcionó) de lo **esperado pero no verificado**.
>
> **Nota de precisión importante**: no existen conversaciones reales de Teams entre los 10
> personajes — las herramientas disponibles para construir esta demo eran de solo-lectura para
> Teams. Lo que sí existe son documentos de SharePoint tipo "Recap de canal [Nombre]" que simulan
> esas conversaciones. Work IQ los encuentra y cita perfectamente (por eso todas las fuentes dicen
> "sharepoint", nunca "teams"). **Al presentar, di "lo encontré en documentos y correos del
> equipo", nunca "en una conversación de Teams"** — así queda preciso si alguien lo verifica en vivo.

---

## 0. Antes de presentar — checklist de cuentas y accesos

| Cuenta | Rol en la demo | Acceso que necesita |
|---|---|---|
| `maria.torres@fractalcs.com` | Protagonista — hace las preguntas a Work IQ en Teams (Escena 1) | Miembro del sitio "Proyecto Espejo"; **sin acceso** a `00-CONFIDENCIAL-FraudeCompliance` (a propósito) |
| `jaime.sanchez@arterion.ai` (o quien presente) | Observador/demo del comportamiento con permisos completos, si se usa para mostrar el contraste | Miembro del sitio + acceso explícito a la carpeta confidencial (ver instrucciones de sharing pendientes) |
| Cuenta de Jorge Ramírez (`jorge.ramirez@fractalcs.com`) | Construye el endpoint en VS Code con Copilot (Escena 3) | Acceso al repo `arterionai/ar-demo-RetailIQ` |

**Antes de la presentación real** (no el mismo día que se sembró el contenido): vuelve a correr las
3 preguntas de la Escena 1 una vez más — la primera vez algunas respuestas no encontraron el
"cuándo/por qué" del cambio de ADR-014 ni el postmortem, muy probablemente por latencia de indexado
de SharePoint/Copilot sobre contenido recién creado. Confirma que ya salen completas.

---

## Escena 1 — María reconstruye el contexto (Teams, Work IQ)

**Quién actúa:** inicia sesión como `maria.torres@fractalcs.com` en Teams (o el presentador
explica "esto lo escribiría María").

**Qué escribir (en este orden, como 3 mensajes separados a Work IQ/Copilot):**

1. > antes de diseñar nada, necesito entender cómo funciona hoy la devolución omnicanal. ¿Qué decisiones existen, qué incidentes hay, y a quién debería involucrar?
   >
   > **✅ Verificado en vivo.** Respuesta real obtenida: flujo AS-IS completo, decisiones de
   > elegibilidad/excepciones/monto de riesgo, el incidente de noviembre, el dato de que **61% de
   > las llamadas al call center son clientes preguntando si su devolución será aceptada**, y la
   > matriz RACI completa (Pedro Molina, Gabriela León, Fernanda Ortiz, Ricardo Salas, Daniel
   > Castro, Laura Martínez, Ana Sofía Ruiz, Carlos Vega). Fuente citada: SharePoint (política
   > vigente, customer journey, arquitectura objetivo, research de clientes, RACI).

2. > Encontré información contradictoria sobre si la app puede conectarse directamente a SAP. ¿Cuál es la decisión vigente, cuándo cambió y por qué?
   >
   > **⚠️ Probado en vivo, pero incompleto la primera vez.** La decisión vigente (App →
   > Orchestrator → SAP, nunca directo) sí salió bien. El "cuándo" (22 de septiembre de 2025) y el
   > "por qué" (propuesta de Pedro Molina del 15 de septiembre, descartada en la revisión de
   > arquitectura) **no salieron** — pero el contenido SÍ existe completo en `ADR-014
   > Orquestacion de devoluciones.md` y `Recap canal Arquitectura.md` (lo confirmé leyendo ambos
   > documentos directamente). Volver a probar esta pregunta cerca de la fecha de presentación.

3. > ¿Ha ocurrido antes algún incidente relacionado con aprobar un reembolso demasiado pronto? ¿Qué aprendimos y qué controles debemos conservar?
   >
   > **✅ Verificado en vivo — y es una escena en dos actos, mejor que lo guionado originalmente.**
   >
   > **Acto 1 — preguntando sin acceso a la carpeta confidencial:** Work IQ encuentra
   > correctamente el incidente y los controles vigentes (inspección física obligatoria antes de
   > reembolso, validación de elegibilidad, registro de aprobación/rechazo, antifraude,
   > desacoplamiento del ERP), pero dice explícitamente que **no encontró una sección de
   > "lecciones aprendidas" ni un postmortem formal**. Este es el comportamiento CORRECTO — la
   > carpeta `00-CONFIDENCIAL-FraudeCompliance` tiene permisos restringidos a propósito. Work IQ
   > no inventa un documento que no puede ver.
   >
   > **Acto 2 — con permisos, preguntando explícitamente** ("checa si no ha habido ningún
   > postmortem relacionado a las devoluciones"): Work IQ encuentra el postmortem y **dice él
   > mismo por qué no había aparecido antes** — cita textual real: *"No estaba apareciendo en las
   > búsquedas anteriores porque está marcado como confidencial."* Esta frase, dicha por el propio
   > producto, es más fuerte que cualquier línea de guion que yo hubiera escrito — úsala tal cual
   > en la presentación.
   >
   > Detalle real que sacó del postmortem (coincide con el código real del repo): causa raíz
   > `RefundEligibilityEvaluator.IsRefundApproved` interpretando "recibido" como "aprobado", 41
   > devoluciones procesadas de más, 6 de alto valor, ~MXN $380,000, y los 5 controles que nacieron
   > de ese incidente (separar recibido/inspeccionado, prohibición de reembolso pre-inspección,
   > antifraude para alto valor, orquestación obligatoria, pruebas de regresión).
   >
   > **Pendiente de retest, ya con permisos correctos:** la pregunta #2 de arriba (cuándo/por qué
   > cambió la decisión de SAP) — no la hemos vuelto a correr desde que se otorgaron permisos a
   > `jaime.sanchez@arterion.ai`. Probable que ahora sí salga completa (era indexado, no permisos).

**Frase narrativa de cierre de escena:** "No estamos usando IA para inventar respuestas. Estamos
usando IA para conectar la memoria de Palacio — y cuando no sabe algo con certeza, lo dice. Y
cuando sí tiene permiso de saberlo, lo dice también, y explica por qué antes no podía."

---

## Escena 2 — Jorge construye el endpoint en vivo (VS Code + GitHub Copilot)

**Quién actúa:** Jorge Ramírez (o el presentador en su nombre), en VS Code con Copilot Agent Mode
abierto sobre el repo `arterionai/ar-demo-RetailIQ`.

**Qué escribir a Copilot** (pendiente de redactar el prompt final y ensayar — **no verificado
aún**, ver conversación para acordar la versión exacta):

> Con el contexto de ADR-014 y el incidente de noviembre que acabamos de reconstruir, agrega el
> endpoint que falta para consultar el estatus de una devolución (`GET /api/returns/{id}`).
> Respeta las mismas reglas de capas del proyecto y agrega su prueba.

**Qué debería pasar:** Copilot genera el endpoint en `Palacio.Returns.Api`, un test en
`Palacio.Returns.Tests`, y idealmente un PR draft citando ADR-014 y el incidente.

**Acción pendiente:** ensayar esta escena antes de presentar — aún no la hemos corrido en vivo.

---

## Escena 3 — Sofía completa el flujo en Mi Palacio (cliente)

**Quién actúa:** el presentador, como clienta (Sofía), en `http://localhost:5173`.

**Qué hacer:**
1. Clic en **"¿Necesitas ayuda con esta compra?"**.
2. Esperar el saludo proactivo del Concierge (no hace falta escribir primero).
3. Escribir: *"la talla no me quedó y necesito una talla diferente para la gala que tengo el sábado"*.
4. El Concierge dirá en qué tiendas está disponible (Polanco y Santa Fe) — elegir una, ej. *"sí, vamos con Santa Fe por favor"*.
5. Se reserva de verdad, se abre el caso real, se genera el QR real.
6. **Si ya se construyó el endpoint de la Escena 2**: pedir el estatus en el mismo chat o abrir la pantalla de estatus — debería mostrar datos reales en vez del mensaje "Próximamente".

**✅ Verificado en vivo** (pasos 1-5, con navegador real, contra los 3 procesos reales corriendo:
API .NET + proxy Azure OpenAI + Vite). El paso 6 depende de que la Escena 2 ya se haya corrido.

---

## Escena 4 — Operaciones (Operations Console)

**Quién actúa:** el presentador, como asociado de tienda, en `http://localhost:5174`.

**Qué hacer:**
1. Clic en **"Cargar casos de ejemplo"** (o localizar el caso real de Sofía si la Escena 3 ya corrió en la misma sesión de navegador — hoy son procesos independientes, cada uno con su propio estado).
2. Seleccionar el caso, clic en **"Recibir artículo"**, luego **"Aprobar inspección"**.
3. Cambiar a la Vista de Gerente: mostrar Store Readiness, Command Center, Decision Room (datos de muestra, no requieren backend).

**✅ Vista de Asociado verificada** con llamadas reales contra la API. Vista de Gerente usa datos
estáticos de `historia.md` §6.2 — no requiere verificación adicional, no depende de ningún backend.

---

## Pendientes antes de la presentación real

- [x] Compartir el sitio SharePoint y la carpeta confidencial con `jaime.sanchez@arterion.ai` —
      hecho; confirmado en vivo que ya encuentra el postmortem confidencial y explica por qué
      antes no podía.
- [ ] Re-correr la pregunta #2 de la Escena 1 (cuándo/por qué cambió la decisión de SAP) ahora que
      los permisos ya están correctos — sigue pendiente de retest.
- [ ] Redactar y ensayar el prompt exacto de la Escena 2 (Copilot/VS Code) — hoy solo hay un borrador.
- [ ] Decidir si Mi Palacio y Operations Console comparten el mismo caso en vivo (hoy son procesos
      independientes con estado separado) o si se acepta mostrar casos distintos en cada uno.
- [ ] Decidir explícitamente si la Escena 1 se presenta como "dos actos" (primero sin acceso a la
      carpeta confidencial, luego con acceso) — recomendado, es más fuerte que preguntar una sola
      vez ya con acceso completo desde el principio.
