import { useState } from 'react'
import { api } from '@/services/api'
import { cmsApi } from '@/services/cmsApi'
import { useAuthStore } from '@/stores/authStore'

export default function AdminLogin() {
  const setApiSession = useAuthStore((s) => s.setApiSession)
  const [identifier, setIdentifier] = useState('admin@nekostore.cr')
  const [password, setPassword] = useState('')
  const [adminId, setAdminId] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.auth.login(identifier, password)
      if (res.requires2FA && res.adminId) {
        setAdminId(res.adminId)
        return
      }
      if (!res.token) {
        setError('El servidor no devolvio sesion admin.')
        return
      }
      setApiSession(res.token, res.user)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesion.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify2FA = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await cmsApi.twoFactor.login(adminId, code)
      setApiSession(res.token, res.user)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Codigo 2FA invalido.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='admin-login'>
      <div className='login-card admin-login__card'>
        <div className='section-eyebrow' style={{ textAlign: 'center' }}>
          Admin
        </div>
        <h1 className='section-title' style={{ textAlign: 'center', marginBottom: '18px' }}>
          Panel NEKO
        </h1>
        <p className='login-desc'>
          Acceso restringido. Si 2FA esta activo, el codigo es obligatorio antes de entrar.
        </p>

        {error && <div className='admin-error'>{error}</div>}

        {!adminId ? (
          <>
            <div className='form-group'>
              <label htmlFor='admin-identifier'>Email o telefono</label>
              <input
                id='admin-identifier'
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete='username'
              />
            </div>
            <div className='form-group'>
              <label htmlFor='admin-password'>Contrasena</label>
              <input
                id='admin-password'
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete='current-password'
              />
            </div>
            <button
              className='btn-primary btn-full'
              onClick={handleLogin}
              disabled={loading || !identifier || !password}
              type='button'
            >
              {loading ? 'Validando...' : 'Entrar'}
            </button>
          </>
        ) : (
          <>
            <div className='form-group'>
              <label htmlFor='admin-2fa-code'>Codigo 2FA</label>
              <input
                id='admin-2fa-code'
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\s/g, '').slice(0, 10))}
                autoComplete='one-time-code'
              />
            </div>
            <button
              className='btn-primary btn-full'
              onClick={handleVerify2FA}
              disabled={loading || code.length < 6}
              type='button'
            >
              {loading ? 'Verificando...' : 'Verificar 2FA'}
            </button>
            <button className='btn-ghost' onClick={() => setAdminId('')} type='button'>
              Volver
            </button>
          </>
        )}

        <p className='admin-login__hint'>Usa las credenciales admin configuradas para NEKO.</p>
      </div>
    </div>
  )
}
