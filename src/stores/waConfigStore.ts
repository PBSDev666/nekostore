import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '@/services/api'
import { DEFAULT_WA_CONFIG, type WAConfig } from '@/types/waConfig'

interface WAConfigState {
  config: WAConfig
  loading: boolean
  error: string | null

  toggleCustomerType: (type: WAConfig['enabledCustomerTypes'][number]) => void
  toggleAdminType: (type: WAConfig['enabledAdminTypes'][number]) => void
  setAdminPhone: (phone: string) => void
  resetConfig: () => void
  syncFromApi: () => Promise<void>
  saveToApi: () => Promise<void>
}

export const useWAConfigStore = create<WAConfigState>()(
  persist(
    (set, get) => ({
      config: { ...DEFAULT_WA_CONFIG },
      loading: false,
      error: null,

      toggleCustomerType: (type) => {
        const { enabledCustomerTypes } = get().config
        const next = enabledCustomerTypes.includes(type)
          ? enabledCustomerTypes.filter((t) => t !== type)
          : [...enabledCustomerTypes, type]
        set((state) => ({ config: { ...state.config, enabledCustomerTypes: next } }))
      },

      toggleAdminType: (type) => {
        const { enabledAdminTypes } = get().config
        const next = enabledAdminTypes.includes(type)
          ? enabledAdminTypes.filter((t) => t !== type)
          : [...enabledAdminTypes, type]
        set((state) => ({ config: { ...state.config, enabledAdminTypes: next } }))
      },

      setAdminPhone: (phone) =>
        set((state) => ({ config: { ...state.config, adminPhone: phone } })),

      resetConfig: () => set({ config: { ...DEFAULT_WA_CONFIG } }),

      syncFromApi: async () => {
        set({ loading: true, error: null })
        try {
          const res = await api.admin.waConfig.get()
          const remote = res.config as WAConfig
          set({ config: remote, loading: false })
        } catch (err) {
          set({
            loading: false,
            error: err instanceof Error ? err.message : 'Error al sincronizar',
          })
        }
      },

      saveToApi: async () => {
        set({ loading: true, error: null })
        try {
          await api.admin.waConfig.update(get().config)
          set({ loading: false })
        } catch (err) {
          set({
            loading: false,
            error: err instanceof Error ? err.message : 'Error al guardar',
          })
        }
      },
    }),
    {
      name: 'nekoWAConfig',
    },
  ),
)
