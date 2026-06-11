import { useQRCode } from '@/hooks/useQRCode'

interface QRCodeProps {
  url: string
  size?: number
  correctionLevel?: 'L' | 'M' | 'Q' | 'H'
  className?: string
}

export default function QRCode({
  url,
  size = 200,
  correctionLevel = 'M',
  className = '',
}: QRCodeProps) {
  const { dataUrl, error } = useQRCode(url, size, correctionLevel)

  if (error) {
    return <span className='qr-error'>Error al generar QR</span>
  }

  return (
    <img
      src={dataUrl}
      alt={`Código QR de ${url}`}
      width={size}
      height={size}
      className={`qr-code ${className}`}
    />
  )
}
