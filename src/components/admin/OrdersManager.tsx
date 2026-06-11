import { useEffect, useState } from 'react'
import { api } from '@/services/api'

type AdminOrderItem = {
  id: string
  name: string
  quantity: number
  size?: string
  unit_price?: number
}

type AdminOrder = {
  id: string
  status: string
  total: number
  customer_name?: string
  customer_phone?: string
  shipping_address?: string
  notes?: string
  created_at?: string
  items?: AdminOrderItem[]
}

const STATUSES = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'shipped', label: 'Enviado' },
  { value: 'delivered', label: 'Entregado' },
  { value: 'cancelled', label: 'Cancelado' },
]

export default function OrdersManager() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const fetchOrders = async (nextStatus = status) => {
    setLoading(true)
    setError('')
    try {
      const res = await api.admin.orders.list(nextStatus || undefined)
      setOrders(res.orders as AdminOrder[])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar pedidos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const updateStatus = async (id: string, nextStatus: string) => {
    setNotice('')
    setError('')
    try {
      await api.admin.orders.updateStatus(id, nextStatus)
      await fetchOrders()
      setNotice(`Pedido ${id} actualizado.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el pedido.')
    }
  }

  return (
    <div className='orders-manager'>
      <header className='wp-admin-header'>
        <div>
          <p className='wp-admin-kicker'>Pedidos</p>
          <h2>Gestion de pedidos</h2>
          <span>Revisa pagos, prepara envios y cambia estados desde la API.</span>
        </div>
        <div className='orders-toolbar'>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              fetchOrders(e.target.value)
            }}
            aria-label='Filtrar por estado'
          >
            <option value=''>Todos</option>
            {STATUSES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button className='btn-secondary' onClick={() => fetchOrders()} type='button'>
            Refrescar
          </button>
        </div>
      </header>

      {error && <div className='admin-error'>{error}</div>}
      {notice && <div className='admin-notice'>{notice}</div>}
      {loading && <div className='admin-panel-empty'>Cargando pedidos...</div>}

      <div className='orders-list'>
        {orders.map((order) => (
          <article key={order.id} className='order-admin-card'>
            <header>
              <div>
                <h3>{order.id}</h3>
                <p>
                  {order.customer_name || 'Cliente'} - {order.customer_phone || 'sin telefono'}
                </p>
              </div>
              <strong>₡{Number(order.total ?? 0).toLocaleString('es-CR')}</strong>
            </header>
            <div className='order-admin-card__meta'>
              <span>Estado actual: {order.status}</span>
              {order.created_at && (
                <span>{new Date(order.created_at).toLocaleString('es-CR')}</span>
              )}
            </div>
            {order.items && (
              <ul className='order-admin-card__items'>
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.quantity}x {item.name}
                    {item.size ? ` (${item.size})` : ''}
                  </li>
                ))}
              </ul>
            )}
            {order.shipping_address && <p className='text-muted'>{order.shipping_address}</p>}
            {order.notes && <p className='text-muted'>Notas: {order.notes}</p>}
            <div className='order-admin-card__actions'>
              <label>
                Cambiar estado
                <select
                  value={order.status}
                  onChange={(e) => updateStatus(order.id, e.target.value)}
                >
                  {STATUSES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </article>
        ))}
        {!loading && orders.length === 0 && (
          <div className='admin-panel-empty'>No hay pedidos para este filtro.</div>
        )}
      </div>
    </div>
  )
}
