import { useState } from 'react'
import { useSocialStore } from '@/stores/socialStore'
import type { SocialCampaign } from '@/types/social'
import CampaignForm from './CampaignForm'

const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  active: 'Activa',
  paused: 'Pausada',
  finished: 'Finalizada',
}

export default function CampaignList() {
  const campaigns = useSocialStore((s) => s.campaigns)
  const addCampaign = useSocialStore((s) => s.addCampaign)
  const updateCampaign = useSocialStore((s) => s.updateCampaign)
  const removeCampaign = useSocialStore((s) => s.removeCampaign)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)

  const editingCampaign = editing ? campaigns.find((c) => c.id === editing) : undefined

  const handleSubmit = (camp: SocialCampaign) => {
    if (editing) {
      updateCampaign(camp.id, camp)
      setEditing(null)
    } else {
      addCampaign(camp)
    }
    setShowForm(false)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditing(null)
  }

  return (
    <div className='social-section'>
      <div className='social-section__header'>
        <h3>Campañas</h3>
        {!showForm && (
          <button className='btn-primary btn-small' onClick={() => setShowForm(true)} type='button'>
            + Nueva campaña
          </button>
        )}
      </div>

      {showForm && (
        <CampaignForm onSubmit={handleSubmit} onCancel={handleCancel} initial={editingCampaign} />
      )}

      {campaigns.length === 0 && !showForm && (
        <p className='social-empty'>
          No hay campañas todavía. Creá tu primera campaña para empezar.
        </p>
      )}

      <div className='campaign-list'>
        {campaigns.map((c) => (
          <div key={c.id} className='campaign-card'>
            <div className='campaign-card__header'>
              <span className={`campaign-status campaign-status--${c.status}`}>
                {STATUS_LABELS[c.status]}
              </span>
              <div className='campaign-card__actions'>
                <button
                  className='btn-small btn-outline'
                  onClick={() => {
                    setEditing(c.id)
                    setShowForm(true)
                  }}
                  type='button'
                >
                  Editar
                </button>
                <button
                  className='btn-small btn-outline btn-danger'
                  onClick={() => removeCampaign(c.id)}
                  type='button'
                >
                  Eliminar
                </button>
              </div>
            </div>
            <h4 className='campaign-card__name'>{c.name}</h4>
            {c.description && <p className='campaign-card__desc'>{c.description}</p>}
            <div className='campaign-card__meta'>
              <span>
                📅 {c.startDate} → {c.endDate}
              </span>
              <span>
                🎯{' '}
                {c.objective === 'awareness'
                  ? 'Notoriedad'
                  : c.objective === 'engagement'
                    ? 'Engagement'
                    : 'Ventas'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
