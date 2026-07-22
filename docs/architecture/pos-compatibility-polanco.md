# Compatibilidad de POS — Piloto Polanco

El piloto de devolución digital arranca en la tienda Polanco, pero el QR de 72 horas
(`QrCodeService`) depende de que el lector de POS en tienda soporte el nuevo formato.

## Estado conocido
- Polanco: lector de QR compatible, piloto habilitado.
- 4 tiendas adicionales (fuera del alcance del piloto): el POS actual **no** tiene habilitado
  el lector del nuevo formato de QR. Ver correo de Gabriela León (Operaciones de Tienda).

## Implicación para el piloto
El alcance inicial del piloto se limita a Polanco precisamente por esta restricción — no es
una limitación de `Palacio.Returns.Api`, sino de hardware/firmware de POS en tiendas fuera del
piloto. Extender el piloto a esas tiendas requiere actualizar el lector antes de habilitar el
flujo de devolución digital ahí.

## Seguimiento
Gabriela León (Operaciones de Tienda) es responsable de coordinar la actualización de POS en
las tiendas restantes antes de cualquier expansión del piloto.
