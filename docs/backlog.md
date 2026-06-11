# NEKO STORE — Backlog Priorizado

## Estado operativo - 2026-06-11

Ver tambien `docs/handoff-2026-06-11.md` para el traspaso completo.

Regla vigente:
- NEKO no es un POC.
- No existe categoria `demo`.
- Los productos iniciales/staging se tratan como productos reales en UI.
- No mostrar badges, textos ni labels `DEMO` en catalogo, carrito, checkout o admin.
- IDs `demo-*` solo pueden existir como identificadores tecnicos para limpieza pre-produccion.

Actualizado tras revisar CodeGraph y BMAD:
- Foundation, data layer, componentes principales, admin parcial, PWA base, social mock, branding base y backend Fastify/PostgreSQL ya existen en el workspace.
- El trabajo activo se mueve de "migracion React" a "operacion confiable": auth OTP, ordenes reales, reservas de stock, alertas admin, responsive/a11y y QA gates.
- Hay muchas tareas historicas que siguen en tablas como backlog original; para planificar, usar primero la lista "TODO activo" de abajo.

## TODO activo inmediato

| ID | Estado | Prioridad | Tarea | Nota |
|----|--------|-----------|-------|------|
| NEKO-113 | Hecho | P2 | Actualizar configuracion de CodeGraph para React + TS | `.codegraph/config.json` ahora incluye TS/TSX y backend JS |
| QA-001 | Pendiente | P0 | Correr `npx biome check src/` | Gate requerido antes de cerrar bloque |
| QA-002 | Pendiente | P0 | Correr `npm run typecheck` | TypeScript strict sin errores |
| QA-003 | Pendiente | P0 | Correr `npm run test:run` | Validar stores, utils y componentes |
| QA-004 | Pendiente | P0 | Correr `npm run build` | Confirmar build Vite/PWA |
| ARCH-001 | Activo | P0 | Eliminar hardcoded operativo | Productos, clientes, ordenes, rewards, CMS y config deben venir de API/DB |
| ADMIN-001 | Activo | P0 | Dashboard admin estilo WordPress | Menu lateral, home operativo, productos, pedidos, clientes, contenido y ajustes claros |
| ADMIN-002 | Activo | P0 | 2FA obligatorio para admin | Setup actual no basta: debe bloquear acceso admin cuando aplique |
| ADMIN-003 | Activo | P0 | Gestor productos/stock completo | Crear/editar productos, imagenes, tallas, costo, stock, umbral, estado |
| NEKO-102 | Activo | P0 | Registro minimo con OTP WhatsApp | Cerrar flujo cliente passwordless |
| NEKO-103 | Activo | P0 | Login por codigo enviado a WhatsApp | No crear sesion sin OTP valido |
| CLIENT-001 | Activo | P0 | Dashboard cliente desde API | Perfil, ordenes, puntos y rewards sin demo/cache local operativo |
| NEKO-107 | Activo | P0 | Reserva de stock temporal | TTL, bloqueo y liberacion |
| NEKO-108 | Activo | P0 | Confirmacion manual SINPE | Admin confirma/rechaza comprobante |
| NEKO-110 | Activo | P0 | Fallback sin WhatsApp Business | Alertas internas obligatorias |
| NEKO-098 | Activo | P0 | Auditoria responsive 320px-1536px | Navbar, grids, modales, admin |
| DATA-001 | Pendiente | P0 | Purga pre-produccion de datos demo | Antes del servicio final: borrar productos `demo-*`, cuenta Valentina, ordenes demo, notificaciones demo y seeds de prueba |
| AUTH-004 | Pendiente | P0 | Recuperar login admin real | Unica cuenta admin debe entrar; agregar ojito password; password editable con 2FA |
| OTP-001 | Pendiente | P0 | OTP WhatsApp real/fallback | El codigo no esta llegando; revisar envio, alerta admin y UX |
| CHECKOUT-004 | Pendiente | P0 | Comprobante SINPE obligatorio | Numero completo y/o captura antes de crear flujo operativo; WhatsApp como alternativa |
| CHECKOUT-005 | Pendiente | P0 | Direccion opcional | Direccion puede completarse despues o en dashboard cliente |
| CART-DB-001 | Pendiente | P0 | Carrito local + DB | localStorage como cache; si hay sesion sincronizar contra backend |
| MONEY-001 | Pendiente | P0 | Colones en todo el sitio | Quitar simbolos `$` restantes, incluido carrito |
| CMS-ABOUT-001 | Activo | P1 | Nosotros editable desde CMS | Imagen `nosotros.png` y copy deben venir de DB/admin |
| CMS-CONTACT-001 | Activo | P1 | Fondo contacto opcional | Parallax/fondo forms activable, default `/brand/contacto.png`, upload custom |
| HOME-FEATURED-001 | Hecho | P1 | Destacados home estilo WooCommerce | Admin permite marcar/ordenar; home muestra hasta 12 productos destacados centrados |
| UI-IMG-001 | Activo | P1 | Imagenes ancladas arriba | `object-position: top center`; despues agregar control admin |
| UI-SKELETON-001 | Pendiente | P1 | Skeletons de productos | Evitar layout roto mientras carga data/imagenes |
| UI-PLACEHOLDER-001 | Pendiente | P1 | Placeholder con logo | Productos sin imagen muestran gato + texto NEKO |
| PWA-UX-001 | Pendiente | P1 | Padding y theme PWA | Padding lateral en home; logo cambia dark/light |
| BRAND-001 | Pendiente | P1 | Favicon gato | Favicon debe ser el isotipo gato, no wordmark |
| SHIPPING-002 | Pendiente | P1 | Redondeo envios | Redondear hacia arriba a 500/1000 cerrados; ejemplo 2640 -> 3000 |

