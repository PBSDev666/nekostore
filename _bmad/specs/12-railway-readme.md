# Spec 12 - README de despliegue Railway

## Objetivo

Crear un README principal para el repositorio que permita implementar NEKO Store en Railway de forma rápida, clara y reproducible.

## Alcance

- Describir la arquitectura real del repo: frontend Vite en raíz, backend Fastify en `backend/` y PostgreSQL.
- Documentar comandos locales, validación, build y despliegue.
- Enumerar variables de entorno necesarias para Railway.
- Explicar migraciones, seeds y consideraciones de uploads.
- Mantener las reglas críticas del proyecto visibles: NEKO no es POC, datos operativos desde API/PostgreSQL, precios en colones.

## Fuera de alcance

- Cambiar código de aplicación.
- Crear archivos específicos de Railway como `railway.json`.
- Automatizar credenciales, dominios o secretos de producción.

## Criterios de aceptación

- Existe `README.md` en la raíz.
- El README incluye pasos separados para frontend, backend y PostgreSQL en Railway.
- El README incluye comandos de validación usados por el proyecto.
- El README evita instrucciones que dependan de datos hardcodeados como fuente operativa.
