import { useMemo } from 'react'
import { useConfigStore } from '@/stores/configStore'
import { useProductStore } from '@/stores/productStore'

interface CategoryProjection {
  category: string
  totalStock: number
  totalValue: number
  totalCost: number
  potentialRevenue: number
  productCount: number
}

export default function SalesProjection() {
  const PRODUCTS = useProductStore((s) => s.items)
  const currencySymbol = useConfigStore((s) => s.config.currencySymbol)
  const projection = useMemo(() => {
    const getStock = (p: (typeof PRODUCTS)[number]) => p.stock ?? 0
    const totalStock = PRODUCTS.reduce((s, p) => s + getStock(p), 0)
    const totalPotentialRevenue = PRODUCTS.reduce((s, p) => s + getStock(p) * p.price, 0)
    const totalCost = PRODUCTS.reduce((s, p) => s + getStock(p) * (p.costPrice ?? 0), 0)
    const totalMargin = totalPotentialRevenue - totalCost
    const marginPercent =
      totalPotentialRevenue > 0 ? ((totalMargin / totalPotentialRevenue) * 100).toFixed(1) : '0'
    const avgPrice = (PRODUCTS.reduce((s, p) => s + p.price, 0) / PRODUCTS.length).toFixed(2)

    const lowStock = PRODUCTS.filter((p) => getStock(p) <= (p.lowStockThreshold ?? 5)).sort(
      (a, b) => getStock(a) - getStock(b),
    )
    const outOfStock = PRODUCTS.filter((p) => getStock(p) === 0)
    const categoryMap: Record<string, CategoryProjection> = {}
    for (const p of PRODUCTS) {
      const cat = p.category
      if (!categoryMap[cat]) {
        categoryMap[cat] = {
          category: cat,
          totalStock: 0,
          totalValue: 0,
          totalCost: 0,
          potentialRevenue: 0,
          productCount: 0,
        }
      }
      const entry = categoryMap[cat] as CategoryProjection
      const stock = p.stock ?? 0
      const costPrice = p.costPrice ?? 0
      entry.totalStock += stock
      entry.totalValue += stock * p.price
      entry.totalCost += stock * costPrice
      entry.potentialRevenue += stock * p.price
      entry.productCount += 1
    }
    const categories = Object.values(categoryMap)

    const topByMargin = [...PRODUCTS]
      .filter((p) => p.costPrice != null && (p.stock ?? 0) > 0)
      .sort(
        (a, b) =>
          (b.price - (b.costPrice ?? 0)) * (b.stock ?? 0) -
          (a.price - (a.costPrice ?? 0)) * (a.stock ?? 0),
      )
      .slice(0, 10)

    const bestsellers = PRODUCTS.filter((p) => p.badge === 'BESTSELLER')
    const limited = PRODUCTS.filter((p) => p.badge === 'LIMITADO' || p.badge === 'EXCLUSIVO')

    const estimatedWeeklySales = 5
    const weeksToSellOut =
      estimatedWeeklySales > 0 ? Math.round(totalStock / estimatedWeeklySales) : 0

    return {
      totalStock,
      totalPotentialRevenue,
      totalCost,
      totalMargin,
      marginPercent,
      avgPrice,
      lowStock,
      outOfStock,
      categories,
      topByMargin,
      bestsellers,
      limited,
      estimatedWeeklySales,
      weeksToSellOut,
      productCount: PRODUCTS.length,
    }
  }, [PRODUCTS])

  return (
    <div className='sales-projection'>
      <h2>Proyección de Ventas e Inventario</h2>
      <p className='sales-projection__subtitle'>
        Inventario total en bodega: {projection.totalStock} unidades | {projection.productCount}{' '}
        productos
      </p>

      <div className='sales-projection__grid'>
        <div className='sales-projection__card highlight'>
          <span className='sales-projection__card-label'>Ingreso Potencial Total</span>
          <span className='sales-projection__card-value'>
            {currencySymbol}
            {projection.totalPotentialRevenue.toLocaleString()}
          </span>
          <span className='sales-projection__card-sub'>Si se vende todo el inventario actual</span>
        </div>
        <div className='sales-projection__card'>
          <span className='sales-projection__card-label'>Costo Total de Inventario</span>
          <span className='sales-projection__card-value'>
            {currencySymbol}
            {projection.totalCost.toLocaleString()}
          </span>
        </div>
        <div className='sales-projection__card highlight'>
          <span className='sales-projection__card-label'>Margen Bruto Estimado</span>
          <span className='sales-projection__card-value'>
            {currencySymbol}
            {projection.totalMargin.toLocaleString()}
          </span>
          <span className='sales-projection__card-sub'>{projection.marginPercent}% de margen</span>
        </div>
        <div className='sales-projection__card'>
          <span className='sales-projection__card-label'>Precio Promedio</span>
          <span className='sales-projection__card-value'>
            {currencySymbol}
            {projection.avgPrice}
          </span>
        </div>
        <div className='sales-projection__card'>
          <span className='sales-projection__card-label'>Stock Total</span>
          <span className='sales-projection__card-value'>{projection.totalStock}</span>
          <span className='sales-projection__card-sub'>unidades en bodega</span>
        </div>
        <div className='sales-projection__card'>
          <span className='sales-projection__card-label'>Tiempo Estimado para Agotar</span>
          <span className='sales-projection__card-value'>~{projection.weeksToSellOut} semanas</span>
          <span className='sales-projection__card-sub'>
            a {projection.estimatedWeeklySales} ventas/semana
          </span>
        </div>
      </div>

      <div className='sales-projection__section'>
        <h3>Por Categoría</h3>
        <table className='sales-projection__table'>
          <thead>
            <tr>
              <th>Categoría</th>
              <th>Productos</th>
              <th>Stock</th>
              <th>Valor Inventario</th>
              <th>Ingreso Potencial</th>
              <th>Margen</th>
            </tr>
          </thead>
          <tbody>
            {projection.categories.map((cat) => {
              const catMargin = cat.potentialRevenue - cat.totalCost
              const catMarginPct =
                cat.potentialRevenue > 0
                  ? ((catMargin / cat.potentialRevenue) * 100).toFixed(1)
                  : '0'
              return (
                <tr key={cat.category}>
                  <td className='cap'>{cat.category}</td>
                  <td>{cat.productCount}</td>
                  <td>{cat.totalStock}</td>
                  <td>
                    {currencySymbol}
                    {cat.totalCost.toLocaleString()}
                  </td>
                  <td>
                    {currencySymbol}
                    {cat.potentialRevenue.toLocaleString()}
                  </td>
                  <td>{catMarginPct}%</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className='sales-projection__split'>
        <div className='sales-projection__section'>
          <h3>⚠️ Alertas de Stock Bajo</h3>
          {projection.lowStock.length === 0 ? (
            <p className='text-muted'>No hay productos con stock bajo.</p>
          ) : (
            <table className='sales-projection__table'>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Stock</th>
                  <th>Ingreso Proyectado</th>
                </tr>
              </thead>
              <tbody>
                {projection.lowStock.slice(0, 8).map((p) => {
                  const st = p.stock ?? 0
                  return (
                    <tr key={p.id} className={st === 0 ? 'row-danger' : 'row-warning'}>
                      <td>{p.name}</td>
                      <td>{st}</td>
                      <td>
                        {currencySymbol}
                        {(st * p.price).toLocaleString()}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className='sales-projection__section'>
          <h3>🏆 Top Rentabilidad</h3>
          <table className='sales-projection__table'>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Margen Unitario</th>
                <th>Stock</th>
                <th>Ganancia Proyectada</th>
              </tr>
            </thead>
            <tbody>
              {projection.topByMargin.map((p) => {
                const unitMargin = p.price - (p.costPrice ?? 0)
                const st = p.stock ?? 0
                return (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>
                      {currencySymbol}
                      {unitMargin}
                    </td>
                    <td>{st}</td>
                    <td>
                      {currencySymbol}
                      {(unitMargin * st).toLocaleString()}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className='sales-projection__section'>
        <h3>📊 Recomendaciones</h3>
        <ul className='sales-projection__recs'>
          {projection.outOfStock.length > 0 && (
            <li>
              <strong>{projection.outOfStock.length} producto(s) agotado(s)</strong> — considerar
              reabastecimiento o retirar del catálogo.
            </li>
          )}
          {projection.lowStock.length > 2 && (
            <li>
              <strong>{projection.lowStock.length} producto(s) con stock bajo</strong> — priorizar
              promociones para evitar pérdida de ventas.
            </li>
          )}
          {projection.bestsellers.map((p) => (
            <li key={p.id}>
              <strong>{p.name}</strong> es BESTSELLER con solo {p.stock ?? 0} unidades — producir
              más para no perder momentum de ventas.
            </li>
          ))}
          {projection.limited.map((p) => (
            <li key={p.id}>
              <strong>{p.name}</strong> ({p.badge}) — solo {p.stock ?? 0} unidades. Usar escasez
              para crear urgencia.
            </li>
          ))}
          {projection.lowStock.length === 0 && projection.outOfStock.length === 0 && (
            <li>Inventario saludable. Enfocar esfuerzos en marketing para acelerar rotación.</li>
          )}
        </ul>
      </div>
    </div>
  )
}