## Handoff actual - 2026-06-10

Pausar revision de paginas/rutas hasta terminar P0 operativos. Orden correcto:

1. `ADMIN-002`: cerrar 2FA obligatorio y login admin.
2. `ADMIN-001` / `ADMIN-003`: cerrar admin WordPress-style, productos, pedidos y stock.
3. `CLIENT-001`, `NEKO-102`, `NEKO-103`: cliente API-only y OTP sin bypass local.
4. `NEKO-107`, `NEKO-108`, `NEKO-110`: checkout real, reservas, confirmacion SINPE y fallback interno.
5. Despues revisar paginas/rutas/CTAs y preguntar por features grandes antes de construirlas.

Nota de datos iniciales/staging:
- `backend/seeds/008_seed_demo_min_catalog.sql` garantiza 3 productos por categoria real para QA local/staging.
- Los IDs `demo-*` son tecnicos para limpieza; no deben exponerse como categoria, badge o copy visible.
- Antes de produccion final, completar `DATA-001` y remover/neutralizar seeds de staging junto con cuentas, ordenes y notificaciones de prueba.

Estado tecnico mas reciente:
- TypeScript pasa despues de cambios de admin/auth.
- Sintaxis backend pasa para `auth.js`, `admin/2fa.js`, `customerAuth.js`.
- Biome pendiente por formato en `AdminHome.tsx`, `OrdersManager.tsx`, `AdminPage.tsx`, `cmsApi.ts`.

## Formato
- **ID:** `NEKO-XXX`
- **Prioridad:** P0 (bloqueante) / P1 (crítica) / P2 (importante) / P3 (deseable)
- **Fase:** 0–6
- **Esfuerzo:** S (≤4h) / M (1-2d) / L (3-5d) / XL (1-2s)
- **Dependencias:** IDs de items que deben completarse primero

---

### Fase 0 — Foundation

