import { useEffect, useRef, useState } from 'react'
import { cmsApi } from '@/services/cmsApi'

interface ProductImageManagerProps {
  productId: string
  currentImages: string[]
  onImagesChange: (images: string[]) => void
}

export default function ProductImageManager({
  productId,
  currentImages,
  onImagesChange,
}: ProductImageManagerProps) {
  const [images, setImages] = useState<string[]>(currentImages)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setImages(currentImages)
  }, [currentImages])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const res = await cmsApi.upload.productImage(productId, file)
      setImages(res.images)
      onImagesChange(res.images)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const handleDelete = async (index: number) => {
    if (!window.confirm('¿Eliminar esta imagen?')) return
    try {
      const res = await cmsApi.upload.deleteProductImage(productId, index)
      setImages(res.images)
      onImagesChange(res.images)
    } catch {
      // error handled upstream
    }
  }

  return (
    <div className='product-image-manager'>
      <h4>Imágenes del producto ({images.length}/10)</h4>
      <div className='pim-grid'>
        {images.map((url, i) => (
          <div key={url} className='pim-thumb'>
            <img src={url} alt={`Producto ${i + 1}`} />
            <button
              className='pim-delete'
              onClick={() => handleDelete(i)}
              type='button'
              aria-label={`Eliminar imagen ${i + 1}`}
            >
              ×
            </button>
            <span className='pim-index'>{i + 1}</span>
          </div>
        ))}
        {images.length < 10 && (
          <label className='pim-upload' aria-label='Subir imagen'>
            {uploading ? 'Subiendo...' : '+'}
            <input
              ref={fileRef}
              type='file'
              accept='image/*'
              onChange={handleUpload}
              disabled={uploading}
              hidden
            />
          </label>
        )}
      </div>
    </div>
  )
}
