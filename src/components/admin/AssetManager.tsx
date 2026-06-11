import { useRef } from 'react'
import { useSocialStore } from '@/stores/socialStore'
import type { SocialAsset } from '@/types/social'

export default function AssetManager() {
  const assets = useSocialStore((s) => s.assets)
  const campaigns = useSocialStore((s) => s.campaigns)
  const addAsset = useSocialStore((s) => s.addAsset)
  const removeAsset = useSocialStore((s) => s.removeAsset)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    for (const file of Array.from(files)) {
      if (file.size > 5 * 1024 * 1024) continue
      const reader = new FileReader()
      reader.onload = (ev) => {
        if (ev.target?.result) {
          const asset: SocialAsset = {
            id: `asset_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            name: file.name,
            dataUrl: ev.target.result as string,
            campaignId: null,
            createdAt: new Date().toISOString(),
          }
          addAsset(asset)
        }
      }
      reader.readAsDataURL(file)
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const getCampaignName = (id: string | null) =>
    id ? (campaigns.find((c) => c.id === id)?.name ?? 'Sin campaña') : null

  return (
    <div className='social-section'>
      <div className='social-section__header'>
        <h3>Administrador de Assets</h3>
      </div>

      <div className='asset-upload'>
        <input
          ref={fileInputRef}
          type='file'
          accept='image/jpeg,image/png,image/webp'
          multiple
          onChange={handleUpload}
          className='post-creator__file-input'
        />
      </div>

      {assets.length === 0 ? (
        <p className='social-empty'>No hay assets subidos. Subí imágenes para usar en tus posts.</p>
      ) : (
        <div className='asset-grid'>
          {assets.map((asset) => (
            <div key={asset.id} className='asset-item'>
              <img src={asset.dataUrl} alt={asset.name} className='asset-item__img' />
              <div className='asset-item__info'>
                <span className='asset-item__name'>{asset.name}</span>
                {getCampaignName(asset.campaignId) && (
                  <span className='asset-item__campaign'>{getCampaignName(asset.campaignId)}</span>
                )}
              </div>
              <button
                className='asset-item__remove'
                onClick={() => removeAsset(asset.id)}
                type='button'
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
