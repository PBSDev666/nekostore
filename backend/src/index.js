import Fastify from 'fastify'
import 'dotenv/config'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import fastifyStatic from '@fastify/static'
import path from 'path'
import { fileURLToPath } from 'url'

import authRoutes from './routes/auth.js'
import productsRoutes from './routes/products.js'
import customersRoutes from './routes/customers.js'
import contactRoutes from './routes/contact.js'
import ordersRoutes from './routes/orders.js'
import loyaltyRoutes from './routes/loyalty.js'
import adminProductsRoutes from './routes/admin/products.js'
import adminOrdersRoutes from './routes/admin/orders.js'
import adminPostsRoutes from './routes/admin/posts.js'
import adminCampaignsRoutes from './routes/admin/campaigns.js'
import adminMetricsRoutes from './routes/admin/metrics.js'
import adminBrandingRoutes from './routes/admin/branding.js'
import adminWaConfigRoutes from './routes/admin/waConfig.js'
import adminNotificationsRoutes from './routes/admin/notifications.js'
import adminContactMessagesRoutes from './routes/admin/contactMessages.js'
import adminSiteContentRoutes from './routes/admin/siteContent.js'
import adminCarouselRoutes from './routes/admin/carousel.js'
import adminUploadRoutes from './routes/admin/upload.js'
import admin2faRoutes from './routes/admin/2fa.js'
import customerAuthRoutes from './routes/customerAuth.js'
import notificationsRoutes from './routes/notifications.js'
import pushRoutes from './routes/push.js'
import pool from './db.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = Fastify({ logger: true })

await app.register(cors, { origin: true })
await app.register(jwt, { secret: process.env.JWT_SECRET || 'neko-dev-secret-change-in-production' })

app.register(fastifyStatic, {
  root: path.join(__dirname, '..', 'uploads'),
  prefix: '/uploads/',
  decorateReply: false,
})

app.decorate('authenticate', async function (request, reply) {
  try {
    await request.jwtVerify()
  } catch {
    reply.code(401).send({ error: 'No autorizado' })
  }
})

app.decorate('requireAdmin', async function (request, reply) {
  try {
    await request.jwtVerify()
    if (request.user.role !== 'admin') {
      return reply.code(403).send({ error: 'Se requiere rol admin' })
    }
    if (request.user.id !== 'admin_neko') {
      return reply.code(403).send({ error: 'Admin no autorizado' })
    }

    const isTwoFactorRoute = request.url.startsWith('/api/admin/2fa/')
    const twoFactor = await pool.query('SELECT enabled FROM admin_2fa WHERE admin_id = $1', [
      request.user.id,
    ])
    const twoFactorEnabled = twoFactor.rows[0]?.enabled === true

    if (!twoFactorEnabled) return

    if (request.user.twoFactorVerified !== true) {
      if (isTwoFactorRoute) return
      return reply.code(403).send({ error: 'Completa 2FA para continuar' })
    }
  } catch {
    return reply.code(401).send({ error: 'No autorizado' })
  }
})

await app.register(authRoutes, { prefix: '/api/auth' })
await app.register(productsRoutes, { prefix: '/api/products' })
await app.register(customersRoutes, { prefix: '/api/customers' })
await app.register(contactRoutes, { prefix: '/api/contact' })
await app.register(ordersRoutes, { prefix: '/api/orders' })
await app.register(loyaltyRoutes, { prefix: '/api/loyalty' })
await app.register(adminProductsRoutes, { prefix: '/api/admin/products' })
await app.register(adminOrdersRoutes, { prefix: '/api/admin/orders' })
await app.register(adminPostsRoutes, { prefix: '/api/admin/posts' })
await app.register(adminCampaignsRoutes, { prefix: '/api/admin/campaigns' })
await app.register(adminMetricsRoutes, { prefix: '/api/admin/metrics' })
await app.register(adminBrandingRoutes, { prefix: '/api/admin/branding' })
await app.register(adminWaConfigRoutes, { prefix: '/api/admin/wa-config' })
await app.register(adminNotificationsRoutes, { prefix: '/api/admin/notifications' })
await app.register(adminContactMessagesRoutes, { prefix: '/api/admin/contact-messages' })
await app.register(adminSiteContentRoutes, { prefix: '/api/admin/site-content' })
await app.register(adminCarouselRoutes, { prefix: '/api/admin/carousel' })
await app.register(adminUploadRoutes, { prefix: '/api/admin/upload' })
await app.register(admin2faRoutes, { prefix: '/api/admin/2fa' })
await app.register(customerAuthRoutes, { prefix: '/api/customer-auth' })
await app.register(notificationsRoutes, { prefix: '/api/notifications' })
await app.register(pushRoutes, { prefix: '/api/push' })

const PORT = Number(process.env.PORT) || 4000
const HOST = process.env.HOST || '0.0.0.0'

try {
  await app.listen({ port: PORT, host: HOST })
  console.log(`🚀 NEKO API corriendo en http://${HOST}:${PORT}`)
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
