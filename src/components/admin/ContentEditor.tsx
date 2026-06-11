import { useEffect, useState } from 'react'
import { useCMSStore } from '@/stores/cmsStore'

const SECTIONS = [
  { id: 'hero', label: 'Hero' },
  { id: 'about', label: 'Nosotros' },
  { id: 'catalog', label: 'Catálogo' },
  { id: 'footer', label: 'Footer' },
]

export default function ContentEditor() {
  const { content, loading, fetchContent, updateContent, resetError, error } = useCMSStore()
  const [activeSection, setActiveSection] = useState('hero')
  const [editing, setEditing] = useState<{ section: string; key: string } | null>(null)
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (Object.keys(content).length === 0) fetchContent()
  }, [fetchContent, content])

  const handleEdit = (section: string, key: string, value: string) => {
    setEditing({ section, key })
    setEditValue(value)
  }

  const handleSave = async () => {
    if (!editing) return
    setSaving(true)
    await updateContent(editing.section, editing.key, { value: editValue })
    setSaving(false)
    setEditing(null)
  }

  const sectionData = content[activeSection] ?? {}

  return (
    <div className='admin-cms-editor'>
      <h2>Editor de Contenido</h2>
      {error && (
        <div className='admin-error'>
          {error}
          <button onClick={resetError} type='button'>
            ×
          </button>
        </div>
      )}
      <div className='admin-cms-tabs'>
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            className={`cms-tab ${activeSection === s.id ? 'active' : ''}`}
            onClick={() => setActiveSection(s.id)}
            type='button'
          >
            {s.label}
          </button>
        ))}
      </div>
      <div className='cms-fields'>
        {loading ? (
          <p className='cms-loading'>Cargando...</p>
        ) : Object.keys(sectionData).length === 0 ? (
          <p className='cms-empty'>Esta sección no tiene campos editables.</p>
        ) : (
          Object.entries(sectionData).map(([key, val]) => (
            <div key={key} className='cms-field-row'>
              <label className='cms-field-label' htmlFor={`cms-${activeSection}-${key}`}>
                {key.replace(/_/g, ' ')}
              </label>
              <div className='cms-field-input-row'>
                {editing?.section === activeSection && editing?.key === key ? (
                  <>
                    <input
                      id={`cms-${activeSection}-${key}`}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className='cms-input'
                    />
                    <button
                      className='btn-primary btn-small'
                      onClick={handleSave}
                      disabled={saving}
                      type='button'
                    >
                      {saving ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button
                      className='btn-secondary btn-small'
                      onClick={() => setEditing(null)}
                      type='button'
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <span className='cms-value'>{val.value}</span>
                    <button
                      className='btn-ghost btn-small'
                      onClick={() => handleEdit(activeSection, key, val.value)}
                      type='button'
                    >
                      Editar
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
