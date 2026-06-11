import pool from '../../db.js'

export default async function adminSiteContentRoutes(app) {
  app.get('/', { onRequest: [app.requireAdmin] }, async (request, reply) => {
    const result = await pool.query('SELECT * FROM site_content ORDER BY section, sort_order')
    const grouped = {}
    for (const row of result.rows) {
      if (!grouped[row.section]) grouped[row.section] = {}
      grouped[row.section][row.key] = { value: row.value, image_url: row.image_url, sort_order: row.sort_order }
    }
    reply.send({ content: grouped, items: result.rows })
  })

  app.put('/:section/:key', { onRequest: [app.requireAdmin] }, async (request, reply) => {
    const { section, key } = request.params
    const { value, image_url, sort_order } = request.body
    await pool.query(
      `INSERT INTO site_content (id, section, key, value, image_url, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (section, key) DO UPDATE SET value = $4, image_url = COALESCE($5, site_content.image_url), updated_at = NOW()`,
      [`${section}.${key}`, section, key, value || '', image_url || null, sort_order || 0],
    )
    reply.send({ ok: true })
  })

  app.get('/public', async (request, reply) => {
    try {
      const result = await pool.query('SELECT * FROM site_content ORDER BY section, sort_order')
      const grouped = {}
      for (const row of result.rows) {
        if (!grouped[row.section]) grouped[row.section] = {}
        grouped[row.section][row.key] = { value: row.value, image_url: row.image_url }
      }
      reply.send({ content: grouped })
    } catch (err) {
      request.log.error(err)
      reply.send({ content: {}, error: 'Contenido no disponible' })
    }
  })
}
