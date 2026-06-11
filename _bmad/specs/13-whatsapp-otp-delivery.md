# Spec 13 - Envio OTP por WhatsApp

## Objetivo

Permitir que el OTP de cliente se envie por WhatsApp cuando el backend tenga credenciales de WhatsApp Cloud API configuradas.

## Alcance

- Mantener la generacion y validacion OTP existentes.
- Agregar envio automatico por WhatsApp Cloud API con variables de entorno.
- Mantener fallback manual via notificacion admin si no hay credenciales o si el envio falla.
- Evitar devolver el codigo OTP al frontend.
- Ajustar el mensaje de UI para no afirmar que el WhatsApp llego si quedo en fallback manual.

## Variables

- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_GRAPH_VERSION` opcional, default `v20.0`

## Criterios de aceptacion

- `/api/customer-auth/send-code` intenta enviar el OTP por WhatsApp si hay credenciales.
- Sin credenciales, la respuesta indica fallback manual.
- El frontend muestra el mensaje del backend.
- No se expone el OTP en respuesta HTTP.
