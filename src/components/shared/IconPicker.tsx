import { useState } from 'react'
import { ICON_CATALOG } from '@/data/icons'

interface IconPickerProps {
  selected: string
  onSelect: (icon: string) => void
  label?: string
}

export default function IconPicker({ selected, onSelect, label }: IconPickerProps) {
  const [open, setOpen] = useState(false)
  const [categoryIndex, setCategoryIndex] = useState(0)

  return (
    <div className='icon-picker'>
      {label && <span className='icon-picker__label'>{label}</span>}
      <button type='button' className='icon-picker__trigger' onClick={() => setOpen(!open)}>
        <span className='icon-picker__preview'>{selected || '🔮'}</span>
        <span className='icon-picker__arrow'>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className='icon-picker__dropdown'>
          <div className='icon-picker__categories'>
            {ICON_CATALOG.map((cat, i) => (
              <button
                key={cat.name}
                type='button'
                className={`icon-picker__cat-btn ${i === categoryIndex ? 'active' : ''}`}
                onClick={() => setCategoryIndex(i)}
              >
                {cat.name}
              </button>
            ))}
          </div>
          <div className='icon-picker__grid'>
            {ICON_CATALOG[categoryIndex]?.icons.map((icon) => (
              <button
                key={icon}
                type='button'
                className={`icon-picker__item ${icon === selected ? 'selected' : ''}`}
                onClick={() => {
                  onSelect(icon)
                  setOpen(false)
                }}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
