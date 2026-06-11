import { type ChangeEvent, useRef } from 'react'
import { useBrandingStore } from '@/stores/brandingStore'

export default function BrandingConfig() {
  const config = useBrandingStore((s) => s.config)
  const updateConfig = useBrandingStore((s) => s.updateConfig)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      updateConfig({ logoUrl: reader.result as string })
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveLogo = () => {
    updateConfig({ logoUrl: '' })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className='branding-config'>
      <h2>Configuración de Marca</h2>

      <section className='branding-section'>
        <h3>Logo</h3>
        {config.logoUrl && (
          <div className='branding-logo-preview'>
            <img src={config.logoUrl} alt='Logo actual' className='branding-logo-img' />
            <button className='btn-outline btn-small' onClick={handleRemoveLogo} type='button'>
              Eliminar logo
            </button>
          </div>
        )}
        <input
          ref={fileInputRef}
          type='file'
          accept='image/svg+xml,image/png,image/webp'
          onChange={handleFileUpload}
          className='branding-file-input'
        />
      </section>

      <section className='branding-section'>
        <h3>Colores de Marca</h3>
        <div className='branding-color-grid'>
          <label className='branding-color-label'>
            Fondo (primario)
            <input
              type='color'
              value={config.primaryColor}
              onChange={(e) => updateConfig({ primaryColor: e.target.value })}
            />
          </label>
          <label className='branding-color-label'>
            Acento (gold)
            <input
              type='color'
              value={config.accentColor}
              onChange={(e) => updateConfig({ accentColor: e.target.value })}
            />
          </label>
          <label className='branding-color-label'>
            Texto
            <input
              type='color'
              value={config.textColor}
              onChange={(e) => updateConfig({ textColor: e.target.value })}
            />
          </label>
        </div>
      </section>

      <section className='branding-section'>
        <h3>QR Code</h3>
        <label className='branding-field'>
          URL del sitio
          <input
            type='text'
            value={config.storeUrl}
            onChange={(e) => updateConfig({ storeUrl: e.target.value })}
          />
        </label>
        <div className='branding-qr-size'>
          <label>
            Tamaño QR: {config.qrSize}px
            <input
              type='range'
              min='100'
              max='400'
              step='20'
              value={config.qrSize}
              onChange={(e) => updateConfig({ qrSize: Number(e.target.value) })}
            />
          </label>
        </div>
      </section>

      <section className='branding-section'>
        <h3>Canales</h3>
        <label className='branding-toggle'>
          <input
            type='checkbox'
            checked={config.applyToSocialPosts}
            onChange={(e) => updateConfig({ applyToSocialPosts: e.target.checked })}
          />
          Aplicar marca en posts de redes sociales
        </label>
        <label className='branding-toggle'>
          <input
            type='checkbox'
            checked={config.applyToOGImages}
            onChange={(e) => updateConfig({ applyToOGImages: e.target.checked })}
          />
          Aplicar marca en imágenes OG (Open Graph)
        </label>
        <label className='branding-toggle'>
          <input
            type='checkbox'
            checked={config.applyToWhatsApp}
            onChange={(e) => updateConfig({ applyToWhatsApp: e.target.checked })}
          />
          Aplicar marca en templates de WhatsApp
        </label>
      </section>
    </div>
  )
}
