import { useEffect, useState } from 'react'
import LoyaltyCard from '@/components/loyalty/LoyaltyCard'
import { cmsApi } from '@/services/cmsApi'
import { useAuthStore } from '@/stores/authStore'
import { formatCRPhone } from '@/utils/formatters'
import AccountTabs from './AccountTabs'
import OrderHistory from './OrderHistory'
import StatsGrid from './StatsGrid'

export default function AccountDashboard() {
  const getCurrentCustomer = useAuthStore((s) => s.getCurrentCustomer)
  const fetchCurrentCustomer = useAuthStore((s) => s.fetchCurrentCustomer)
  const logout = useAuthStore((s) => s.logout)
  const customer = getCurrentCustomer()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [password, setPassword] = useState('')
  const [passwordStatus, setPasswordStatus] = useState('')

  useEffect(() => {
    fetchCurrentCustomer().catch(() => logout())
  }, [fetchCurrentCustomer, logout])

  if (!customer) return null

  const passwordLevel =
    password.length >= 6 && /[A-Za-z]/.test(password) && /\d/.test(password)
      ? 'fuerte'
      : password.length >= 6
        ? 'medio'
        : 'bajo'

  const tabs = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'NEKO',
      content: (
        <div className='account-grid'>
          <StatsGrid customer={customer} />
          <div className='account-orders'>
            <h3 className='account-section-title'>Ordenes Recientes</h3>
            <OrderHistory orders={customer.orders} />
          </div>
        </div>
      ),
    },
    {
      id: 'loyalty',
      label: 'Lealtad',
      icon: '*',
      content: <LoyaltyCard />,
    },
    {
      id: 'security',
      label: 'Seguridad',
      icon: '2FA',
      content: (
        <div className='account-security'>
          <h3 className='account-section-title'>Seguridad de cuenta</h3>
          <p className='login-desc'>
            Tu ingreso como cliente siempre usa OTP por WhatsApp. La sesion queda guardada por 30
            dias en este dispositivo.
          </p>
          <div className='form-group'>
            <label htmlFor='customer-password'>Contrasena opcional</label>
            <input
              id='customer-password'
              type='password'
              value={password}
              minLength={6}
              maxLength={8}
              autoComplete='new-password'
              onChange={(e) => setPassword(e.target.value.slice(0, 8))}
              placeholder='6 a 8 caracteres'
            />
          </div>
          <p className='password-strength'>Nivel: {passwordLevel}</p>
          <button
            className='btn-primary btn-small'
            type='button'
            disabled={password.length < 6}
            onClick={async () => {
              setPasswordStatus('')
              try {
                await cmsApi.customerAuth.setPassword(password)
                setPassword('')
                setPasswordStatus('Contrasena guardada.')
              } catch (err) {
                setPasswordStatus(err instanceof Error ? err.message : 'No se pudo guardar.')
              }
            }}
          >
            Guardar contrasena
          </button>
          {passwordStatus && <p className='login-desc'>{passwordStatus}</p>}
        </div>
      ),
    },
  ]

  return (
    <div className='section active section-block'>
      <div className='account-header'>
        <div className='account-avatar'>
          {customer.name ? customer.name.charAt(0).toUpperCase() : '?'}
        </div>
        <div className='account-info'>
          <h2>{customer.name || 'Sin nombre'}</h2>
          <p>{formatCRPhone(customer.phone)}</p>
          <button
            onClick={logout}
            style={{
              background: 'none',
              border: '1px solid var(--border-2)',
              color: 'var(--text-muted)',
              padding: '4px 12px',
              fontFamily: 'Space Mono, monospace',
              fontSize: '9px',
              cursor: 'pointer',
              marginTop: '8px',
            }}
            type='button'
          >
            Cerrar sesion
          </button>
        </div>
      </div>
      <AccountTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
