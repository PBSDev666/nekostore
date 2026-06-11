import { useProductStore } from '@/stores/productStore'
import { useUIStore } from '@/stores/uiStore'
import ProductCard from './ProductCard'

interface ProductGridProps {
  featured?: boolean
}

const FEATURED_PRODUCT_LIMIT = 12

export default function ProductGrid({ featured = false }: ProductGridProps) {
  const activeFilter = useUIStore((s) => s.activeFilter)
  const products = useProductStore((s) => s.items)
  const loading = useProductStore((s) => s.loading)

  const featuredProducts = products
    .filter((p) => p.featured)
    .sort((a, b) => (a.featuredSortOrder ?? 0) - (b.featuredSortOrder ?? 0))
  const filtered = featured
    ? featuredProducts.length > 0
      ? featuredProducts.slice(0, FEATURED_PRODUCT_LIMIT)
      : products.slice(0, 4)
    : products.filter((p) => {
        if (activeFilter !== 'all' && p.category !== activeFilter) return false
        return true
      })

  if (loading && products.length === 0) {
    return (
      <div className='products-loading' role='status' aria-live='polite'>
        <div className='products-loading__sigil' aria-hidden='true'>
          <span />
          <span />
          <span />
        </div>
        <p>Cargando catalogo oscuro...</p>
      </div>
    )
  }

  if (filtered.length === 0) {
    return (
      <div className='products-empty'>
        {featured
          ? 'El catalogo se esta cargando. Volve a intentarlo en un momento.'
          : 'No encontramos productos en esta categoria.'}
      </div>
    )
  }

  return (
    <ul
      className={`products-grid ${featured ? 'products-grid--featured' : ''}`}
      aria-label={featured ? 'Productos destacados' : 'Catalogo de productos'}
    >
      {filtered.map((product) => (
        <li key={product.id} className='products-grid__item'>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  )
}
