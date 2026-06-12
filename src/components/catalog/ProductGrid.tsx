import ProductImage from '@/components/shared/ProductImage'
import { PRODUCTS } from '@/data/products'
import { useTimer } from '@/hooks/useTimer'
import { useConfigStore } from '@/stores/configStore'
import { useProductStore } from '@/stores/productStore'
import { useUIStore } from '@/stores/uiStore'
import type { Product } from '@/types/product'
import { publicAsset } from '@/utils/publicAsset'
import ProductCard from './ProductCard'

interface ProductGridProps {
  featured?: boolean
}

const FEATURED_PRODUCT_LIMIT = 7
const DROP_DURATION = 2 * 3600 + 47 * 60 + 33
const DEFAULT_FEATURED_IMAGE = 'featured/shadow-bloom.png'
const FEATURED_IMAGES = [
  DEFAULT_FEATURED_IMAGE,
  'featured/velvet-requiem.png',
  'featured/dark-ritual.png',
  'featured/moon-phase.png',
  'featured/nocturna.png',
  'featured/shadow-queen.png',
  'featured/dusk-corset.png',
]

function formatPrice(currencySymbol: string, price: number): string {
  return `${currencySymbol}${price.toLocaleString('es-CR')}`
}

function featuredImage(index: number): string {
  return publicAsset(FEATURED_IMAGES[index % FEATURED_IMAGES.length] ?? DEFAULT_FEATURED_IMAGE)
}

function FeaturedMetroGrid({
  products,
  readOnly = false,
}: {
  products: Product[]
  readOnly?: boolean
}) {
  const currencySymbol = useConfigStore((s) => s.config.currencySymbol)
  const dropTitle = useConfigStore((s) => s.config.dropTitle)
  const { display } = useTimer(DROP_DURATION)
  const openModal = useUIStore((s) => s.openProductModal)
  const setActiveSection = useUIStore((s) => s.setActiveSection)
  const selectProduct = useUIStore((s) => s.selectProduct)

  const openProduct = (product: Product) => {
    if (readOnly) return
    setActiveSection('shop')
    selectProduct(product.id)
    openModal()
  }

  const [hero, second, third, fourth, fifth, sixth, seventh] = products
  const promoProduct = hero ?? products[0]
  const featureTiles = [
    second && {
      product: second,
      className: 'featured-metro__tile--tall',
      label: 'Edicion limitada',
    },
    third && { product: third, className: 'featured-metro__tile--compact', label: 'Nuevo ingreso' },
    fourth && {
      product: fourth,
      className: 'featured-metro__tile--compact',
      label: 'Favorito NEKO',
    },
    fifth && { product: fifth, className: 'featured-metro__tile--wide', label: 'Look completo' },
    sixth && {
      product: sixth,
      className: 'featured-metro__tile--compact',
      label: 'Ultimas piezas',
    },
    seventh && {
      product: seventh,
      className: 'featured-metro__tile--compact',
      label: 'Ritual diario',
    },
  ].filter(Boolean) as Array<{ product: Product; className: string; label: string }>

  return (
    <section className='featured-metro' aria-labelledby='featured-metro-title'>
      <div className='featured-metro__heading'>
        <span className='section-eyebrow'>Destacados</span>
        <h2 id='featured-metro-title'>Piezas para el proximo ritual</h2>
        <p>
          Una seleccion curada del drop actual: siluetas fuertes, texturas oscuras y accesorios que
          cierran el look sin ruido.
        </p>
      </div>

      <ul className='featured-metro__grid' aria-label='Productos destacados'>
        {promoProduct && (
          <li className='featured-metro__item featured-metro__item--promo'>
            <button
              className='featured-metro__promo'
              type='button'
              disabled={readOnly}
              onClick={() => openProduct(promoProduct)}
            >
              <ProductImage seed={featuredImage(0)} alt={promoProduct.name} />
              <span className='featured-metro__shade' aria-hidden='true' />
              <span className='featured-metro__promo-body'>
                <span className='featured-metro__kicker'>Drop activo</span>
                <span className='featured-metro__promo-title'>{dropTitle}</span>
                <span className='featured-metro__promo-copy'>
                  {promoProduct.name} entra primero al altar. Reservalo antes de que cierre la
                  ventana.
                </span>
                <span
                  className='featured-metro__countdown'
                  role='timer'
                  aria-label={`Tiempo restante ${display}`}
                >
                  {display}
                </span>
              </span>
            </button>
          </li>
        )}

        {featureTiles.map(({ product, className, label }, index) => (
          <li key={product.id} className={`featured-metro__item ${className}`}>
            <button
              className='featured-metro__tile'
              type='button'
              disabled={readOnly}
              onClick={() => openProduct(product)}
            >
              <ProductImage seed={featuredImage(index + 1)} alt={product.name} />
              <span className='featured-metro__shade' aria-hidden='true' />
              <span className='featured-metro__meta'>
                <span className='featured-metro__kicker'>{label}</span>
                <span className='featured-metro__name'>{product.name}</span>
                <span className='featured-metro__price'>
                  {formatPrice(currencySymbol, product.price)}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function ProductGrid({ featured = false }: ProductGridProps) {
  const activeFilter = useUIStore((s) => s.activeFilter)
  const products = useProductStore((s) => s.items)
  const loading = useProductStore((s) => s.loading)
  const catalog = products.length > 0 ? products : PRODUCTS
  const readOnlyFallback = products.length === 0

  const featuredProducts = catalog
    .filter((p) => p.featured)
    .sort((a, b) => (a.featuredSortOrder ?? 0) - (b.featuredSortOrder ?? 0))
  const filtered = featured
    ? featuredProducts.length > 0
      ? featuredProducts.slice(0, FEATURED_PRODUCT_LIMIT)
      : catalog.slice(0, FEATURED_PRODUCT_LIMIT)
    : catalog.filter((p) => {
        if (activeFilter !== 'all' && p.category !== activeFilter) return false
        return true
      })

  if (!featured && loading && products.length === 0) {
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

  if (featured) {
    return <FeaturedMetroGrid products={filtered} readOnly={readOnlyFallback} />
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
