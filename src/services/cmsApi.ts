import type { CarouselItem, TwoFactorSetup, TwoFactorStatus } from '@/types/cms'
import { api, base, token } from './api'

export const cmsApi = {
  content: {
    get: () =>
      api.get<{ content: Record<string, unknown>; items: unknown[] }>('/admin/site-content'),
    update: (
      section: string,
      key: string,
      data: { value?: string; image_url?: string; sort_order?: number },
    ) => api.put(`/admin/site-content/${section}/${key}`, data),
    getPublic: () => api.get<{ content: Record<string, unknown> }>('/admin/site-content/public'),
  },

  carousel: {
    get: () => api.get<{ items: CarouselItem[] }>('/admin/carousel'),
    create: (data: Partial<CarouselItem>) =>
      api.post<{ item: CarouselItem }>('/admin/carousel', data),
    update: (id: string, data: Partial<CarouselItem>) => api.put(`/admin/carousel/${id}`, data),
    delete: (id: string) => api.del<{ deleted: boolean }>(`/admin/carousel/${id}`),
    getPublic: () => api.get<{ items: CarouselItem[] }>('/admin/carousel/public'),
  },

  upload: {
    file: (file: File) => {
      const form = new FormData()
      form.append('file', file)
      return fetch(`${base}/admin/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token()}` },
        body: form,
      }).then((r) => r.json()) as Promise<{ url: string; filename: string }>
    },
    productImage: (productId: string, file: File) => {
      const form = new FormData()
      form.append('file', file)
      return fetch(`${base}/admin/upload/product/${productId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token()}` },
        body: form,
      }).then((r) => r.json()) as Promise<{ url: string; images: string[] }>
    },
    deleteProductImage: (productId: string, index: number) =>
      api.del<{ images: string[] }>(`/admin/upload/product/${productId}/${index}`),
  },

  twoFactor: {
    status: () => api.get<TwoFactorStatus>('/admin/2fa/status'),
    setup: () => api.post<TwoFactorSetup>('/admin/2fa/setup'),
    verify: (verifyToken: string) =>
      api.post<{ ok: boolean; message: string; token?: string; user?: unknown }>(
        '/admin/2fa/verify',
        {
          token: verifyToken,
        },
      ),
    login: (adminId: string, verifyToken: string) =>
      api.post<{ ok: boolean; token: string; user: unknown; usedBackup?: boolean }>(
        '/admin/2fa/login',
        {
          adminId,
          token: verifyToken,
        },
      ),
    changePassword: (data: { currentPassword: string; newPassword: string; token?: string }) =>
      api.put<{ ok: boolean }>('/admin/2fa/password', data),
  },

  customerAuth: {
    sendCode: (phone: string) =>
      api.post<{ ok: boolean; message: string }>('/customer-auth/send-code', { phone }),
    verifyCode: (phone: string, code: string) =>
      api.post<{ token: string; user: unknown; expiresIn: number }>('/customer-auth/verify-code', {
        phone,
        code,
      }),
    refresh: () => api.post<{ token: string }>('/customer-auth/refresh'),
    setPassword: (password: string) =>
      api.post<{ ok: boolean }>('/customer-auth/password', { password }),
  },
}

export { api }
