import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '@/services/api'
import { simulateMetrics, simulateOAuth, simulatePost } from '@/services/socialApi'
import type {
  PostAnalytics,
  SocialAsset,
  SocialCampaign,
  SocialPost,
  SocialState,
} from '@/types/social'
import { DEFAULT_SOCIAL_STATE } from '@/types/social'

interface SocialActions {
  connectFacebook: () => Promise<void>
  disconnectFacebook: () => void
  addCampaign: (campaign: SocialCampaign) => void
  updateCampaign: (id: string, updates: Partial<SocialCampaign>) => void
  removeCampaign: (id: string) => void
  addPost: (post: SocialPost) => void
  updatePost: (id: string, updates: Partial<SocialPost>) => void
  removePost: (id: string) => void
  publishPost: (id: string) => Promise<void>
  refreshMetrics: () => Promise<void>
  addAsset: (asset: SocialAsset) => void
  removeAsset: (id: string) => void
  syncCampaigns: () => Promise<void>
  syncPosts: () => Promise<void>
  apiPublishPost: (id: string) => Promise<void>
  loading: boolean
  error: string | null
}

type SocialStore = SocialState & SocialActions

export const useSocialStore = create<SocialStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_SOCIAL_STATE,
      loading: false,
      error: null,

      connectFacebook: async () => {
        const result = await simulateOAuth()
        if (result.success && result.pageId && result.pageName && result.accessToken) {
          set({
            connection: {
              connected: true,
              pageId: result.pageId,
              pageName: result.pageName,
              accessToken: result.accessToken,
              instagramConnected: true,
            },
          })
        }
      },

      disconnectFacebook: () => {
        set({ connection: DEFAULT_SOCIAL_STATE.connection })
      },

      addCampaign: (campaign) => {
        set((s) => ({ campaigns: [...s.campaigns, campaign] }))
      },

      updateCampaign: (id, updates) => {
        set((s) => ({
          campaigns: s.campaigns.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        }))
      },

      removeCampaign: (id) => {
        set((s) => ({
          campaigns: s.campaigns.filter((c) => c.id !== id),
          posts: s.posts.filter((p) => p.campaignId !== id),
        }))
      },

      addPost: (post) => {
        set((s) => ({ posts: [...s.posts, post] }))
      },

      updatePost: (id, updates) => {
        set((s) => ({
          posts: s.posts.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        }))
      },

      removePost: (id) => {
        set((s) => ({ posts: s.posts.filter((p) => p.id !== id) }))
      },

      publishPost: async (id) => {
        const post = get().posts.find((p) => p.id === id)
        if (!post || post.status === 'published') return
        set((s) => ({
          posts: s.posts.map((p) => (p.id === id ? { ...p, status: 'scheduled' } : p)),
        }))
        const result = await simulatePost(post)
        if (result.success) {
          set((s) => ({
            posts: s.posts.map((p) =>
              p.id === id
                ? {
                    ...p,
                    status: 'published',
                    publishedAt: new Date().toISOString(),
                    facebookPostId: result.facebookPostId ?? p.facebookPostId,
                    instagramPostId: result.instagramPostId ?? p.instagramPostId,
                  }
                : p,
            ),
          }))
        } else {
          set((s) => ({
            posts: s.posts.map((p) => (p.id === id ? { ...p, status: 'failed' } : p)),
          }))
        }
      },

      apiPublishPost: async (id) => {
        const post = get().posts.find((p) => p.id === id)
        if (!post) return
        set({ loading: true, error: null })
        try {
          await api.admin.posts.publish(id)
          set((s) => ({
            posts: s.posts.map((p) =>
              p.id === id
                ? { ...p, status: 'published', publishedAt: new Date().toISOString() }
                : p,
            ),
            loading: false,
          }))
        } catch (err) {
          set({
            loading: false,
            error: err instanceof Error ? err.message : 'Error al publicar',
          })
        }
      },

      refreshMetrics: async () => {
        const { posts, postAnalytics } = get()
        const publishedPosts = posts.filter((p) => p.status === 'published')
        const newAnalytics: Record<string, PostAnalytics> = { ...postAnalytics }
        for (const post of publishedPosts) {
          if (!newAnalytics[post.id]) {
            const pa = await simulateMetrics(post.id)
            newAnalytics[post.id] = pa
          }
        }
        set({ postAnalytics: newAnalytics })
      },

      addAsset: (asset) => {
        set((s) => ({ assets: [...s.assets, asset] }))
      },

      removeAsset: (id) => {
        set((s) => ({ assets: s.assets.filter((a) => a.id !== id) }))
      },

      syncCampaigns: async () => {
        set({ loading: true, error: null })
        try {
          const res = await api.admin.campaigns.list()
          const campaigns = res.campaigns as SocialCampaign[]
          set((s) => ({
            campaigns: [
              ...campaigns,
              ...s.campaigns.filter((c) => !campaigns.some((a) => a.id === c.id)),
            ],
            loading: false,
          }))
        } catch (err) {
          set({
            loading: false,
            error: err instanceof Error ? err.message : 'Error al sincronizar campañas',
          })
        }
      },

      syncPosts: async () => {
        set({ loading: true, error: null })
        try {
          const res = await api.admin.posts.list()
          const posts = res.posts as SocialPost[]
          set((s) => ({
            posts: [...posts, ...s.posts.filter((p) => !posts.some((a) => a.id === p.id))],
            loading: false,
          }))
        } catch (err) {
          set({
            loading: false,
            error: err instanceof Error ? err.message : 'Error al sincronizar posts',
          })
        }
      },
    }),
    {
      name: 'neko-social',
    },
  ),
)
