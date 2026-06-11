import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_CONFIG } from '@/data/defaultConfig'
import { api } from '@/services/api'
import type { StoreConfig } from '@/types/config'

interface ConfigState {
  config: StoreConfig
  loading: boolean
  error: string | null
  updateConfig: (partial: Partial<StoreConfig>) => void
  resetConfig: () => void
  fetchConfig: () => Promise<void>
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      config: { ...DEFAULT_CONFIG },
      loading: false,
      error: null,
      updateConfig: (partial) => set((state) => ({ config: { ...state.config, ...partial } })),
      resetConfig: () => set({ config: { ...DEFAULT_CONFIG } }),
      fetchConfig: async () => {
        set({ loading: true, error: null })
        try {
          const res = await api.branding.public()
          const branding = res.branding as Record<string, string>
          set({
            config: {
              storeName: branding.store_name ?? DEFAULT_CONFIG.storeName,
              storeTagline: branding.tagline ?? DEFAULT_CONFIG.storeTagline,
              currencySymbol: DEFAULT_CONFIG.currencySymbol,
              whatsappNumber: DEFAULT_CONFIG.whatsappNumber,
              storeEmail: DEFAULT_CONFIG.storeEmail,
              instagramHandle: DEFAULT_CONFIG.instagramHandle,
              intlShippingEnabled: DEFAULT_CONFIG.intlShippingEnabled,
              intlContactEmail: DEFAULT_CONFIG.intlContactEmail,
              dropActive: DEFAULT_CONFIG.dropActive,
              dropTitle: DEFAULT_CONFIG.dropTitle,
            },
            loading: false,
          })
        } catch (e) {
          set({ loading: false, error: (e as Error).message })
        }
      },
    }),
    { name: 'nekoConfig' },
  ),
)