| ID | Título | Prioridad | Esfuerzo | Dependencias | Descripción |
|----|--------|-----------|----------|--------------|-------------|
| NEKO-001 | Scaffold Vite + React 19 + TypeScript | P0 | S | — | Inicializar proyecto con `npm create vite@latest`, configurar tsconfig estricto |
| NEKO-002 | Configurar TailwindCSS v4 | P0 | S | NEKO-001 | Instalar TailwindCSS v4, postcss, configurar `@tailwind` directives en CSS |
| NEKO-003 | Configurar React Router v7 | P0 | S | NEKO-001 | Instalar react-router, crear router con rutas base (/, /cuenta, /contacto, /carrito, 404) |
| NEKO-004 | Configurar ESLint + Prettier | P1 | S | NEKO-001 | Reglas para React + TS, prettier con single quotes, trailing commas |
| NEKO-005 | Configurar Vitest | P1 | S | NEKO-001 | Setup con jsdom, testing-library, config en vite.config.ts |
| NEKO-006 | Configurar Playwright | P1 | M | NEKO-001 | Instalar, configurar browsers (chromium, firefox, webkit), crear spec básico |
| NEKO-007 | Crear estructura de carpetas src/ | P0 | S | NEKO-001 | components/, stores/, hooks/, types/, utils/, pages/, assets/, styles/ |
| NEKO-008 | Crear layout base (Navbar + Footer) | P0 | M | NEKO-003 | Layout persistente con Outlet, Navbar responsiva, Footer con links |
| NEKO-009 | Implementar ThemeToggle con CSS variables | P0 | M | NEKO-002 | Variables CSS para dark/light, toggle en Navbar, persistir preferencia |
| NEKO-010 | Configurar vite-plugin-pwa | P1 | S | NEKO-001 | Manifest, icons, workbox config básica |
| NEKO-011 | Generar iconos y splash para PWA | P1 | S | NEKO-010 | Iconos en sizes 48-512px, generar con herramienta o manual |
| NEKO-012 | Configurar fuentes: Megasord, Cormorant, Space Mono | P1 | S | NEKO-002 | Google Fonts + font-face para Megasord (local), definir en theme |
| NEKO-013 | Configurar alias paths (@components, @stores, etc.) | P1 | S | NEKO-001 | Alias en vite.config.ts y tsconfig.json |

### Fase 1 — Data Layer

| ID | Título | Prioridad | Esfuerzo | Dependencias | Descripción |
|----|--------|-----------|----------|--------------|-------------|
| NEKO-014 | Definir interfaces TypeScript globales | P0 | M | NEKO-007 | Product, CartItem, Customer, Order, LoyaltyTier, Reward, Notification, Address interfaces |
| NEKO-015 | Migrar PRODUCTS hardcoded a tipo seguro | P0 | M | NEKO-014 | Array tipado con todos los productos legacy, validar campos |
| NEKO-016 | Implementar useConfigStore | P0 | S | NEKO-014 | Store para config de tienda: moneda, impuesto, gastos de envío, con persist |
| NEKO-017 | Implementar useCartStore | P0 | L | NEKO-014 | addItem, removeItem, updateQty, clearCart, applyShipping, calcular subtotal/tax/total |
| NEKO-018 | Implementar useAuthStore | P1 | M | NEKO-014 | login, logout, updateProfile, session persist, tipo Customer |
| NEKO-019 | Implementar useLoyaltyStore | P1 | L | NEKO-014 | addPoints, redeemReward, calcularTier, historial, expiration logic |
| NEKO-020 | Implementar useNotificationStore | P1 | S | NEKO-014 | addNotif, dismissNotif, clearAll, auto-dismiss timed |
| NEKO-021 | Implementar useUIStore | P1 | S | NEKO-014 | toggleCart, toggleModal, setActiveModal, setFilter, activeCategory |
| NEKO-022 | Migración de localStorage schema legacy | P1 | M | NEKO-017 | Leer datos antiguos, transformar al nuevo schema, guardar, respaldar legacy |
| NEKO-023 | Tests unitarios de useCartStore | P0 | M | NEKO-017 | 100% de acciones cubiertas, edge cases (qty NaN, stock 0, max 99) |
| NEKO-024 | Tests unitarios de useLoyaltyStore | P1 | M | NEKO-019 | Cálculo de tiers, puntos, expiración, redención |
| NEKO-025 | Tests unitarios de stores restantes | P2 | S | NEKO-016, 018, 020, 021 | Tests básicos de cada store |

