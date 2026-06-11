import { authenticator } from 'otplib'
import QRCode from 'qrcode'
import pool from '../../db.js'

export default async function admin2faRoutes(app) {
  app.get('/status', { onRequest: [app.requireAdmin] }, async (request, reply) => {
    const result = await pool.query(
      'SELECT enabled, backup_codes FROM admin_2fa WHERE admin_id = $1',
      [request.user.id],
    )
    reply.send({
      enabled: result.rows[0]?.enabled || false,
      hasBackupCodes: (result.rows[0]?.backup_codes?.length || 0) > 0,
    })
  })

  app.post('/setup', { onRequest: [app.requireAdmin] }, async (request, reply) => {
    const adminId = request.user.id
    const existing = await pool.query('SELECT * FROM admin_2fa WHERE admin_id = $1', [adminId])

    if (existing.rows[0]?.enabled) {
      return reply.code(400).send({ error: '2FA ya est\u00E1 activado' })
    }

    const secret = authenticator.generateSecret()
    const otpauth = authenticator.keyuri(adminId, 'NEKO Store', secret)

    await pool.query(
      `INSERT INTO admin_2fa (id, admin_id, secret, enabled, backup_codes)
       VALUES ($1, $2, $3, false, '{}')
       ON CONFLICT (admin_id) DO UPDATE SET secret = $3`,
      [`2fa-${adminId}`, adminId, secret],
    )

    const qrDataUrl = await QRCode.toDataURL(otpauth)

    const backupCodes = Array.from({ length: 8 }, () =>
      Math.random().toString(36).slice(2, 10).toUpperCase(),
    )

    await pool.query(
      'UPDATE admin_2fa SET backup_codes = $1 WHERE admin_id = $2',
      [backupCodes, adminId],
    )

    reply.send({ secret, qr: qrDataUrl, backupCodes })
  })

  app.post('/verify', { onRequest: [app.requireAdmin] }, async (request, reply) => {
    const { token } = request.body
    if (!token) return reply.code(400).send({ error: 'Token requerido' })

    const result = await pool.query('SELECT * FROM admin_2fa WHERE admin_id = $1', [request.user.id])
    const row = result.rows[0]
    if (!row) return reply.code(400).send({ error: '2FA no configurado' })

    const isValid = authenticator.check(token, row.secret)
    if (!isValid) return reply.code(400).send({ error: 'C\u00F3digo inv\u00E1lido' })

    await pool.query('UPDATE admin_2fa SET enabled = true, updated_at = NOW() WHERE admin_id = $1', [request.user.id])

    const adminResult = await pool.query(
      'SELECT id, name, email, phone, role, points, tier, created_at FROM customers WHERE id = $1',
      [request.user.id],
    )
    const admin = adminResult.rows[0]
    const jwt = app.jwt.sign({
      id: admin.id,
      phone: admin.phone,
      role: admin.role,
      twoFactorVerified: true,
    })

    reply.send({ ok: true, message: '2FA activado exitosamente', token: jwt, user: admin })
  })

  app.post('/login', async (request, reply) => {
    const { adminId, token } = request.body
    if (!adminId || !token) return reply.code(400).send({ error: 'adminId y token requeridos' })

    const result = await pool.query('SELECT * FROM admin_2fa WHERE admin_id = $1', [adminId])
    const row = result.rows[0]
    if (!row || !row.enabled) return reply.code(400).send({ error: '2FA no activado' })

    const adminResult = await pool.query(
      'SELECT id, name, email, phone, role, points, tier, created_at FROM customers WHERE id = $1',
      [adminId],
    )
    const admin = adminResult.rows[0]
    if (!admin || admin.role !== 'admin') {
      return reply.code(403).send({ error: 'Admin no autorizado' })
    }

    const signAdmin = () => {
      const jwt = app.jwt.sign({
        id: admin.id,
        phone: admin.phone,
        role: admin.role,
        twoFactorVerified: true,
      })
      return { ok: true, token: jwt, user: admin }
    }

    const isValid = authenticator.check(token, row.secret)
    if (isValid) return reply.send(signAdmin())

    if (row.backup_codes?.includes(token)) {
      const codes = row.backup_codes.filter((c) => c !== token)
      await pool.query('UPDATE admin_2fa SET backup_codes = $1 WHERE admin_id = $2', [codes, adminId])
      return reply.send({ ...signAdmin(), usedBackup: true })
    }

    reply.code(400).send({ error: 'C\u00F3digo inv\u00E1lido' })
  })
}
