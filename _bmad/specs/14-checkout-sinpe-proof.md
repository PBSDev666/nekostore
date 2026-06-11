# Spec 14 - Comprobante SINPE obligatorio

## Objetivo

Exigir comprobante/captura SINPE para crear reservas operativas en la base de datos, dejando WhatsApp como alternativa cuando el cliente no tenga comprobante listo.

## Alcance

- Agregar upload autenticado de comprobante de pago.
- Guardar URL/nombre del comprobante en la orden.
- Bloquear creacion de orden API si falta comprobante.
- Mantener direccion opcional.
- Abrir WhatsApp con resumen del pedido si falta comprobante, sin descontar stock ni crear orden.

## Criterios de aceptacion

- Checkout muestra input de archivo para comprobante SINPE.
- El backend rechaza ordenes sin `payment_proof_url`.
- Si falta archivo, frontend abre WhatsApp con resumen y no llama `submitOrder`.
- La orden guarda `payment_proof_url` y `payment_proof_name`.
