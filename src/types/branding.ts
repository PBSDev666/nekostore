export interface BrandingConfig {
  logoUrl: string
  primaryColor: string
  accentColor: string
  textColor: string
  storeUrl: string
  qrSize: number
  qrCorrectionLevel: 'L' | 'M' | 'Q' | 'H'
  applyToSocialPosts: boolean
  applyToOGImages: boolean
  applyToWhatsApp: boolean
}

export const DEFAULT_BRANDING: BrandingConfig = {
  logoUrl: '',
  primaryColor: '#050508',
  accentColor: '#c9a96e',
  textColor: '#e8e4dc',
  storeUrl: 'nekostore.cr',
  qrSize: 200,
  qrCorrectionLevel: 'M',
  applyToSocialPosts: true,
  applyToOGImages: true,
  applyToWhatsApp: true,
}
