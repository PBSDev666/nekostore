# NEKO Store

NEKO Store es una tienda e-commerce gothic/alt/cyber para Costa Rica. El proyecto no es un POC: el frontend consume datos operativos desde API y PostgreSQL, y Zustand/localStorage se usa solo como cache o estado de UI.

## Stack

- Frontend: React 19, TypeScript 5, Vite 6, TailwindCSS v4, Zustand, PWA.
- Backend: Fastify 5, PostgreSQL, JWT, multipart uploads, Web Push.
- Testing/calidad: Vitest, TypeScript strict, Biome.
- Deploy recomendado: Railway con 3 servicios: frontend, backend y PostgreSQL.

## Estructura

```text
.
+-- src/                    # Frontend React/Vite
|   +-- components/          # UI, layout, catalogo, checkout, admin, loyalty
|   +-- pages/               # Rutas lazy-loaded
|   +-- stores/              # Zustand cache/UI state
|   +-- services/api.ts      # Cliente API; usa VITE_API_URL
|   +-- data/                # Fallbacks no operativos / datos estaticos
|   +-- utils/
+-- backend/
|   +-- src/                 # Fastify API
|   |   +-- routes/           # Rutas publicas, cliente y admin
|   |   +-- services/         # Push y servicios auxiliares
|   |   +-- db.js             # Pool PostgreSQL
|   +-- migrations/          # Migraciones SQL versionadas
|   +-- seeds/               # Seeds iniciales
|   +-- run-migrations.js
|   +-- run-seeds.js
+-- public/                  # Assets publicos frontend
+-- docs/                    # Documentacion funcional y handoffs
+-- _bmad/specs/             # Specs SpecDD/BMAD
```

## Reglas del proyecto

- Todos los textos de UI van en español de Costa Rica.
- Todos los precios van en colones (`₡`), usando la configuracion de moneda del sitio.
- Los datos operativos de produccion deben venir de API/PostgreSQL.
- No usar productos, ordenes, clientes, stock, rewards, carousel, branding o configuracion hardcodeada como fuente de verdad.
- Los datos locales/static solo sirven para empty states, tests, opciones de UI o fallback offline no operativo.
- No mostrar badges o copy `DEMO` en productos; IDs `demo-*` son tecnicos.

## Desarrollo local

Requisitos:

- Node.js 20+ recomendado.
- npm.
- PostgreSQL local o Railway PostgreSQL conectado por variables.

Instalar dependencias:

```bash
npm install
cd backend
npm install
```

Configurar backend:

```bash
cd backend
cp .env.example .env
```

Editar `backend/.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nestDB
DB_USER=postgres
DB_PASSWORD=your_password_here
JWT_SECRET=change_me
PORT=4000
HOST=0.0.0.0

VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
VAPID_SUBJECT=mailto:hola@nekostore.cr
```

Crear esquema y datos iniciales:

```bash
cd backend
npm run migrate
npm run seed
```

Levantar backend:

```bash
cd backend
npm run dev
```

Levantar frontend:

```bash
npm run dev -- --host 0.0.0.0
```

URLs locales por defecto:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000/api`

El frontend usa `VITE_API_URL`. Si no se define, cae a `http://localhost:4000/api`.

## Validacion antes de deploy

Ejecutar desde la raiz:

```bash
npm run typecheck
npx biome check src/
npm test
npm run build
```

Para validar backend:

```bash
cd backend
npm run migrate
npm start
```

## Deploy rapido en Railway

Arquitectura recomendada:

1. Servicio `neko-postgres`: PostgreSQL.
2. Servicio `neko-api`: backend Fastify desde `backend/`.
3. Servicio `neko-web`: frontend Vite desde la raiz.

### 1. Crear proyecto Railway

1. Crear un proyecto nuevo en Railway.
2. Agregar PostgreSQL.
3. Agregar el repositorio `CarlosBlancoB/neko_store`.
4. Crear dos servicios desde el mismo repo: uno para backend y otro para frontend.

### 2. Backend en Railway

Configurar el servicio backend:

```text
Root Directory: backend
Build Command: npm install
Start Command: npm start
Pre-deploy Command: npm run migrate
```

Variables requeridas en `neko-api`:

```env
DB_HOST=${{Postgres.PGHOST}}
DB_PORT=${{Postgres.PGPORT}}
DB_NAME=${{Postgres.PGDATABASE}}
DB_USER=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}
JWT_SECRET=replace_with_a_long_random_secret
HOST=0.0.0.0
PORT=${{PORT}}
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:hola@nekostore.cr
```

