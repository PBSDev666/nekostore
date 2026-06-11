import { useState } from 'react'
import type { SocialCampaign } from '@/types/social'
import { SOCIAL_CAMPAIGN_OBJECTIVES } from '@/types/social'

interface CampaignFormProps {
  onSubmit: (campaign: SocialCampaign) => void
  onCancel: () => void
  initial?: SocialCampaign
}

export default function CampaignForm({ onSubmit, onCancel, initial }: CampaignFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [startDate, setStartDate] = useState(initial?.startDate ?? '')
  const [endDate, setEndDate] = useState(initial?.endDate ?? '')
  const [objective, setObjective] = useState<SocialCampaign['objective']>(
    initial?.objective ?? 'engagement',
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !startDate || !endDate) return
    onSubmit({
      id: initial?.id ?? `camp_${Date.now()}`,
      name,
      description,
      startDate,
      endDate,
      objective,
      status: initial?.status ?? 'draft',
      createdAt: initial?.createdAt ?? new Date().toISOString(),
    })
  }

  return (
    <form className='campaign-form' onSubmit={handleSubmit}>
      <div className='campaign-form__field'>
        <label htmlFor='camp-name'>Nombre de la campaña</label>
        <input
          id='camp-name'
          type='text'
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder='Ej: Lanzamiento Shadow Bloom'
        />
      </div>
      <div className='campaign-form__field'>
        <label htmlFor='camp-desc'>Descripción</label>
        <textarea
          id='camp-desc'
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder='Objetivos y notas de la campaña...'
        />
      </div>
      <div className='campaign-form__row'>
        <div className='campaign-form__field'>
          <label htmlFor='camp-start'>Inicio</label>
          <input
            id='camp-start'
            type='date'
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>
        <div className='campaign-form__field'>
          <label htmlFor='camp-end'>Fin</label>
          <input
            id='camp-end'
            type='date'
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>
      </div>
      <div className='campaign-form__field'>
        <label htmlFor='camp-obj'>Objetivo</label>
        <select
          id='camp-obj'
          value={objective}
          onChange={(e) => setObjective(e.target.value as SocialCampaign['objective'])}
        >
          {SOCIAL_CAMPAIGN_OBJECTIVES.map((o) => (
            <option key={o} value={o}>
              {o === 'awareness' ? 'Notoriedad' : o === 'engagement' ? 'Engagement' : 'Ventas'}
            </option>
          ))}
        </select>
      </div>
      <div className='campaign-form__actions'>
        <button className='btn-secondary' type='button' onClick={onCancel}>
          Cancelar
        </button>
        <button className='btn-primary' type='submit'>
          {initial ? 'Guardar cambios' : 'Crear campaña'}
        </button>
      </div>
    </form>
  )
}
