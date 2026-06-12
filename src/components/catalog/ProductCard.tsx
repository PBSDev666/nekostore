import Badge from '@/components/shared/Badge'
import ProductImage from '@/components/shared/ProductImage'
import { useConfigStore } from '@/stores/configStore'
import { useUIStore } from '@/stores/uiStore'
import type { Product } from '@/types/product'
import { picsumUrl } from '@/utils/formatters'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const currencySymbol = useConfigStore((s) => s.config.currencySymbol)
  const openModal = useUIStore((s) => s.openProductModal)
  const setActiveSection = useUIStore((s) => s.setActiveSection)
  const selectProduct = useUIStore((s) => s.selectProduct)

  const handleClick = () => {
    setActiveSection('shop')
    selectProduct(product.id)
    openModal()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }
  const productImage =
    product.imageUrl ?? product.images?.[0] ?? picsumUrl(product.imgSeed, 500, 667)

  return (
    <button type='button' className='product-card' onClick={handleClick} onKeyDown={handleKeyDown}>
      <div className='product-card__img'>
        <ProductImage seed={productImage} alt={product.name} />
        {product.badge && <Badge type={product.badge} />}
        {product.isNew && <Badge type='new' />}
        <div className='product-card__overlay'>
          <span className='btn-primary'>Ver detalle</span>
        </div>
      </div>
      <div className='product-card__info'>
        <div className='product-card__category'>{product.category}</div>
        <div className='product-card__name'>{product.name}</div>
        <div className='product-card__bottom'>
          <span className='product-card__price'>
            {currencySymbol}
            {product.price}
          </span>
          <span className='product-card__pts'>{product.points} pts</span>
        </div>
      </div>
    </button>
  )
}