### Fase 2 — Component Migration

| ID | Título | Prioridad | Esfuerzo | Dependencias | Descripción |
|----|--------|-----------|----------|--------------|-------------|
| NEKO-026 | Implementar ProductCard | P0 | M | NEKO-015, NEKO-021 | Card con imagen, nombre, precio, badge, puntos, botón add-to-cart |
| NEKO-027 | Implementar ProductGrid | P0 | M | NEKO-026 | Grid responsivo (1-4 cols), consume productos del store |
| NEKO-028 | Implementar FilterBar | P0 | M | NEKO-021 | Filtros por categoría, precio (rango), talla, búsqueda por nombre |
| NEKO-029 | Implementar ProductModal | P0 | M | NEKO-026 | Modal con detalle completo, size picker, badge, descripción, add-to-cart |
| NEKO-030 | Implementar CartSidebar | P0 | M | NEKO-017, NEKO-021 | Slideover lateral con lista de items, total, checkout button |
| NEKO-031 | Implementar CartItem | P0 | S | NEKO-017 | Item individual con thumbnail, nombre, talla, qty, precio, remove |
| NEKO-032 | Implementar CartFooter | P0 | S | NEKO-017 | Subtotal, tax, shipping, total, CTA |
| NEKO-033 | Implementar ShippingOptions | P1 | S | NEKO-017 | Selector de método de envío (CR: Correos, delivery propio) |
| NEKO-034 | Implementar CheckoutModal | P0 | L | NEKO-030, NEKO-018 | Modal con formulario de envío, resumen, método de pago |
| NEKO-035 | Implementar CheckoutForm | P0 | M | NEKO-034 | Formulario con validación: nombre, teléfono (+506), dirección, provincia, notas |
| NEKO-036 | Implementar OrderSummary | P0 | S | NEKO-034 | Resumen de orden previo a confirmar |
| NEKO-037 | Implementar AccountLogin | P1 | M | NEKO-018 | Login con número de WhatsApp, input +506, validación, mock OTP |
| NEKO-038 | Implementar AccountDashboard | P1 | M | NEKO-037 | Estadísticas, últimas órdenes, atajos |
| NEKO-039 | Implementar StatsGrid | P1 | S | NEKO-038 | Grid de stats: órdenes totales, gastado, puntos, member since |
| NEKO-040 | Implementar OrderHistory | P1 | M | NEKO-018 | Lista de órdenes previas con estado, total, fecha |
| NEKO-041 | Implementar AccountTabs | P1 | S | NEKO-038 | Tabs: Dashboard, Órdenes, Lealtad, Configuración |
| NEKO-042 | Implementar LoyaltyCard | P1 | M | NEKO-019 | Card principal con tier, puntos, progreso, next tier |
| NEKO-043 | Implementar TierGrid | P1 | S | NEKO-019 | Visualización de todos los tiers con beneficios |
| NEKO-044 | Implementar RewardsGrid + RewardCard | P1 | M | NEKO-019 | Catálogo de recompensas disponibles para canjear |
| NEKO-045 | Implementar ProgressBar | P1 | S | NEKO-019 | Barra de progreso para next tier con animación |
| NEKO-046 | Implementar ContactCard | P2 | S | — | Card con info de contacto (WhatsApp, email, ubicación) |
| NEKO-047 | Implementar ContactForm persistente | P1 | M | — | Formulario de contacto guardado en DB y visible en admin |
| NEKO-048 | Implementar ContactInfoStrip | P2 | S | — | Tira de iconos de contacto en homepage |
| NEKO-049 | Implementar Toast | P0 | S | NEKO-020 | Componente toast con tipos success/error/info/warning, auto-dismiss |
| NEKO-050 | Implementar Modal genérico | P0 | M | — | Modal reutilizable con backdrop, close, animación, foco trampa |
| NEKO-051 | Implementar Button con variantes | P0 | S | — | Variantes: primary, secondary, outline, ghost, sizes, loading state |
| NEKO-052 | Implementar Toggle | P1 | S | — | Toggle switch para settings |
| NEKO-053 | Implementar Badge | P1 | S | — | Badge para productos (Nuevo, Oferta, Exclusivo) y alertas |
| NEKO-054 | Implementar SizePicker | P0 | S | — | Selector de tallas (XS-3XL) con disponibilidad |
| NEKO-055 | Implementar NotificationsPanel | P1 | S | NEKO-020 | Panel de notificaciones con lista, dismiss, empty state |
| NEKO-056 | Implementar DropAlert | P1 | S | NEKO-020 | Alerta dropdown en navbar para notificaciones |
| NEKO-057 | Implementar páginas con lazy loading | P1 | M | NEKO-003 | React.lazy + Suspense para cada página |
| NEKO-058 | Implementar estados vacíos para todas las listas | P1 | M | Múltiples | Empty states para carrito, órdenes, recompensas, notificaciones |
| NEKO-059 | Tests de componentes principales | P1 | L | NEKO-026-057 | Render tests para cada componente, interaction tests para críticos |

