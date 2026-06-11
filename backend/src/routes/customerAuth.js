import bcrypt from 'bcrypt'
import pool from '../db.js'
import { sendPushToRole } from '../services/push.js'

function normalizeCRPhone(phone) {
  const clean = phone.replace(/\D/g, '')
  return clean.length === 8 ? `506${clean}` : clean
}

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

async function sendWhatsAppText(phone, message) {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
  const graphVersion = process.env.WHATSAPP_GRAPH_VERSION || 'v20.0'

  if (!accessToken || !phoneNumberId) {
    return { sent: false, reason: 'missing_config' }
  }

  const response = await fetch(
    `https://graph.facebook.com/${graphVersion}/${phoneNumberId}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: normalizeCRPhone(phone),
        type: 'text',
        text: {
          preview_url: false,
          body: message,
        },
      }),
    },
  )

  if (!response.ok) {
    const error = await response.text().catch(() => response.statusText)
    return { sent: false, reason: error }
  }

  return { sent: true }
}

export default async function customerAuthRoutes(app) {
  app.post('/send-code', async (request, reply) => {
    const { phone } = request.body
    if (!phone || phone.length < 8) {
      return reply.code(400).send({ error: 'Tel\u00E9fono inv\u00E1lido' })
    }

    const clean = phone.replace(/\D/g, '')
    const code = generateCode()
    const id = `otp-${Date.now().toString(36)}`
    const otpMessage = `Tu codigo NEKO Store es ${code}. Expira en 5 minutos. Si no lo solicitaste, ignora este mensaje.`

    await pool.query(
      `INSERT INTO customer_otp (id, phone, code, expires_at)
       VALUES ($1, $2, $3, NOW() + INTERVAL '5 minutes')`,
      [id, clean, code],
    )

    const delivery = await sendWhatsAppText(clean, otpMessage)
    if (!delivery.sent) {
      await pool.query(
        `INSERT INTO notifications (id, type, title, message, icon, for_role, read)
         VALUES ($1, 'otp', 'OTP pendiente', $2, 'WA', 'admin', false)`,
        [`notif-${Date.now().toString(36)}`, `Enviar codigo ${code} por WhatsApp a ${clean}`],
      )

      await sendPushToRole('admin', {
        title: 'OTP pendiente',
        body: `Enviar codigo ${code} por WhatsApp a ${clean}`,
        url: '/admin',
      })
    }

    console.log(`[OTP] Code for ${clean}: ${code}`)

    reply.send({
      ok: true,
      delivery: delivery.sent ? 'whatsapp_cloud' : 'manual',
      message: delivery.sent
        ? 'Codigo enviado por WhatsApp.'
        : 'Codigo generado. NEKO debe enviarlo manualmente por WhatsApp.',
    })
  })

  app.post('/verify-code', async (request, reply) => {
    const { phone, code } = request.body
    if (!phone || !code) {
      return reply.code(400).send({ error: 'Tel\u00E9fono y c\u00F3digo requeridos' })
    }

    const clean = phone.replace(/\D/g, '')

    const result = await pool.query(
      `SELECT * FROM customer_otp
       WHERE phone = $1 AND code = $2 AND used = false AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [clean, code],
    )

    if (result.rows.length === 0) {
      return reply.code(400).send({ error: 'C\u00F3digo inv\u00E1lido o expirado' })
    }

    await pool.query('UPDATE customer_otp SET used = true WHERE id = $1', [result.rows[0].id])

    let customer = await pool.query('SELECT * FROM customers WHERE phone = $1', [clean])

    if (customer.rows.length === 0) {
      const newResult = await pool.query(
        `INSERT INTO customers (id, name, email, phone, password_hash, points, role, tier)
         VALUES ($1, $2, $3, $4, '', 0, 'customer', 'MORTAL')
         RETURNING *`,
        [`cust-${clean}`, `Cliente ${clean.slice(-4)}`, `${clean}@wa.local`, clean],
      )
      customer = newResult
    }

    const cust = customer.rows[0]
    const token = await reply.jwtSign({
      id: cust.id,
      phone: cust.phone,
      role: cust.role,
      type: 'customer',
    })

    const sessionId = `sess-${Date.now().toString(36)}`
    const thirtyDays = 30 * 24 * 60 * 60 * 1000

    await pool.query(
      `INSERT INTO customer_sessions (id, customer_id, token, expires_at)
       VALUES ($1, $2, $3, NOW() + INTERVAL '30 days')`,
      [sessionId, cust.id, token],
    )

    reply.send({
      token,
      user: {
        id: cust.id,
        name: cust.name,
        phone: cust.phone,
        points: cust.points,
        tier: cust.tier,
        role: cust.role,
      },
      expiresIn: thirtyDays,
    })
  })

  app.post('/password', { onRequest: [app.authenticate] }, async (request, reply) => {
    const { password } = request.body
    if (typeof password !== 'string' || password.length < 6 || password.length > 8) {
      return reply.code(400).send({ error: 'La contrasena debe tener de 6 a 8 caracteres' })
    }
    if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      return reply.code(400).send({ error: 'Usa al menos una letra y un numero' })
    }

    const hash = await bcrypt.hash(password, 10)
    await pool.query('UPDATE customers SET password_hash = $1 WHERE id = $2', [
      hash,
      request.user.id,
    ])
    reply.send({ ok: true })
  })

  app.post('/refresh', async (request, reply) => {
    try {
      await request.jwtVerify()
      const result = await pool.query(
        'SELECT * FROM customer_sessions WHERE token = $1 AND expires_at > NOW()',
        [request.headers.authorization?.replace('Bearer ', '')],
      )
      if (result.rows.length === 0) {
        return reply.code(401).send({ error: 'Sesi\u00F3n expirada' })
      }

      const newToken = await reply.jwtSign({
        id: request.user.id,
        phone: request.user.phone,
        role: request.user.role,
        type: 'customer',
      })

      await pool.query(
        'UPDATE customer_sessions SET token = $1, expires_at = NOW() + INTERVAL \'30 days\' WHERE customer_id = $2',
        [newToken, request.user.id],
      )

      reply.send({ token: newToken })
    } catch {
      reply.code(401).send({ error: 'No autorizado' })
    }
  })
}
