import type { SocialPost } from '@/types/social'

interface PostCardProps {
  post: SocialPost
  campaignName?: string
  onEdit: () => void
  onDelete: () => void
  onPublish: () => void
}

const PLATFORM_ICONS: Record<string, string> = {
  facebook: '📘',
  instagram: '📷',
  both: '📘📷',
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  scheduled: 'Programado',
  published: 'Publicado',
  failed: 'Falló',
}

export default function PostCard({
  post,
  campaignName,
  onEdit,
  onDelete,
  onPublish,
}: PostCardProps) {
  return (
    <div className={`post-card post-card--${post.status}`}>
      <div className='post-card__header'>
        <span className='post-card__platform'>{PLATFORM_ICONS[post.platform]}</span>
        <span className={`post-status post-status--${post.status}`}>
          {STATUS_LABELS[post.status]}
        </span>
      </div>
      {post.images.length > 0 && (
        <div className='post-card__images'>
          {post.images.slice(0, 3).map((img) => (
            <img key={img} src={img} alt='' className='post-card__thumb' />
          ))}
          {post.images.length > 3 && (
            <span className='post-card__more'>+{post.images.length - 3}</span>
          )}
        </div>
      )}
      <p className='post-card__text'>
        {post.text.length > 120 ? `${post.text.slice(0, 120)}...` : post.text}
      </p>
      <div className='post-card__meta'>
        {campaignName && <span className='post-card__campaign'>{campaignName}</span>}
        {post.scheduledAt && (
          <span className='post-card__date'>
            {new Date(post.scheduledAt).toLocaleDateString('es-CR', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        )}
      </div>
      {post.status === 'draft' && (
        <div className='post-card__actions'>
          <button className='btn-small btn-outline' onClick={onEdit} type='button'>
            Editar
          </button>
          <button className='btn-primary btn-small' onClick={onPublish} type='button'>
            Publicar
          </button>
          <button className='btn-small btn-outline btn-danger' onClick={onDelete} type='button'>
            Eliminar
          </button>
        </div>
      )}
      {post.status === 'scheduled' && (
        <div className='post-card__actions'>
          <button className='btn-small btn-outline' onClick={onEdit} type='button'>
            Editar
          </button>
          <button className='btn-small btn-outline btn-danger' onClick={onDelete} type='button'>
            Cancelar
          </button>
        </div>
      )}
    </div>
  )
}
