import multipart from '@fastify/multipart'
import pool from '../db.js'
import { saveFile } from '../upload.js'

const RESERVATION_MINUTES = 30

function orderId() {
  return `NEKO-${Date.now().toString(36).toUpperCase()}`
}

function rowId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export default async function ordersRoutes(app) {
  await app.register(multipart, { limits: { fileSize: 10 * 1024 * 1024 } })

  app.post('/payment-proof', { onRequest: [app.authenticate] }, async (request, reply) => {
    const data = await request.file()
    if (!data) return reply.code(400).send({ error: 'Comprobante requerido' })

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (!allowed.includes(data.mimetype)) {
      return reply.code(400).send({ error: 'Formato no permitido. Usa imagen o PDF.' })
    }

    const buffer = await data.toBuffer()
    const url = saveFile(buffer, data.filename)
    reply.send({ url, filename: data.filename })
  })

  app.post('/', { onRequest: [app.authenticate] }, async (request, reply) => {
    const {
      items,
      shipping_address,
      shipping_method,
      shipping_cost,
      notes,
      payment_method,
      payment_reference,
      payment_proof_url,
      payment_proof_name,
    } = request.body

    if (!Array.isArray(items) || items.length === 0) {
      return reply.code(400).send({ error: 'Se requiere al menos un item' })
    }
    if (!payment_proof_url) {
      return reply.code(400).send({ error: 'Comprobante SINPE requerido' })
    }

    const customerResult = await pool.query(
      'SELECT id, name, phone, email FROM customers WHERE id = $1',
      [request.user.id],
    )
    const customer = customerResult.rows[0]
    if (!customer) return reply.code(404).send({ error: 'Cliente no encontrado' })

    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      const normalizedItems = []
      let itemsTotal = 0
      const lowStockAlerts = []

      for (const item of items) {
        const quantity = Number(item.quantity ?? 0)
        if (!item.product_id || !Number.isInteger(quantity) || quantity <= 0) {
          throw new Error('Item invalido')
        }

        const productResult = await client.query(
          `SELECT id, name, price, stock, low_stock_threshold, active
           FROM products
           WHERE id = $1
           FOR UPDATE`,
          [String(item.product_id)],
        )
        const product = productResult.rows[0]
        if (!product || product.active === false) {
          throw new Error(`Producto no disponible: ${item.product_id}`)
        }
        if (Number(product.stock ?? 0) < quantity) {
          throw new Error(`Stock insuficiente para ${product.name}`)
        }

        const price = Number(product.price)
        const subtotal = price * quantity
        itemsTotal += subtotal

        const nextStock = Number(product.stock) - quantity
        await client.query('UPDATE products SET stock = $1, updated_at = NOW() WHERE id = $2', [
          nextStock,
          product.id,
        ])

        if (nextStock <= Number(product.low_stock_threshold ?? 5)) {
          lowStockAlerts.push(`${product.name}: ${nextStock} uds`)
        }

        normalizedItems.push({
          productId: product.id,
          name: product.name,
          size: String(item.size ?? ''),
          quantity,
          price,
          subtotal,
        })
      }

      const shippingCost = Number(shipping_cost ?? 0)
      const total = itemsTotal + shippingCost
      const pointsEarned = Math.floor(itemsTotal / 500)
      const id = orderId()

      const orderResult = await client.query(
        `INSERT INTO orders (
          id, customer_id, customer_name, customer_phone, customer_email,
          shipping_address, shipping_method, shipping_cost, status,
          items_total, total, notes, points_earned, payment_method,
          payment_reference, payment_proof_url, payment_proof_name, payment_status, reserved_until
        )
        VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8, 'pending_payment',
          $9, $10, $11, $12, $13,
          $14, $15, $16, 'pending', NOW() + ($17 || ' minutes')::interval
        )
        RETURNING *`,
        [
          id,
          customer.id,
          customer.name,
          customer.phone,
          customer.email || '',
          shipping_address || 'Recogida en tienda',
          shipping_method || 'Recogida en tienda',
          shippingCost,
          itemsTotal,
          total,
          notes || '',
          pointsEarned,
          payment_method || 'sinpe_movil',
          payment_reference || '',
          payment_proof_url,
          payment_proof_name || '',
          RESERVATION_MINUTES,
        ],
      )
      const order = orderResult.rows[0]

      for (const item of normalizedItems) {
        await client.query(
          `INSERT INTO order_items (id, order_id, product_id, name, size, quantity, price, subtotal)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            rowId('oi'),
            order.id,
            item.productId,
            item.name,
            item.size,
            item.quantity,
            item.price,
            item.subtotal,
          ],
        )
      }

      await client.query(
        `INSERT INTO notifications (id, customer_id, type, title, message, icon, for_role, read)
         VALUES ($1, $2, 'order', $3, $4, '🧾', 'admin', false)`,
        [
          rowId('notif'),
          customer.id,
          'Pedido pendiente de SINPE',
          `${order.id} por ₡${Number(order.total).toLocaleString('es-CR')}`,
        ],
      )

      for (const message of lowStockAlerts) {
        await client.query(
          `INSERT INTO notifications (id, type, title, message, icon, for_role, read)
           VALUES ($1, 'stock', 'Stock bajo', $2, '⚠', 'admin', false)`,
          [rowId('notif'), message],
        )
      }

      await client.query('COMMIT')

      const fullOrder = await pool.query(
        `SELECT o.*, json_agg(json_build_object(
           'id', oi.id, 'product_id', oi.product_id, 'quantity', oi.quantity,
           'size', oi.size, 'unit_price', oi.price, 'name', oi.name, 'image', p.images->>0
         )) as items
         FROM orders o
         JOIN order_items oi ON oi.order_id = o.id
         JOIN products p ON p.id = oi.product_id
         WHERE o.id = $1
         GROUP BY o.id`,
        [order.id],
      )
      reply.code(201).send({ order: fullOrder.rows[0] })
    } catch (err) {
      await client.query('ROLLBACK')
      const message = err instanceof Error ? err.message : 'No se pudo crear la orden'
      reply.code(400).send({ error: message })
    } finally {
      client.release()
    }
  })

  app.get('/', { onRequest: [app.authenticate] }, async (request, reply) => {
    const result = await pool.query(
      `SELECT o.*, json_agg(json_build_object(
         'id', oi.id, 'product_id', oi.product_id, 'quantity', oi.quantity,
         'size', oi.size, 'unit_price', oi.price, 'name', oi.name, 'image', p.images->>0
       )) as items
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       JOIN products p ON p.id = oi.product_id
       WHERE o.customer_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [request.user.id],
    )
    reply.send({ orders: result.rows })
  })

  app.get('/:id', { onRequest: [app.authenticate] }, async (request, reply) => {
    const result = await pool.query(
      `SELECT o.*, json_agg(json_build_object(
         'id', oi.id, 'product_id', oi.product_id, 'quantity', oi.quantity,
         'size', oi.size, 'unit_price', oi.price, 'name', oi.name, 'image', p.images->>0
       )) as items
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       JOIN products p ON p.id = oi.product_id
       WHERE o.id = $1 AND o.customer_id = $2
       GROUP BY o.id`,
      [request.params.id, request.user.id],
    )
    const order = result.rows[0]
    if (!order) return reply.code(404).send({ error: 'Orden no encontrada' })
    reply.send({ order })
  })
}
