import pool from '../../db.js'

export default async function adminBrandingRoutes(app) {
  app.get('/public', async (request, reply) => {
    try {
      const result = await pool.query("SELECT value FROM config WHERE key = 'branding'")
      const branding = result.rows[0]?.value || {
        logo_url: '',
        store_name: 'NEKO STORE',
        tagline: '',
        primary_color: '#1a1a2e',
        accent_color: '#c9a96e',
      }
      reply.send({ branding })
    } catch (err) {
      request.log?.error?.(err)
      reply.send({
        branding: {
          logo_url: '',
          store_name: 'NEKO STORE',
          tagline: '',
          primary_color: '#1a1a2e',
          accent_color: '#c9a96e',
        },
      })
    }
  })

  app.get('/', { onRequest: [app.requireAdmin] }, async (request, reply) => {
    const result = await pool.query(
      "SELECT value FROM config WHERE key = 'branding'",
    )
    const branding = result.rows[0]?.value || {
      logo_url: '',
      store_name: 'NEKO STORE',
      tagline: '',
      primary_color: '#1a1a2e',
      accent_color: '#c9a96e',
    }
    reply.send({ branding })
  })

  app.put('/', { onRequest: [app.requireAdmin] }, async (request, reply) => {
    const { logo_url, store_name, tagline, primary_color, accent_color } = request.body
    const value = { logo_url, store_name, tagline, primary_color, accent_color }
    await pool.query(
      `INSERT INTO config (key, value) VALUES ('branding', $1)
       ON CONFLICT (key) DO UPDATE SET value = $1`,
      [JSON.stringify(value)],
    )
    reply.send({ branding: value })
  })
}
