import QRCodeLib from 'qrcode'
import { useEffect, useState } from 'react'

export function useQRCode(url: string, size = 200, correctionLevel: 'L' | 'M' | 'Q' | 'H' = 'M') {
  const [dataUrl, setDataUrl] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!url) return
    QRCodeLib.toDataURL(
      url,
      {
        width: size,
        margin: 2,
        color: { dark: '#c9a96e', light: '#050508' },
        errorCorrectionLevel: correctionLevel,
      },
      (err, urlResult) => {
        if (err) {
          setError(err.message)
          return
        }
        setDataUrl(urlResult)
      },
    )
  }, [url, size, correctionLevel])

  return { dataUrl, error }
}
