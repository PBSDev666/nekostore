import { useEffect, useState } from 'react'
import { computeEngagementSummary } from '@/services/socialApi'
import { useSocialStore } from '@/stores/socialStore'

export default function EngagementMetrics() {
  const postAnalytics = useSocialStore((s) => s.postAnalytics)
  const refreshMetrics = useSocialStore((s) => s.refreshMetrics)
  const posts = useSocialStore((s) => s.posts)
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState<ReturnType<typeof computeEngagementSummary> | null>(null)

  const publishedPosts = posts.filter((p) => p.status === 'published')

  useEffect(() => {
    if (publishedPosts.length === 0) return
    const analyticsArray = Object.values(postAnalytics)
    if (analyticsArray.length > 0) {
      setSummary(computeEngagementSummary(analyticsArray))
    }
  }, [postAnalytics, publishedPosts.length])

  const handleRefresh = async () => {
    setLoading(true)
    await refreshMetrics()
    setLoading(false)
  }

  return (
    <div className='social-section'>
      <div className='social-section__header'>
        <h3>Métricas de Engagement</h3>
        {publishedPosts.length > 0 && (
          <button
            className='btn-small btn-outline'
            onClick={handleRefresh}
            disabled={loading}
            type='button'
          >
            {loading ? 'Cargando...' : 'Actualizar métricas'}
          </button>
        )}
      </div>

      {publishedPosts.length === 0 ? (
        <p className='social-empty'>
          No hay posts publicados todavía. Las métricas aparecerán cuando publiques contenido.
        </p>
      ) : summary ? (
        <>
          <div className='metrics-grid'>
            <div className='metrics-card'>
              <span className='metrics-card__value'>{summary.totalReach.toLocaleString()}</span>
              <span className='metrics-card__label'>Alcance total</span>
            </div>
            <div className='metrics-card'>
              <span className='metrics-card__value'>
                {summary.totalImpressions.toLocaleString()}
              </span>
              <span className='metrics-card__label'>Impresiones</span>
            </div>
            <div className='metrics-card'>
              <span className='metrics-card__value'>
                {summary.totalInteractions.toLocaleString()}
              </span>
              <span className='metrics-card__label'>Interacciones</span>
            </div>
            <div className='metrics-card'>
              <span className='metrics-card__value'>{summary.engagementRate}%</span>
              <span className='metrics-card__label'>Tasa de engagement</span>
            </div>
          </div>

          <div className='metrics-section'>
            <h4>Mejor hora para publicar</h4>
            <p className='metrics-best-time'>{summary.bestTime}</p>
          </div>

          <div className='metrics-section'>
            <h4>Top Posts</h4>
            <div className='metrics-top-posts'>
              {summary.topPosts.map((tp, i) => {
                const post = posts.find((p) => p.id === tp.postId)
                return (
                  <div key={tp.postId} className='metrics-top-item'>
                    <span className='metrics-top-rank'>#{i + 1}</span>
                    <span className='metrics-top-text'>
                      {post ? post.text.slice(0, 80) : tp.postId}
                      {post && post.text.length > 80 ? '...' : ''}
                    </span>
                    <span className='metrics-top-reach'>{tp.reach} alcance</span>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      ) : (
        <p className='social-empty'>Hacé clic en "Actualizar métricas" para cargar los datos.</p>
      )}
    </div>
  )
}
