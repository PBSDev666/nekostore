import { useState } from 'react'
import { picsumUrl } from '@/utils/formatters'

interface ProductImageProps {
  seed?: string
  alt: string
  className?: string
  width?: number
  height?: number
}

function ProductPlaceholder({ alt }: { alt: string }) {
  return (
    <div className='product-image-placeholder' role='img' aria-label={alt}>
      <img
        className='product-image-placeholder__cat'
        src='/brand/neko-logo-cat.png'
        alt=''
        aria-hidden='true'
      />
      <img
        className='product-image-placeholder__wordmark'
        src='/brand/neko-logo-text.png'
        alt='NEKO Store'
      />
      <span className='product-image-placeholder__copy'>Imagen pendiente</span>
    </div>
  )
}

function resolveImageSrc(seed: string): string {
  if (/^(https?:)?\/\//.test(seed) || seed.startsWith('/')) return seed
  return picsumUrl(seed, 500, 667)
}

export default function ProductImage({ seed, alt, className }: ProductImageProps) {
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)
  const src = seed?.trim()

  if (!src || error) {
    return <ProductPlaceholder alt={alt} />
  }
  const imageSrc = resolveImageSrc(src)

  return (
    <>
      {loading && <div className='product-image-skeleton' aria-hidden='true' />}
      <img
        src={imageSrc}
        alt={alt}
        className={`product-image ${className ?? ''}`.trim()}
        loading='lazy'
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false)
          setError(true)
        }}
        style={{
          opacity: loading ? 0 : 1,
          transition: 'opacity 0.3s ease',
        }}
      />
    </>
  )
}
