import pool from '../db.js'

export default async function productsRoutes(app) {
  app.get('/', async (request, reply) => {
    try {
      const { category, search, min_price, max_price } = request.query
      let sql = `
        SELECT p.*, c.name as category_name, c.slug as category_slug
        FROM products p
        JOIN categories c ON c.id = p.category_id
        WHERE p.active = true
      `
      const params = []
      let idx = 1
      if (category) {
        sql += ` AND c.slug = $${idx++}`
        params.push(category)
      }
      if (search) {
        sql += ` AND (p.name ILIKE $${idx} OR p.description ILIKE $${idx})`
        params.push(`%${search}%`)
        idx++
      }
      if (min_price) {
        sql += ` AND p.price >= $${idx++}`
        params.push(Number(min_price))
      }
      if (max_price) {
        sql += ` AND p.price <= $${idx++}`
        params.push(Number(max_price))
      }
      sql += ' ORDER BY p.featured_sort_order ASC, p.name'
      const result = await pool.query(sql, params)
      reply.send({ products: result.rows })
    } catch (err) {
      request.log.error(err)
      reply.send({ products: [], error: 'Catalogo no disponible' })
    }
  })

  app.get('/:id', async (request, reply) => {
    const { id } = request.params
    const result = await pool.query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p
       JOIN categories c ON c.id = p.category_id
       WHERE p.id = $1 AND p.active = true`,
      [id],
    )
    const product = result.rows[0]
    if (!product) return reply.code(404).send({ error: 'Producto no encontrado' })
    reply.send({ product })
  })
}
