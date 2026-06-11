import { useEffect, useState } from 'react'
import { useCMSStore } from '@/stores/cmsStore'
import type { TwoFactorSetup as TwoFactorSetupType } from '@/types/cms'

export default function TwoFactorSetup() {
  const { twoFactor, fetch2FAStatus, setup2FA, verify2FA, error, resetError } = useCMSStore()
  const [step, setStep] = useState<'idle' | 'setup' | 'verify'>('idle')
  const [setupData, setSetupData] = useState<TwoFactorSetupType | null>(null)
  const [token, setToken] = useState('')
  const [showCodes, setShowCodes] = useState(false)
  const [verified, setVerified] = useState(false)

  useEffect(() => {
    fetch2FAStatus()
  }, [fetch2FAStatus])

  const handleSetup = async () => {
    const data = await setup2FA()
    setSetupData(data)
    setStep('setup')
  }

  const handleVerify = async () => {
    const ok = await verify2FA(token)
    if (ok) {
      setVerified(true)
      setStep('verify')
      fetch2FAStatus()
    }
  }

  if (twoFactor.enabled && !verified) {
    return (
      <div className='admin-2fa-section'>
        <h2>Autenticación de Dos Factores</h2>
        <div className='twofa-status enabled'>
          <span className='twofa-badge'>✅ 2FA activo</span>
          <p>La autenticación de dos factores está habilitada en tu cuenta.</p>
        </div>
      </div>
    )
  }

  return (
    <div className='admin-2fa-section'>
      <h2>Autenticación de Dos Factores</h2>
      {error && (
        <div className='admin-error'>
          {error}
          <button onClick={resetError} type='button'>
            ×
          </button>
        </div>
      )}

      {step === 'idle' && (
        <div className='twofa-setup-intro'>
          <p>Protege tu panel de administración con 2FA.</p>
          <p>
            Necesitarás una app como <strong>Google Authenticator</strong> o <strong>Authy</strong>.
          </p>
          <button className='btn-primary' onClick={handleSetup} type='button'>
            Configurar 2FA
          </button>
        </div>
      )}

      {step === 'setup' && setupData && (
        <div className='twofa-setup-step'>
          <h3>Escanea el código QR</h3>
          <div className='twofa-qr'>
            <img src={setupData.qr} alt='Código QR para 2FA' />
          </div>
          <p className='twofa-secret'>
            O ingresa manualmente: <code>{setupData.secret}</code>
          </p>
          <div className='form-group'>
            <label htmlFor='2fa-token'>Código de verificación (6 dígitos)</label>
            <input
              id='2fa-token'
              value={token}
              onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder='000000'
              maxLength={6}
            />
          </div>
          <button
            className='btn-primary'
            onClick={handleVerify}
            disabled={token.length !== 6}
            type='button'
          >
            Verificar
          </button>
          <div className='twofa-backup-codes-section'>
            <button className='btn-ghost' onClick={() => setShowCodes(!showCodes)} type='button'>
              {showCodes ? 'Ocultar' : 'Mostrar'} códigos de respaldo
            </button>
            {showCodes && (
              <div className='twofa-backup-codes'>
                <p>Guarda estos códigos en un lugar seguro. Cada uno solo puede usarse una vez.</p>
                <ul>
                  {setupData.backupCodes.map((code) => (
                    <li key={code}>
                      <code>{code}</code>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {step === 'verify' && verified && (
        <div className='twofa-success'>
          <span className='twofa-success-icon'>🔒</span>
          <h3>2FA activado correctamente</h3>
          <p>Tu panel ahora está protegido con autenticación de dos factores.</p>
          {setupData?.backupCodes && (
            <div className='twofa-backup-codes-section'>
              <button className='btn-ghost' onClick={() => setShowCodes(!showCodes)} type='button'>
                {showCodes ? 'Ocultar' : 'Mostrar'} códigos de respaldo
              </button>
              {showCodes && (
                <div className='twofa-backup-codes'>
                  <ul>
                    {setupData.backupCodes.map((code) => (
                      <li key={code}>
                        <code>{code}</code>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
