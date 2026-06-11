import webPush from 'web-push'
import pool from '../db.js'

const publicKey = process.env.VAPID_PUBLIC_KEY || ''
const privateKey = process.env.VAPID_PRIVATE_KEY || ''
const subject = process.env.VAPID_SUBJECT || 'mailto:hola@nekostore.cr'
let pushEnabled = false

if (publicKey && privateKey) {
  try {
    webPush.setVapidDetails(subject, publicKey, privateKey)
    pushEnabled = true
  } catch (err) {
    console.warn(
      `[push] Web Push desactivado: ${
        err instanceof Error ? err.message : 'configuracion VAPID invalida'
      }`,
    )
  }
}

export function getPushStatus() {
  return {
    enabled: pushEnabled,
    publicKey: pushEnabled ? publicKey : '',
  }
}

export async function sendPushToRole(role, payload) {
  if (!pushEnabled) return { sent: 0, disabled: true }

  const result = await pool.query('SELECT id, subscription FROM push_subscriptions WHERE role = $1', [
    role,
  ])
  let sent = 0

  for (const row of result.rows) {
    try {
      await webPush.sendNotification(row.subscription, JSON.stringify(payload))
      sent += 1
    } catch (err) {
      if (err?.statusCode === 404 || err?.statusCode === 410) {
        await pool.query('DELETE FROM push_subscriptions WHERE id = $1', [row.id])
      }
    }
  }

  return { sent, disabled: false }
}