### Fase 3 — PWA & Offline

| ID | Título | Prioridad | Esfuerzo | Dependencias | Descripción |
|----|--------|-----------|----------|--------------|-------------|
| NEKO-060 | Configurar service worker con estrategias de cache | P1 | M | NEKO-010 | Cache-first para CSS/JS/imágenes, network-first para datos |
| NEKO-061 | Implementar offline catalog page | P2 | M | NEKO-060 | Página que muestra productos cacheados cuando offline |
| NEKO-062 | Implementar install prompt personalizado | P2 | M | NEKO-010 | UI custom para "Instalar NEKO" con criterios beforeinstallprompt |
| NEKO-063 | Implementar update notification flow | P2 | S | NEKO-060 | Detectar SW update, mostrar notificación, recargar |
| NEKO-064 | Auditoría Lighthouse PWA | P1 | S | NEKO-060-063 | Score ≥ 90 en categoría PWA |

### Fase 4 — WhatsApp Integration

| ID | Título | Prioridad | Esfuerzo | Dependencias | Descripción |
|----|--------|-----------|----------|--------------|-------------|
| NEKO-065 | Crear utilidad WhatsAppEncoder | P0 | S | NEKO-014 | encodeOrderToMessage(cart, customer) → string |
| NEKO-066 | Implementar generateDeepLink | P0 | S | NEKO-065 | wa.me link con mensaje codificado y número +506 |
| NEKO-067 | Plantilla "new order" para WhatsApp | P1 | M | NEKO-065 | Template: items, cantidades, tallas, subtotal, envío, total |
| NEKO-068 | Botón "Pedir por WhatsApp" en checkout | P0 | S | NEKO-066, NEKO-067 | Botón que abre deep link con orden resumida |
| NEKO-069 | Formateo y validación de número +506 | P0 | S | — | Input con prefijo +506, validación 8 dígitos, formato legible |
| NEKO-070 | Fallback email si WhatsApp no disponible | P1 | M | NEKO-068 | mailto: como respaldo con misma información |
| NEKO-071 | Template "order confirmation" | P2 | S | NEKO-067 | Mensaje de confirmación para copiar y enviar al cliente |
| NEKO-072 | Documentación integración WhatsApp Business API | P3 | S | — | Notas técnicas para migración futura |

### Fase 5 — Payment Gateway (Futuro)

| ID | Título | Prioridad | Esfuerzo | Dependencias | Descripción |
|----|--------|-----------|----------|--------------|-------------|
| NEKO-073 | Investigar integración SINPE Móvil | P3 | S | — | Documentar requisitos de Banco Central, API, costos |
| NEKO-074 | Investigar integración PayPal | P3 | S | — | Documentar SDK, costos, geografía |
| NEKO-075 | Diseñar flujo de pago unificado | P3 | M | NEKO-073, NEKO-074 | Diagrama de flujo con todos los métodos |
| NEKO-076 | Componente PaymentMethodSelector | P2 | M | NEKO-075 | Tabs para seleccionar método de pago |

