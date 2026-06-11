import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useInstallPrompt } from '@/hooks/useInstallPrompt'
import { useAuthStore } from '@/stores/authStore'
import { useCartStore } from '@/stores/cartStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { useUIStore } from '@/stores/uiStore'
import ThemeToggle from './ThemeToggle'

const NAV_LINKS = [
  { path: '/', label: 'Inicio', section: 'home' },
  { path: '/tienda', label: 'Tienda', section: 'shop' },
  { path: '/recompensas', label: 'Recompensas', section: 'loyalty' },
  { path: '/contacto', label: 'Contacto', section: 'contact' },
  { path: '/nosotros', label: 'Nosotros', section: 'about' },
]

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const { canInstall, install } = useInstallPrompt()
  const token = useAuthStore((s) => s.token)
  const itemCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0))
  const unreadCount = useNotificationStore((s) => s.unreadCount())
  const toggleCart = useUIStore((s) => s.toggleCart)
  const toggleNotif = useUIStore((s) => s.toggleNotif)

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  const goTo = (path: string) => {
    navigate(path)
    setMenuOpen(false)
  }

  return (
    <nav className={`navbar ${menuOpen ? 'navbar--open' : ''}`} aria-label='Navegación principal'>
      <button className='navbar__logo' onClick={() => goTo('/')} type='button'>
        <img className='logo-mark' src='/brand/neko-logo-cat.png' alt='' aria-hidden='true' />
        <img className='logo-wordmark' src='/brand/neko-logo-text.png' alt='Neko Store' />
      </button>

      <button
        className='navbar__menu-toggle'
        type='button'
        aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={menuOpen}
        aria-controls='primary-navigation'
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span className='navbar__menu-line navbar__menu-line--top' />
        <span className='navbar__menu-line navbar__menu-line--middle' />
        <span className='navbar__menu-line navbar__menu-line--bottom' />
      </button>

      <div id='primary-navigation' className='navbar__links'>
        {NAV_LINKS.map((link) => (
          <button
            key={link.path}
            className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
            onClick={() => goTo(link.path)}
            type='button'
          >
            {link.label}
          </button>
        ))}
      </div>

      <div className='navbar__actions'>
        <ThemeToggle />
        {canInstall && (
          <button className='btn-install' onClick={install} title='Instalar app' type='button'>
            <svg
              width='18'
              height='18'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='1.5'
              aria-hidden='true'
            >
              <path d='M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4' />
              <polyline points='7 10 12 15 17 10' />
              <line x1='12' y1='15' x2='12' y2='3' />
            </svg>
            <span>Instalar app</span>
          </button>
        )}
        {token && (
          <button className='btn-icon' onClick={toggleNotif} title='Notificaciones' type='button'>
            <svg
              width='18'
              height='18'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='1.5'
              aria-hidden='true'
            >
              <path d='M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9' />
              <path d='M13.73 21a2 2 0 01-3.46 0' />
            </svg>
            {unreadCount > 0 && <span className='notif-badge'>{unreadCount}</span>}
          </button>
        )}
        <button
          className='btn-icon'
          onClick={() => goTo('/cuenta')}
          title='Mi cuenta'
          type='button'
        >
          <svg
            width='18'
            height='18'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.5'
            aria-hidden='true'
          >
            <path d='M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2' />
            <circle cx='12' cy='7' r='4' />
          </svg>
        </button>
        <button className='btn-icon' onClick={toggleCart} title='Carrito' type='button'>
          <svg
            width='18'
            height='18'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.5'
            aria-hidden='true'
          >
            <path d='M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z' />
            <line x1='3' y1='6' x2='21' y2='6' />
            <path d='M16 10a4 4 0 01-8 0' />
          </svg>
          <span className='cart-badge'>{itemCount}</span>
        </button>
      </div>
    </nav>
  )
}
