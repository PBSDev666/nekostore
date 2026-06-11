export interface OrderData {
  orderId: string
  name: string
  phone: string
  address: string
  notes: string
  itemsText: string
  shippingMethod: string
  shippingCost: number
  total: number
  pointsEarned: number
  currencySymbol: string
  storeName: string
}

interface ShippedData {
  orderId: string
  trackingNumber: string
  estimatedDate: string
  storeName: string
}

interface RewardData {
  points: number
  totalPoints: number
  nextTier: string
  storeName: string
}

function header(name: string): string {
  return `🖤 *${name}* 🖤`
}

function divider(): string {
  return '────────────────────'
}

export const WA_TEMPLATES = {
  order_confirmed: (d: OrderData): string =>
    [
      header(d.storeName),
      '✅ *Pedido Confirmado*',
      divider(),
      `ID: ${d.orderId}`,
      `👤 ${d.name}`,
      `📱 ${d.phone}`,
      d.address ? `🏠 ${d.address}` : '',
      divider(),
      d.itemsText,
      divider(),
      `🚚 ${d.shippingMethod} ${d.shippingCost === 0 ? '(Gratis)' : `${d.currencySymbol}${d.shippingCost}`}`,
      `✦ *Total:* ${d.currencySymbol}${d.total.toFixed(2)}`,
      d.notes ? `📝 ${d.notes}` : '',
      '',
      `⭐ *Ganaste ${d.pointsEarned} pts*`,
      '_Gracias por tu compra. Te notificaremos cuando se envíe._',
    ]
      .filter(Boolean)
      .join('\n'),

  order_shipped: (d: ShippedData): string =>
    [
      header(d.storeName),
      '🚚 *Pedido Enviado*',
      divider(),
      `ID: ${d.orderId}`,
      `📦 Guía: ${d.trackingNumber}`,
      `📅 Llegada estimada: ${d.estimatedDate}`,
      '',
      '_Gracias por esperar. 🐱_',
    ].join('\n'),

  order_delivered: (d: { orderId: string; storeName: string }): string =>
    [
      header(d.storeName),
      '🦇 *Pedido Entregado*',
      divider(),
      `ID: ${d.orderId}`,
      '',
      'Esperamos que ames tu nuevo look gótico.',
      'No olvides compartir fotos etiquetándonos en IG.',
      '',
      '_Te queremos, darkling. 🖤_',
    ].join('\n'),

  abandoned_cart: (d: {
    itemsText: string
    total: number
    currencySymbol: string
    storeName: string
  }): string =>
    [
      header(d.storeName),
      '🖤 *¿Olvidaste algo?*',
      divider(),
      'Tu carrito te espera:',
      d.itemsText,
      divider(),
      `✦ *Total:* ${d.currencySymbol}${d.total.toFixed(2)}`,
      '',
      'Completa tu pedido aquí:',
      'https://nekostore.cr/carrito',
      '',
      '_Tu carrito expirará pronto. 🦇_',
    ].join('\n'),

  reward_earned: (d: RewardData): string =>
    [
      header(d.storeName),
      '⭐ *Puntos Acumulados*',
      divider(),
      `✨ +${d.points} pts`,
      `📍 Total: ${d.totalPoints} pts`,
      d.nextTier ? `🎯 Próximo tier: ${d.nextTier}` : '',
      '',
      'Sigue acumulando para desbloquear recompensas exclusivas.',
    ]
      .filter(Boolean)
      .join('\n'),

  tier_unlocked: (d: { tier: string; benefits: string; storeName: string }): string =>
    [
      header(d.storeName),
      `🌟 *¡Has desbloqueado ${d.tier}!*`,
      divider(),
      '🎉 Felicidades darkling, has subido de nivel.',
      '',
      `Nuevos beneficios: ${d.benefits}`,
      '',
      '_Que la oscuridad te guíe. 🖤_',
    ].join('\n'),

  drop_alert: (d: { dropTitle: string; storeName: string }): string =>
    [
      header(d.storeName),
      `⚡ *NUEVO DROP: ${d.dropTitle}*`,
      divider(),
      'Edición limitada. Solo 30 piezas.',
      '',
      'Disponible ahora en:',
      'https://nekostore.cr/tienda',
      '',
      '_No dejes que se escape. 🦇_',
    ].join('\n'),

  new_order_admin: (d: OrderData): string =>
    [
      header(d.storeName),
      '🛍️ *NUEVO PEDIDO*',
      divider(),
      `ID: ${d.orderId}`,
      `👤 ${d.name}`,
      `📱 ${d.phone}`,
      d.address ? `🏠 ${d.address}` : '',
      divider(),
      d.itemsText,
      divider(),
      `🚚 ${d.shippingMethod} ${d.shippingCost === 0 ? '(Gratis)' : `${d.currencySymbol}${d.shippingCost}`}`,
      `💰 *Total:* ${d.currencySymbol}${d.total.toFixed(2)}`,
      d.notes ? `📝 ${d.notes}` : '',
      '',
      'Ve al dashboard para gestionar:',
      'https://nekostore.cr/admin',
    ].join('\n'),

  form_filled_admin: (d: {
    name: string
    email: string
    country: string
    message: string
    storeName: string
  }): string =>
    [
      header(d.storeName),
      '📬 *Nuevo Formulario de Contacto*',
      divider(),
      `👤 ${d.name}`,
      `📧 ${d.email}`,
      `🌍 ${d.country}`,
      divider(),
      d.message,
      '',
      'Responde desde el dashboard:',
      'https://nekostore.cr/admin',
    ].join('\n'),

  low_stock_admin: (d: {
    productName: string
    size: string
    stock: number
    storeName: string
  }): string =>
    [
      header(d.storeName),
      '⚠️ *Stock Bajo*',
      divider(),
      `Producto: ${d.productName}`,
      `Talla: ${d.size}`,
      `Stock: ${d.stock} unidades`,
      '',
      'Gestiona inventario:',
      'https://nekostore.cr/admin',
    ].join('\n'),
}