### Fase 6 — Admin Dashboard (Futuro)

| ID | Título | Prioridad | Esfuerzo | Dependencias | Descripción |
|----|--------|-----------|----------|--------------|-------------|
| NEKO-077 | Layout admin con sidebar | P2 | M | NEKO-003 | Layout separado para rutas /admin/* |
| NEKO-078 | Autenticación admin con roles | P2 | M | NEKO-018 | Login admin, roles (admin, editor), protección de rutas |
| NEKO-079 | CRUD de productos (inventario) | P2 | XL | NEKO-077 | Lista, crear, editar, eliminar productos con imágenes |
| NEKO-080 | Gestión de pedidos | P2 | L | NEKO-077 | Lista de pedidos, detalle, cambio de estado (confirmado, enviado, entregado) |
| NEKO-081 | Dashboard de analytics | P3 | L | NEKO-077 | Gráficos de ventas semanales/mensuales, top productos |

### Testing & QA Transversal

| ID | Título | Prioridad | Esfuerzo | Dependencias | Descripción |
|----|--------|-----------|----------|--------------|-------------|
| NEKO-082 | Auditoría de accesibilidad (axe-core) | P1 | M | NEKO-026-057 | WCAG 2.1 AA, reporte de issues |
| NEKO-083 | Flujo E2E: browse → add to cart → checkout | P0 | M | NEKO-059, NEKO-068 | Playwright: navegación completa del usuario |
| NEKO-084 | Flujo E2E: login → loyalty dashboard | P1 | M | NEKO-059 | Playwright: login, ver puntos, canjear recompensa |
| NEKO-085 | Flujo E2E: WhatsApp order flow | P1 | M | NEKO-068, NEKO-083 | Verificar deep link generado correctamente |
| NEKO-086 | Pruebas visuales de regresión (Playwright) | P2 | L | NEKO-082 | Screenshot comparisons en componentes clave |
| NEKO-087 | Performance budget audit | P1 | S | NEKO-082 | Lighthouse: FCP < 1.5s, LCP < 2.5s, TBT < 200ms, CLS < 0.1 |
| NEKO-088 | Cross-browser testing matrix | P2 | M | NEKO-083-085 | Chromium, Firefox, Safari (WebKit), Edge, mobile browsers |
| NEKO-089 | Pruebas de red lenta y offline | P2 | M | NEKO-060, NEKO-083 | Simular 3G, offline mode, verificar comportamiento |
| NEKO-090 | Documentar bug reporting template | P3 | S | — | Template markdown para issues de GitHub |

### i18n & UX

| ID | Título | Prioridad | Esfuerzo | Dependencias | Descripción |
|----|--------|-----------|----------|--------------|-------------|
| NEKO-091 | Implementar sistema de i18n para español CR | P2 | M | NEKO-014 | Hook useTranslation, archivo ES.json con modismos ticos |
| NEKO-092 | Animaciones de transición entre rutas | P2 | M | NEKO-003 | Framer Motion o CSS transitions para page transitions |
| NEKO-093 | Skeleton screens para carga de datos | P2 | M | NEKO-026-027 | Skeleton para ProductGrid, Cart, Dashboard |
| NEKO-094 | Implementar modo reducido de movimiento | P2 | S | NEKO-009 | Respetar prefers-reduced-motion, desactivar animaciones |
| NEKO-095 | Meta tags SEO y Open Graph | P2 | S | NEKO-003 | Meta tags por página, OG image, description |
| NEKO-096 | Sitemap.xml y robots.txt | P3 | S | NEKO-003 | Generar sitemap dinámico o estático |
| NEKO-097 | Service Worker: push notifications (future) | P3 | M | NEKO-060 | Integración futura con Firebase Cloud Messaging |

### Fase 7 — Responsive Hardening + Operacion de Pedidos

| ID | Título | Prioridad | Esfuerzo | Dependencias | Descripción |
|----|--------|-----------|----------|--------------|-------------|
| NEKO-098 | Auditoría responsive end-to-end (320px–1536px) | P0 | M | NEKO-026-058 | Cerrar pendientes responsive: navbar, grids, modales, dashboard, tabs y formularios en mobile/tablet/desktop |
| NEKO-099 | Corregir margen residual del Drop Counter en navbar | P0 | S | NEKO-056, NEKO-098 | Al ocultar DropAlert/DropCounter no debe quedar espacio vacío ni salto visual en el menú |
| NEKO-100 | Gestión de Drop Counter desde dashboard | P1 | M | NEKO-099, NEKO-077 | Permitir activar/desactivar y configurar contenido de drop alert desde panel admin |
| NEKO-101 | Sección de Promociones y Drops por tiempo limitado | P1 | L | NEKO-027, NEKO-098 | Nueva sección con campañas temporales, countdown y recomendaciones por usuario |
| NEKO-102 | Registro mínimo con verificación por WhatsApp OTP | P0 | M | NEKO-037, NEKO-069 | Registro requiere solo nombre, apellidos, edad y teléfono; OTP por WhatsApp para validar identidad |
| NEKO-103 | Login por número + código enviado por WhatsApp | P0 | M | NEKO-102 | Flujo de sesión: ingresar número, recibir código, verificar código, crear sesión; sin acceso por número solo |
| NEKO-104 | Perfil opcional extendido en dashboard | P1 | M | NEKO-038, NEKO-103 | Campos opcionales: correo, foto, dirección estilo Correos de Costa Rica, cédula y activación 2FA |
| NEKO-105 | Centro de alertas para cliente y admin | P1 | M | NEKO-055, NEKO-077 | Vista de alertas para ambos roles, detalle por evento, borrado manual, retención automática de 7 días |
| NEKO-106 | Alertas con deep-link a contexto de negocio | P1 | S | NEKO-105 | Alertas de compra deben abrir dashboard en la sección de órdenes o módulo relacionado |
| NEKO-107 | Reserva de stock “en el aire” durante compra | P0 | L | NEKO-080, NEKO-103 | Al iniciar pedido se reserva stock temporal para evitar sobreventa mientras se confirma pago |
| NEKO-108 | Confirmación manual de venta con comprobante SINPE | P0 | M | NEKO-107 | Admin revisa comprobante recibido y marca orden como completada para descontar stock definitivamente |
| NEKO-109 | Automatización opcional con WhatsApp Business | P2 | L | NEKO-108 | Si llega comprobante con formato/código esperado, generar alerta automática al admin (WhatsApp y dashboard) |
| NEKO-110 | Flujo de seguimiento sin WhatsApp Business | P0 | M | NEKO-108 | Fallback obligatorio: notificación interna en app al admin para gestionar comprobantes sin depender de API externa |
| NEKO-111 | Integrar logos oficiales (texto + gato) con fondo transparente | P1 | S | NEKO-009 | Usar `nekoStoreText1.png` y `nekoStore4.png`, generar assets transparentes y aplicarlos en navbar/footer |
| NEKO-112 | Normalizar títulos UI sin tildes para fuente display | P1 | S | NEKO-012 | Reemplazar textos de títulos con acentos por variantes sin tilde en headings renderizados con fuente que no soporta tildes |
| NEKO-113 | Actualizar configuracion de codegraph para React + TS | P2 | S | NEKO-001 | Cambiar include patterns de `.codegraph/config.json` a `src/**/*.ts`, `src/**/*.tsx` y archivos de configuracion relevantes |

---

## Totales por Prioridad
| Prioridad | Count |
|-----------|-------|
| P0 | 25 |
| P1 | 41 |
| P2 | 32 |
| P3 | 15 |
| **Total** | **113** |
