import pool from '../db.js'

export default async function loyaltyRoutes(app) {
  app.get('/', async (request, reply) => {
    try {
      const tiersResult = await pool.query('SELECT * FROM loyalty_tiers ORDER BY min_points ASC')
      const rewardsResult = await pool.query(
        'SELECT * FROM rewards WHERE active = true ORDER BY cost ASC',
      )
      let customer = null
      let nextTier = null
      let pointsToNext = 0
      let redemptions = []

      try {
        await request.jwtVerify()
        const customerResult = await pool.query(
          `SELECT id, points, tier, total_spent FROM customers WHERE id = $1`,
          [request.user.id],
        )
        customer = customerResult.rows[0] ?? null

        if (customer) {
          const currentTierIndex = tiersResult.rows.findIndex((t) => t.name === customer.tier)
          nextTier = tiersResult.rows[currentTierIndex + 1] || null
          pointsToNext = nextTier ? nextTier.min_points - customer.points : 0

          const redemptionsResult = await pool.query(
            `SELECT rr.*, r.title as reward_name, r.icon as reward_icon
             FROM reward_redemptions rr
             JOIN rewards r ON r.id = rr.reward_id
             WHERE rr.customer_id = $1
             ORDER BY rr.created_at DESC`,
            [request.user.id],
          )
          redemptions = redemptionsResult.rows
        }
      } catch {
        // Public visitors can still see tiers and active rewards.
      }

      reply.send({
        loyalty: {
          points: customer?.points ?? 0,
          tier: customer?.tier ?? null,
          total_spent: customer?.total_spent ?? 0,
          tiers: tiersResult.rows,
          rewards: rewardsResult.rows,
          next_tier: nextTier,
          points_to_next_tier: pointsToNext,
          redemptions,
        },
      })
    } catch (err) {
      request.log.error(err)
      reply.send({
        loyalty: {
          points: 0,
          tier: null,
          total_spent: 0,
          tiers: [],
          rewards: [],
          next_tier: null,
          points_to_next_tier: 0,
          redemptions: [],
        },
        error: 'Lealtad no disponible',
      })
    }
  })

  app.post('/redeem', { onRequest: [app.authenticate] }, async (request, reply) => {
    const { reward_id } = request.body
    if (!reward_id) return reply.code(400).send({ error: 'reward_id requerido' })

    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      const rewardResult = await client.query('SELECT * FROM rewards WHERE id = $1 AND active = true', [reward_id])
      const reward = rewardResult.rows[0]
      if (!reward) {
        await client.query('ROLLBACK')
        return reply.code(404).send({ error: 'Recompensa no encontrada' })
      }

      const customerResult = await client.query('SELECT points FROM customers WHERE id = $1', [request.user.id])
      const customer = customerResult.rows[0]
      if (customer.points < reward.cost) {
        await client.query('ROLLBACK')
        return reply.code(400).send({ error: 'Puntos insuficientes' })
      }

      await client.query(
        'UPDATE customers SET points = points - $1 WHERE id = $2',
        [reward.cost, request.user.id],
      )
      const redemptionResult = await client.query(
        `INSERT INTO reward_redemptions (id, customer_id, reward_id, points_spent)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [`redemption-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`, request.user.id, reward_id, reward.cost],
      )
      await client.query('COMMIT')
      reply.code(201).send({
        redemption: redemptionResult.rows[0],
        points_remaining: customer.points - reward.cost,
      })
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  })
}
