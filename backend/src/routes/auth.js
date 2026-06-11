import bcrypt from 'bcrypt'
import pool from '../db.js'

function publicUser(user) {
  const copy = { ...user }
  delete copy.password_hash
  return copy
}

export default async function authRoutes(app) {
  app.post('/register', async (request, reply) => {
    const { name, phone, password, email } = request.body
    if (!name || !phone || !password) {
      return reply.code(400).send({ error: 'Nombre, telefono y contrasena requeridos' })
    }

    const existing = await pool.query('SELECT id FROM customers WHERE phone = $1', [phone])
    if (existing.rows.length > 0) {
      return reply.code(409).send({ error: 'Este telefono ya esta registrado' })
    }

    const hash = await bcrypt.hash(password, 10)
    const result = await pool.query(
      `INSERT INTO customers (id, name, email, phone, password_hash, role, tier)
       VALUES ($1, $2, $3, $4, $5, 'customer', 'MORTAL')
       RETURNING id, name, email, phone, role, points, tier, created_at`,
      [`cust-${phone}`, name, email || `${phone}@wa.local`, phone, hash],
    )
    const user = publicUser(result.rows[0])
    const token = app.jwt.sign({ id: user.id, phone: user.phone, role: user.role })
    reply.code(201).send({ user, token })
  })

  app.post('/login', async (request, reply) => {
    const { phone, password } = request.body
    if (!phone || !password) {
      return reply.code(400).send({ error: 'Telefono/email y contrasena requeridos' })
    }

    const result = await pool.query(
      `SELECT id, name, email, phone, password_hash, role, points, tier, created_at
       FROM customers WHERE phone = $1 OR email = $1`,
      [phone],
    )
    const row = result.rows[0]
    if (!row) {
      return reply.code(401).send({ error: 'Credenciales invalidas' })
    }

    const valid = await bcrypt.compare(password, row.password_hash)
    if (!valid) {
      return reply.code(401).send({ error: 'Credenciales invalidas' })
    }

    const user = publicUser(row)
    if (user.role === 'admin') {
      const twoFactor = await pool.query('SELECT enabled FROM admin_2fa WHERE admin_id = $1', [
        user.id,
      ])
      if (twoFactor.rows[0]?.enabled) {
        return reply.send({ requires2FA: true, adminId: user.id, user })
      }

      const token = app.jwt.sign({
        id: user.id,
        phone: user.phone,
        role: user.role,
        twoFactorSetupRequired: true,
        twoFactorVerified: false,
      })
      return reply.send({ user, token, requires2FASetup: true })
    }

    const token = app.jwt.sign({ id: user.id, phone: user.phone, role: user.role })
    reply.send({ user, token })
  })

  app.get('/me', { onRequest: [app.authenticate] }, async (request, reply) => {
    const result = await pool.query(
      `SELECT id, name, email, phone, role, points, tier, created_at
       FROM customers WHERE id = $1`,
      [request.user.id],
    )
    const user = result.rows[0]
    if (!user) return reply.code(404).send({ error: 'Usuario no encontrado' })
    reply.send({ user })
  })
}
