import { useRef, useState } from 'react'
import { useSocialStore } from '@/stores/socialStore'
import type { SocialPost } from '@/types/social'
import { SOCIAL_POST_PLATFORMS } from '@/types/social'

interface PostCreatorProps {
  onClose: () => void
  editPost?: SocialPost
}

export default function PostCreator({ onClose, editPost }: PostCreatorProps) {
  const campaigns = useSocialStore((s) => s.campaigns)
  const addPost = useSocialStore((s) => s.addPost)
  const updatePost = useSocialStore((s) => s.updatePost)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [text, setText] = useState(editPost?.text ?? '')
  const [platform, setPlatform] = useState<SocialPost['platform']>(editPost?.platform ?? 'both')
  const [campaignId, setCampaignId] = useState(editPost?.campaignId ?? '')
  const [scheduleType, setScheduleType] = useState<'now' | 'schedule'>(
    editPost?.scheduledAt ? 'schedule' : 'now',
  )
  const [scheduledDate, setScheduledDate] = useState(
    editPost?.scheduledAt ? editPost.scheduledAt.slice(0, 16) : '',
  )
  const [images, setImages] = useState<string[]>(editPost?.images ?? [])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    const maxFiles = 10
    const remaining = maxFiles - images.length
    const toProcess = Array.from(files).slice(0, remaining)
    for (const file of toProcess) {
      if (file.size > 5 * 1024 * 1024) continue
      const reader = new FileReader()
      reader.onload = (ev) => {
        const result = ev.target?.result
        if (result && typeof result === 'string') {
          setImages((prev) => [...prev, result])
        }
      }
      reader.readAsDataURL(file)
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!text && images.length === 0) return

    const now = new Date().toISOString()
    const post: SocialPost = {
      id: editPost?.id ?? `post_${Date.now()}`,
      campaignId,
      title: text.slice(0, 80),
      text,
      images,
      platform,
      scheduledAt:
        scheduleType === 'schedule' && scheduledDate ? new Date(scheduledDate).toISOString() : null,
      publishedAt: null,
      status: scheduleType === 'now' ? 'draft' : 'scheduled',
      facebookPostId: null,
      instagramPostId: null,
      createdAt: editPost?.createdAt ?? now,
    }

    if (editPost) {
      updatePost(post.id, post)
    } else {
      addPost(post)
    }
    onClose()
  }

  return (
    <form className='post-creator' onSubmit={handleSubmit}>
      <h3>{editPost ? 'Editar post' : 'Nuevo post'}</h3>

      <div className='post-creator__field'>
        <label htmlFor='post-text'>Texto</label>
        <textarea
          id='post-text'
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder='Escribí el contenido del post...'
          maxLength={2200}
        />
        <span className='post-creator__counter'>{text.length}/2200</span>
      </div>

      <div className='post-creator__field'>
        <label htmlFor='post-images'>Imágenes (máx 10, hasta 5MB c/u)</label>
        <div className='post-creator__images'>
          {images.map((img) => (
            <div key={img.slice(-40)} className='post-creator__img-preview'>
              <img src={img} alt='' />
              <button
                type='button'
                onClick={() => removeImage(images.indexOf(img))}
                className='post-creator__img-remove'
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        {images.length < 10 && (
          <input
            ref={fileInputRef}
            type='file'
            accept='image/jpeg,image/png,image/webp'
            multiple
            onChange={handleImageUpload}
            className='post-creator__file-input'
          />
        )}
      </div>

      <div className='post-creator__field'>
        <label htmlFor='post-platform'>Plataforma</label>
        <select
          id='post-platform'
          value={platform}
          onChange={(e) => setPlatform(e.target.value as SocialPost['platform'])}
        >
          {SOCIAL_POST_PLATFORMS.map((p) => (
            <option key={p} value={p}>
              {p === 'facebook'
                ? 'Facebook'
                : p === 'instagram'
                  ? 'Instagram'
                  : 'Facebook + Instagram'}
            </option>
          ))}
        </select>
      </div>

      <div className='post-creator__field'>
        <label htmlFor='post-campaign'>Campaña</label>
        <select
          id='post-campaign'
          value={campaignId}
          onChange={(e) => setCampaignId(e.target.value)}
        >
          <option value=''>Sin campaña</option>
          {campaigns.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className='post-creator__field'>
        <fieldset className='post-creator__schedule'>
          <legend className='post-creator__legend'>Programación</legend>
          <label className='post-creator__radio'>
            <input
              type='radio'
              name='schedule'
              checked={scheduleType === 'now'}
              onChange={() => setScheduleType('now')}
            />
            Publicar ahora
          </label>
          <label className='post-creator__radio'>
            <input
              type='radio'
              name='schedule'
              checked={scheduleType === 'schedule'}
              onChange={() => setScheduleType('schedule')}
            />
            Programar
          </label>
        </fieldset>
        {scheduleType === 'schedule' && (
          <input
            type='datetime-local'
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            className='post-creator__datetime'
          />
        )}
      </div>

      <div className='post-creator__actions'>
        <button className='btn-secondary' type='button' onClick={onClose}>
          Cancelar
        </button>
        <button className='btn-primary' type='submit'>
          {editPost ? 'Guardar cambios' : scheduleType === 'now' ? 'Guardar borrador' : 'Programar'}
        </button>
      </div>
    </form>
  )
}
