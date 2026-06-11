import { useLoyaltyDataStore } from '@/stores/loyaltyDataStore'

const TIER_ICONS: Record<string, string> = {
  MORTAL: '🌑',
  SOMBRA: '🌘',
  ECLIPSE: '🖤',
  'NEKO NOIR': '✦',
}

const TIER_BENEFITS: Record<string, string[]> = {
  MORTAL: [
    '5% de descuento en每 compra',
    'Acceso a drops regulares',
    'Acumulación de puntos oscuros',
  ],
  SOMBRA: ['8% de descuento', 'Acceso anticipado a nuevos drops', 'Notificaciones VIP'],
  ECLIPSE: [
    '12% de descuento',
    'Envío gratis en compras >₡50.000',
    'Recompensas exclusivas',
    'Soporte prioritario',
  ],
  'NEKO NOIR': [
    '18% de descuento',
    'Envío gratis ilimitado',
    'Drop exclusivo NOIR',
    'Acceso a eventos',
    'Código de descuento para amistades',
  ],
}

export default function TierGrid() {
  const tiers = useLoyaltyDataStore((s) => s.tiers)
  return (
    <div className='tiers-grid'>
      {tiers.map((tier) => (
        <div
          key={tier.name}
          className={`tier-card ${tier.name === 'ECLIPSE' ? 'featured-tier' : ''}`}
        >
          <div className='tier-icon'>{TIER_ICONS[tier.name] ?? '✦'}</div>
          <h4>{tier.name}</h4>
          <p>
            {tier.min.toLocaleString()}
            {tier.max === Infinity ? '+' : ` - ${tier.max.toLocaleString()}`} pts
          </p>
          <ul>
            {(tier.benefits && tier.benefits.length > 0
              ? tier.benefits
              : (TIER_BENEFITS[tier.name] ?? [])
            ).map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
