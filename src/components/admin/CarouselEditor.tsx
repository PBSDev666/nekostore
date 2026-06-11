import { useEffect, useState } from 'react'
import { useCMSStore } from '@/stores/cmsStore'
import type { CarouselItem } from '@/types/cms'

export default function CarouselEditor() {
  const {
    carousel,
    loading,
    fetchCarousel,
    createCarouselItem,
    updateCarouselItem,
    deleteCarouselItem,
    error,
    resetError,
  } = useCMSStore()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<CarouselItem>>({
    image_url: '',
    title: '',
    subtitle: '',
    link: '',
    link_text: 'Ver más',
    active: true,
    sort_order: 0,
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (carousel.length === 0) fetchCarousel()
  }, [fetchCarousel, carousel.length])

  const resetForm = () => {
    setForm({
      image_url: '',
      title: '',
      subtitle: '',
      link: '',
      link_text: 'Ver más',
      active: true,
      sort_order: 0,
    })
    setEditingId(null)
    setShowForm(false)
  }

  const handleEdit = (item: CarouselItem) => {
    setForm({ ...item })
    setEditingId(item.id)
    setShowForm(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (editingId) {
        await updateCarouselItem(editingId, form)
      } else {
        await createCarouselItem(form as CarouselItem)
      }
      resetForm()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Eliminar este slide del carrusel?')) {
      await deleteCarouselItem(id)
    }
  }

  const handleToggleActive = async (item: CarouselItem) => {
    await updateCarouselItem(item.id, { active: !item.active })
  }

  return (
    <div className='admin-carousel-editor'>
      <div className='carousel-editor-header'>
        <h2>Carrusel</h2>
        <button
          className='btn-primary btn-small'
          onClick={() => {
            resetForm()
            setShowForm(true)
          }}
          type='button'
        >
          + Nuevo slide
        </button>
      </div>
      {error && (
        <div className='admin-error'>
          {error}
          <button onClick={resetError} type='button'>
            ×
          </button>
        </div>
      )}

      {showForm && (
        <div className='carousel-form'>
          <h3>{editingId ? 'Editar slide' : 'Nuevo slide'}</h3>
          <div className='form-group'>
            <label htmlFor='car-img'>URL de imagen</label>
            <input
              id='car-img'
              value={form.image_url ?? ''}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            />
          </div>
          <div className='form-group'>
            <label htmlFor='car-title'>Título</label>
            <input
              id='car-title'
              value={form.title ?? ''}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className='form-group'>
            <label htmlFor='car-sub'>Subtítulo</label>
            <input
              id='car-sub'
              value={form.subtitle ?? ''}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
            />
          </div>
          <div className='form-group'>
            <label htmlFor='car-link'>Link</label>
            <input
              id='car-link'
              value={form.link ?? ''}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
            />
          </div>
          <div className='form-group'>
            <label htmlFor='car-linktext'>Texto del botón</label>
            <input
              id='car-linktext'
              value={form.link_text ?? ''}
              onChange={(e) => setForm({ ...form, link_text: e.target.value })}
            />
          </div>
          <div className='form-row'>
            <div className='form-group'>
              <label htmlFor='car-order'>Orden</label>
              <input
                id='car-order'
                type='number'
                value={form.sort_order ?? 0}
                onChange={(e) =>
                  setForm({ ...form, sort_order: parseInt(e.target.value, 10) || 0 })
                }
              />
            </div>
            <div className='form-group checkbox-group'>
              <label>
                <input
                  type='checkbox'
                  checked={form.active ?? true}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                />
                Activo
              </label>
            </div>
          </div>
          <div className='car-form-actions'>
            <button
              className='btn-primary btn-small'
              onClick={handleSave}
              disabled={saving}
              type='button'
            >
              {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
            </button>
            <button className='btn-secondary btn-small' onClick={resetForm} type='button'>
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className='carousel-items-list'>
        {loading ? (
          <p className='cms-loading'>Cargando...</p>
        ) : carousel.length === 0 ? (
          <p className='cms-empty'>No hay slides en el carrusel.</p>
        ) : (
          carousel
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((item) => (
              <div key={item.id} className={`carousel-item-row ${!item.active ? 'inactive' : ''}`}>
                <div
                  className='car-item-preview'
                  style={{ backgroundImage: `url(${item.image_url})` }}
                />
                <div className='car-item-info'>
                  <strong>{item.title}</strong>
                  <span>{item.subtitle}</span>
                  <small>Orden: {item.sort_order}</small>
                </div>
                <div className='car-item-actions'>
                  <button
                    className={`btn-small ${item.active ? 'btn-warning' : 'btn-primary'}`}
                    onClick={() => handleToggleActive(item)}
                    type='button'
                  >
                    {item.active ? 'Desactivar' : 'Activar'}
                  </button>
                  <button
                    className='btn-ghost btn-small'
                    onClick={() => handleEdit(item)}
                    type='button'
                  >
                    Editar
                  </button>
                  <button
                    className='btn-danger btn-small'
                    onClick={() => handleDelete(item.id)}
                    type='button'
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  )
}
