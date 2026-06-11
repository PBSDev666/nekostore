import { useConfigStore } from '@/stores/configStore'
import type { Order } from '@/types/order'

interface OrderHistoryProps {
  orders: Order[]
}

export default function OrderHistory({ orders }: OrderHistoryProps) {
  const currencySymbol = useConfigStore((s) => s.config.currencySymbol)

  if (orders.length === 0) {
    return (
      <div className='no-orders'>
        <p>Aún no has realizado ninguna orden.</p>
        <p>Explora el catálogo y encuentra tu próxima pieza.</p>
      </div>
    )
  }

  return (
    <>
      {orders.map((order) => (
        <div key={order.id} className='order-history-item'>
          <div>
            <div className='order-id'>{order.id}</div>
            <div className='order-date'>{new Date(order.date).toLocaleDateString('es')}</div>
            <div className='order-items-list'>
              {order.items.map((item, _i, arr) => (
                <span key={`${item.product.id}-${item.size}`}>
                  {item.quantity}x {item.product.name} ({item.size})
                  {_i < arr.length - 1 ? ', ' : ''}
                </span>
              ))}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className={`order-status order-status--${order.status}`}>{order.status}</span>
            <div className='order-total-row'>
              <span className='order-total-val'>
                {currencySymbol}
                {order.total}
              </span>
              {order.pointsEarned > 0 && (
                <span className='order-points-earned'>+{order.pointsEarned} pts</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </>
  )
}
