import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { cmsApi } from '@/services/cmsApi'
import { useAuthStore } from '@/stores/authStore'
import type { CarouselItem, SiteContent, TwoFactorSetup, TwoFactorStatus } from '@/types/cms'

interface CMSState {
  content: SiteContent
  carousel: CarouselItem[]
  twoFactor: TwoFactorStatus
  twoFactorSetup: TwoFactorSetup | null
  loading: boolean
  error: string | null
  fetchContent: () => Promise<void>
  updateContent: (
    section: string,
    key: string,
    data: { value?: string; image_url?: string },
  ) => Promise<void>
  fetchCarousel: () => Promise<void>
  createCarouselItem: (data: Partial<CarouselItem>) => Promise<void>
  updateCarouselItem: (id: string, data: Partial<CarouselItem>) => Promise<void>
  deleteCarouselItem: (id: string) => Promise<void>
  getContentValue: (section: string, key: string) => string
  getContentImage: (section: string, key: string) => string | null
  fetch2FAStatus: () => Promise<void>
  setup2FA: () => Promise<TwoFactorSetup>
  verify2FA: (token: string) => Promise<boolean>
  resetError: () => void
}

export const useCMSStore = create<CMSState>()(
  persist(
    (set, get) => ({
      content: {},
      carousel: [],
      twoFactor: { enabled: false, hasBackupCodes: false },
      twoFactorSetup: null,
      loading: false,
      error: null,

      fetchContent: async () => {
        set({ loading: true, error: null })
        try {
          const res = await cmsApi.content.get()
          set({ content: res.content as SiteContent, loading: false })
        } catch (err) {
          set({ loading: false, error: (err as Error).message })
        }
      },

      updateContent: async (section, key, data) => {
        try {
          await cmsApi.content.update(section, key, data)
          set((state) => ({
            content: {
              ...state.content,
              [section]: {
                ...(state.content[section] || {}),
                [key]: {
                  value: data.value ?? state.content[section]?.[key]?.value ?? '',
                  image_url: data.image_url ?? state.content[section]?.[key]?.image_url ?? null,
                },
              },
            },
          }))
        } catch (err) {
          set({ error: (err as Error).message })
        }
      },

      fetchCarousel: async () => {
        set({ loading: true, error: null })
        try {
          const res = await cmsApi.carousel.get()
          set({ carousel: res.items, loading: false })
        } catch (err) {
          set({ loading: false, error: (err as Error).message })
        }
      },

      createCarouselItem: async (data) => {
        try {
          const res = await cmsApi.carousel.create(data)
          set((state) => ({ carousel: [...state.carousel, res.item] }))
        } catch (err) {
          set({ error: (err as Error).message })
        }
      },

      updateCarouselItem: async (id, data) => {
        try {
          await cmsApi.carousel.update(id, data)
          set((state) => ({
            carousel: state.carousel.map((c) => (c.id === id ? { ...c, ...data } : c)),
          }))
        } catch (err) {
          set({ error: (err as Error).message })
        }
      },

      deleteCarouselItem: async (id) => {
        try {
          await cmsApi.carousel.delete(id)
          set((state) => ({ carousel: state.carousel.filter((c) => c.id !== id) }))
        } catch (err) {
          set({ error: (err as Error).message })
        }
      },

      getContentValue: (section, key) => {
        return get().content[section]?.[key]?.value ?? ''
      },

      getContentImage: (section, key) => {
        return get().content[section]?.[key]?.image_url ?? null
      },

      fetch2FAStatus: async () => {
        try {
          const res = await cmsApi.twoFactor.status()
          set({ twoFactor: res })
        } catch {
          // not configured yet
        }
      },

      setup2FA: async () => {
        const res = await cmsApi.twoFactor.setup()
        set({ twoFactorSetup: res })
        return res
      },

      verify2FA: async (token) => {
        try {
          const res = await cmsApi.twoFactor.verify(token)
          if (res.token && res.user) {
            useAuthStore.getState().setApiSession(res.token, res.user)
          }
          set({ twoFactor: { enabled: true, hasBackupCodes: true } })
          return true
        } catch {
          return false
        }
      },

      resetError: () => set({ error: null }),
    }),
    {
      name: 'nekoCMS',
      partialize: (state) => ({
        content: state.content,
        carousel: state.carousel,
      }),
    },
  ),
)
