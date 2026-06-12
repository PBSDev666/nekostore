import { useEffect, useState } from 'react'
import { useInstallPrompt } from '@/hooks/useInstallPrompt'
import { publicAsset } from '@/utils/publicAsset'

export default function PWAInstallSection() {
  const { canInstall, install } = useInstallPrompt()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(max-width: 820px), (pointer: coarse)')
    const update = () => setIsMobile(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  return (
    <section className='pwa-section' aria-labelledby='pwa-title'>
      <div className='pwa-section__copy'>
        <div className='section-eyebrow'>App Web</div>
        <h2 id='pwa-title'>NEKO directo en tu pantalla</h2>
        <p>
          Instala NEKO como PWA para abrir la tienda sin buscar el link, revisar el catalogo mas
          rapido y recibir alertas permitidas sobre pedidos, drops y recompensas.
        </p>
      </div>

      <div className='pwa-section__visual' aria-hidden='true'>
        <div className='pwa-phone'>
          <div className='pwa-phone__bar' />
          <img className='pwa-phone__logo' src={publicAsset('brand/neko-logo-cat.png')} alt='' />
          <strong>PWA</strong>
          <span>Catalogo, pedidos, cuenta y alertas</span>
        </div>
      </div>

      <div className='pwa-install-panel'>
        {canInstall ? (
          <>
            <h3>Instalala en este dispositivo</h3>
            <p>Tu navegador permite agregar NEKO a la pantalla de inicio.</p>
            <button className='btn-primary pwa-install-cta' onClick={install} type='button'>
              Instalar app web
            </button>
          </>
        ) : isMobile ? (
          <>
            <h3>Lista para mobile</h3>
            <p>
              Si tu navegador permite instalarla, vas a ver el boton de instalacion o la opcion
              Agregar a pantalla de inicio en el menu.
            </p>
          </>
        ) : (
          <>
            <h3>Pensada para el celular</h3>
            <p>
              La app web se instala mejor desde un dispositivo mobile compatible. En desktop podes
              seguir usando la tienda desde el navegador.
            </p>
          </>
        )}
      </div>
    </section>
  )
}
