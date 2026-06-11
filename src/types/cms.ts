export interface SiteContentValue {
  value: string
  image_url?: string | null
  sort_order?: number
}

export interface CarouselItem {
  id: string
  image_url: string
  title: string
  subtitle: string
  link: string
  link_text: string
  active: boolean
  sort_order: number
  created_at?: string
  updated_at?: string
}

export interface SiteContent {
  [section: string]: {
    [key: string]: SiteContentValue
  }
}

export interface TwoFactorStatus {
  enabled: boolean
  hasBackupCodes: boolean
}

export interface TwoFactorSetup {
  secret: string
  qr: string
  backupCodes: string[]
}
