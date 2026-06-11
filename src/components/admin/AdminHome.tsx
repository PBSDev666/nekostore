import { useEffect, useMemo, useState } from 'react'
import { api } from '@/services/api'
import { useProductStore } from '@/stores/productStore'

type AdminOrder = {
  id: string
  status: string
  total: number
  customer_name?: string
  customer_phone?: string
  created_at?: string
}

export default function AdminHome({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const products = useProductStore((s) => s.items)
  const fetchAdminProducts = useProductStore((s) => s.fetchAdminProducts)
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAdminProducts()
    api.admin.orders
      .list()
      .then((res) => setOrders(res.orders as AdminOrder[]))
      .catch((err) => setError(err instanceof Error ? err.message : 'No se pudo cargar admin.'))
  }, [fetchAdminProducts])

  const stats = useMemo(() => {
    const pendingOrders = orders.filter((order) =>
      ['pending', 'pending_payment', 'paid_verified'].includes(order.status),
    )
    const lowStock = products.filter(
      (product) => (product.stock ?? 0) <= (product.lowStockThreshold ?? 5),
    )
    const outOfStock = products.filter((product) => (product.stock ?? 0) === 0)
    const revenuePending = pendingOrders.reduce((sum, order) => sum + Number(order.total ?? 0), 0)
    return { pendingOrders, lowStock, outOfStock, revenuePending }
  }, [orders, products])

  return (
    <div className='admin-home'>
      <header className='wp-admin-header'>
        <div>
          <p className='wp-admin-kicker'>Inicio</p>
          <h2>Resumen operativo</h2>
          <span>Lo urgente primero: pedidos, stock bajo y tareas de tienda.</span>
        </div>
      </header>

      {error && <div className='admin-error'>{error}</div>}

      <div className='wp-stat-grid'>
        <button onClick={() => onNavigate('pedidos')} type='button'>
          <span>Pedidos pendientes</span>
          <strong>{stats.pendingOrders.length}</strong>
        </button>
        <button onClick={() => onNavigate('inventario')} type='button'>
          <span>Stock bajo</span>
          <strong>{stats.lowStock.length}</strong>
        </button>
        <button onClick={() => onNavigate('inventario')} type='button'>
          <span>Agotados</span>
          <strong>{stats.outOfStock.length}</strong>
        </button>
        <div>
          <span>Monto pendiente</span>
          <strong>₡{stats.revenuePending.toLocaleString('es-CR')}</strong>
        </div>
      </div>

      <div className='admin-home__grid'>
        <section className='admin-home__panel'>
          <div className='admin-home__panel-head'>
            <h3>Pedidos recientes</h3>
            <button
              className='btn-outline btn-small'
              onClick={() => onNavigate('pedidos')}
              type='button'
            >
              Ver pedidos
            </button>
          </div>
          {orders.length === 0 ? (
            <p className='text-muted'>No hay pedidos recientes.</p>
          ) : (
            <div className='admin-mini-list'>
              {orders.slice(0, 5).map((order) => (
                <div key={order.id}>
                  <span>
                    <strong>{order.id}</strong>
                    <small>{order.customer_name || order.customer_phone || 'Cliente'}</small>
                  </span>
                  <span>{order.status}</span>
                  <strong>₡{Number(order.total ?? 0).toLocaleString('es-CR')}</strong>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className='admin-home__panel'>
          <div className='admin-home__panel-head'>
            <h3>Stock que ocupa revision</h3>
            <button
              className='btn-outline btn-small'
              onClick={() => onNavigate('inventario')}
              type='button'
            >
              Ver productos
            </button>
          </div>
          {stats.lowStock.length === 0 ? (
            <p className='text-muted'>Inventario saludable.</p>
          ) : (
            <div className='admin-mini-list'>
              {stats.lowStock.slice(0, 6).map((product) => (
                <div key={product.id}>
                  <span>
                    <strong>{product.name}</strong>
                    <small>{product.category}</small>
                  </span>
                  <span className='stock-low'>{product.stock ?? 0} uds</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
