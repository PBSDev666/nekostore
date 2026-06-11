import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '@/services/api'
import { type BrandingConfig, DEFAULT_BRANDING } from '@/types/branding'

interface BrandingState {
  config: BrandingConfig
  loading: boolean
  error: string | null
  updateConfig: (partial: Partial<BrandingConfig>) => void
  resetConfig: () => void
  syncFromApi: () => Promise<void>
  saveToApi: () => Promise<void>
}

export const useBrandingStore = create<BrandingState>()(
  persist(
    (set, get) => ({
      config: { ...DEFAULT_BRANDING },
      loading: false,
      error: null,
      updateConfig: (partial) => set((state) => ({ config: { ...state.config, ...partial } })),
      resetConfig: () => set({ config: { ...DEFAULT_BRANDING } }),

      syncFromApi: async () => {
        set({ loading: true, error: null })
        try {
          const res = await api.admin.branding.get()
          const remote = res.branding as Partial<BrandingConfig>
          set({ config: { ...get().config, ...remote }, loading: false })
        } catch (err) {
          set({
            loading: false,
            error: err instanceof Error ? err.message : 'Error al sincronizar marca',
          })
        }
      },

      saveToApi: async () => {
        set({ loading: true, error: null })
        try {
          await api.admin.branding.update(get().config)
          set({ loading: false })
        } catch (err) {
          set({
            loading: false,
            error: err instanceof Error ? err.message : 'Error al guardar marca',
          })
        }
      },
    }),
    { name: 'nekoBranding' },
  ),
)
