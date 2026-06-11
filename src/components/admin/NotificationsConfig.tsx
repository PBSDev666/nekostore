import QRCode from '@/components/shared/QRCode'
import { useBrandingStore } from '@/stores/brandingStore'
import { useWAConfigStore } from '@/stores/waConfigStore'

const CUSTOMER_TYPES = [
  { id: 'order_confirmed' as const, label: 'Confirmación de pedido' },
  { id: 'order_shipped' as const, label: 'Envío actualizado' },
  { id: 'order_delivered' as const, label: 'Pedido entregado' },
  { id: 'abandoned_cart' as const, label: 'Carrito abandonado' },
  { id: 'reward_earned' as const, label: 'Puntos acumulados' },
  { id: 'tier_unlocked' as const, label: 'Tier desbloqueado' },
  { id: 'drop_alert' as const, label: 'Nuevo drop' },
]

const ADMIN_TYPES = [
  { id: 'new_order_admin' as const, label: 'Nuevos pedidos' },
  { id: 'form_filled_admin' as const, label: 'Formularios de contacto' },
  { id: 'low_stock_admin' as const, label: 'Stock bajo' },
]

export default function NotificationsConfig() {
  const config = useWAConfigStore((s) => s.config)
  const toggleCustomerType = useWAConfigStore((s) => s.toggleCustomerType)
  const toggleAdminType = useWAConfigStore((s) => s.toggleAdminType)
  const setAdminPhone = useWAConfigStore((s) => s.setAdminPhone)
  const brandingConfig = useBrandingStore((s) => s.config)

  return (
    <div className='branding-config'>
      <h2>Notificaciones WhatsApp</h2>

      <section className='branding-section'>
        <h3>Número del admin</h3>
        <label className='branding-field'>
          Teléfono (sin +)
          <input
            type='text'
            value={config.adminPhone}
            onChange={(e) => setAdminPhone(e.target.value)}
            placeholder='50624247171'
          />
        </label>
      </section>

      <section className='branding-section'>
        <h3>Notificaciones a clientes</h3>
        {CUSTOMER_TYPES.map((t) => (
          <label key={t.id} className='branding-toggle'>
            <input
              type='checkbox'
              checked={config.enabledCustomerTypes.includes(t.id)}
              onChange={() => toggleCustomerType(t.id)}
            />
            {t.label}
          </label>
        ))}
      </section>

      <section className='branding-section'>
        <h3>Notificaciones al admin</h3>
        {ADMIN_TYPES.map((t) => (
          <label key={t.id} className='branding-toggle'>
            <input
              type='checkbox'
              checked={config.enabledAdminTypes.includes(t.id)}
              onChange={() => toggleAdminType(t.id)}
            />
            {t.label}
          </label>
        ))}
      </section>

      <section className='branding-section'>
        <h3>Compartir tienda</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 12 }}>
          Escanea para compartir NEKO Store
        </p>
        <QRCode url={`https://${brandingConfig.storeUrl}`} size={160} />
      </section>
    </div>
  )
}