Notas:

- Ajustar `Postgres` al nombre real del servicio PostgreSQL si Railway lo crea con otro nombre.
- `DATABASE_URL` puede existir en Railway, pero el backend actual usa `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` y `DB_PASSWORD`.
- `npm run migrate` es idempotente: guarda migraciones aplicadas en `_migrations`.
- `npm run seed` no debe correr en cada deploy. Ejecutarlo manualmente solo para inicializar un ambiente nuevo.

Para correr seeds una vez en Railway:

```bash
railway run npm run seed
```

Ejecutar ese comando dentro del contexto del servicio backend.

### 3. Frontend en Railway

Configurar el servicio frontend:

```text
Root Directory: /
Build Command: npm install && npm run build
Start Command: npm run preview -- --host 0.0.0.0 --port $PORT
```

Variable requerida en `neko-web`:

```env
VITE_API_URL=https://YOUR_BACKEND_DOMAIN.up.railway.app/api
```

Importante: `VITE_API_URL` se inyecta en build time. Si cambia el dominio del backend, volver a desplegar el frontend.

### 4. Dominios y CORS

El backend registra CORS con `origin: true`, por lo que acepta el origen del frontend. Aun asi, para produccion conviene endurecer CORS cuando el dominio final este definido.

Configurar dominios publicos:

- Backend: generar dominio publico para `neko-api`.
- Frontend: generar dominio publico o conectar dominio custom a `neko-web`.
- Actualizar `VITE_API_URL` del frontend con el dominio publico del backend.

### 5. Uploads e imagenes

El backend guarda uploads en filesystem bajo `/uploads` y expone los archivos con prefijo `/uploads/`.

En Railway, el filesystem efimero puede perder archivos al redeploy. Para produccion hay dos opciones:

- Configurar un Railway Volume montado en la ruta `uploads` del servicio backend.
- Migrar uploads a storage externo compatible con el flujo del admin.

Sin storage persistente, imagenes subidas desde admin pueden desaparecer en redeploy.

### 6. Smoke test post-deploy

Backend:

```bash
curl https://YOUR_BACKEND_DOMAIN.up.railway.app/api/products
```

Frontend:

```bash
curl https://YOUR_FRONTEND_DOMAIN.up.railway.app
```

Validar manualmente:

- Home carga productos desde API.
- Login admin responde contra DB.
- Checkout crea orden via API.
- Imagenes publicas cargan desde `/uploads/...` si se usan uploads.
- PWA instala y no rompe navegacion.

## Variables de entorno

### Frontend

| Variable | Requerida | Uso |
| --- | --- | --- |
| `VITE_API_URL` | Si | Base URL de API, debe terminar en `/api`. |

### Backend

| Variable | Requerida | Uso |
| --- | --- | --- |
| `DB_HOST` | Si | Host PostgreSQL. |
| `DB_PORT` | Si | Puerto PostgreSQL. |
| `DB_NAME` | Si | Nombre de base de datos. |
| `DB_USER` | Si | Usuario PostgreSQL. |
| `DB_PASSWORD` | Si | Password PostgreSQL. |
| `JWT_SECRET` | Si | Firma de tokens JWT. Usar secreto largo. |
| `HOST` | Recomendado | `0.0.0.0` en Railway. |
| `PORT` | Si | Railway lo asigna automaticamente. |
| `VAPID_PUBLIC_KEY` | Opcional | Web Push. |
| `VAPID_PRIVATE_KEY` | Opcional | Web Push. |
| `VAPID_SUBJECT` | Opcional | Contacto Web Push. |

Generar VAPID keys:

```bash
cd backend
npx web-push generate-vapid-keys
```

## Comandos utiles

Raiz/frontend:

```bash
npm run dev
npm run build
npm run preview
npm run typecheck
npx biome check src/
npm test
```

Backend:

```bash
cd backend
npm run dev
npm run migrate
npm run seed
npm start
```

## Pendientes tecnicos conocidos

- Admin login/OTP/2FA requiere revision funcional.
- OTP WhatsApp pendiente de integracion/envio real.
- Checkout debe exigir comprobante SINPE/captura o derivar a WhatsApp si falta.
- Carrito debe sincronizar localStorage con DB cuando hay sesion.
- Subidas de imagenes necesitan persistencia para produccion en Railway.
- Revisar todos los textos/precios restantes para garantizar colones (`₡`) y cero referencias visibles a demo.
