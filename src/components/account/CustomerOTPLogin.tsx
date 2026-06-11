import { useState } from 'react'
import { cmsApi } from '@/services/cmsApi'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationStore } from '@/stores/notificationStore'

export default function CustomerOTPLogin() {
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'phone' | 'code'>('phone')
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)

  const pushNotif = useNotificationStore((s) => s.push)
  const setApiSession = useAuthStore((s) => s.setApiSession)
  const fetchCurrentCustomer = useAuthStore((s) => s.fetchCurrentCustomer)

  const handleSendCode = async () => {
    const clean = phone.replace(/\D/g, '')
    if (clean.length !== 8) {
      pushNotif({ icon: '!', title: 'Numero invalido', msg: 'Debe ser 8 digitos', type: 'warning' })
      return
    }
    setSending(true)
    try {
      const result = await cmsApi.customerAuth.sendCode(clean)
      setStep('code')
      pushNotif({
        icon: 'WA',
        title: result.delivery === 'manual' ? 'Codigo pendiente' : 'Codigo enviado',
        msg: result.message,
        type: result.delivery === 'manual' ? 'warning' : 'success',
      })
    } catch (err) {
      pushNotif({ icon: '!', title: 'Error', msg: (err as Error).message, type: 'error' })
    } finally {
      setSending(false)
    }
  }

  const handleVerifyCode = async () => {
    const clean = phone.replace(/\D/g, '')
    if (code.length < 4) return
    setVerifying(true)
    try {
      const session = await cmsApi.customerAuth.verifyCode(clean, code)
      setApiSession(session.token, session.user)
      await fetchCurrentCustomer()
      pushNotif({ icon: 'OK', title: 'Bienvenida', msg: 'Sesion iniciada', type: 'success' })
    } catch (err) {
      pushNotif({ icon: '!', title: 'Codigo invalido', msg: (err as Error).message, type: 'error' })
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className='otp-login-wrap'>
      {step === 'phone' ? (
        <>
          <h3>Entrar o registrarte con WhatsApp</h3>
          <p>Te enviaremos un codigo OTP. La cuenta se crea automaticamente al validarlo.</p>
          <div className='form-group'>
            <label htmlFor='otp-phone'>Numero (+506)</label>
            <input
              id='otp-phone'
              type='tel'
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder='2424-7171'
            />
          </div>
          <button
            className='btn-primary btn-full'
            onClick={handleSendCode}
            disabled={sending}
            type='button'
          >
            {sending ? 'Enviando...' : 'Enviar codigo por WhatsApp'}
          </button>
        </>
      ) : (
        <>
          <h3>Ingresa el codigo</h3>
          <p>
            Enviamos un codigo de 6 digitos a <strong>{phone}</strong>.
          </p>
          <div className='form-group'>
            <label htmlFor='otp-code'>Codigo</label>
            <input
              id='otp-code'
              type='text'
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder='000000'
              maxLength={6}
              autoComplete='one-time-code'
            />
          </div>
          <button
            className='btn-primary btn-full'
            onClick={handleVerifyCode}
            disabled={verifying || code.length < 4}
            type='button'
          >
            {verifying ? 'Verificando...' : 'Validar y entrar'}
          </button>
          <button className='btn-ghost' onClick={() => setStep('phone')} type='button'>
            Cambiar numero
          </button>
        </>
      )}
    </div>
  )
}
