import { useSocialStore } from '@/stores/socialStore'

export default function SocialConnect() {
  const connection = useSocialStore((s) => s.connection)
  const connectFacebook = useSocialStore((s) => s.connectFacebook)
  const disconnectFacebook = useSocialStore((s) => s.disconnectFacebook)

  return (
    <div className='social-section'>
      <h3>Conexión Redes Sociales</h3>
      {connection.connected ? (
        <div className='social-connected'>
          <div className='social-connected__info'>
            <span className='social-connected__badge'>Conectado</span>
            <p>
              <strong>{connection.pageName}</strong>
            </p>
            <p>Instagram: {connection.instagramConnected ? 'Sí' : 'No'}</p>
          </div>
          <button className='btn-secondary btn-small' onClick={disconnectFacebook} type='button'>
            Desconectar
          </button>
        </div>
      ) : (
        <div className='social-disconnected'>
          <p>
            Conectá tu página de Facebook para programar y publicar contenido en Facebook e
            Instagram.
          </p>
          <button className='btn-primary' onClick={connectFacebook} type='button'>
            Conectar Facebook
          </button>
        </div>
      )}
    </div>
  )
}
