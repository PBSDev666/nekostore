const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

function getToken(): string | null {
  try {
    const raw = localStorage.getItem('neko-auth')
    if (!raw) return null
    return JSON.parse(raw).state?.token ?? null
  } catch {
    return null
  }
}

export { API_BASE as base, getToken as token }

function headers(extra: Record<string, string> = {}): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json', ...extra }
  const t = getToken()
  if (t) h.Authorization = `Bearer ${t}`
  return h
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: headers(),
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || `Error ${res.status}`)
  }
  return res.json()
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
  del: <T>(path: string) => request<T>('DELETE', path),

  auth: {
    login: (phone: string, password: string) =>
      api.post<{
        user: unknown
        token?: string
        requires2FA?: boolean
        requires2FASetup?: boolean
        adminId?: string
      }>('/auth/login', { phone, password }),
    register: (name: string, phone: string, password: string) =>
      api.post<{ user: unknown; token: string }>('/auth/register', { name, phone, password }),
    me: () => api.get<{ user: unknown }>('/auth/me'),
  },

  branding: {
    public: () => api.get<{ branding: unknown }>('/admin/branding/public'),
  },

  products: {
    list: (params?: { category?: string; search?: string }) => {
      const q = new URLSearchParams()
      if (params?.category) q.set('category', params.category)
      if (params?.search) q.set('search', params.search)
      const qs = q.toString()
      return api.get<{ products: unknown[] }>(`/products${qs ? `?${qs}` : ''}`)
    },
    get: (id: string) => api.get<{ product: unknown }>(`/products/${id}`),
  },

  contact: {
    send: (data: {
      name: string
      phone?: string
      email?: string
      subject: string
      message: string
    }) => api.post<{ message: unknown }>('/contact', data),
  },

  customers: {
    me: () => api.get<{ customer: unknown }>('/customers/me'),
    update: (data: { name?: string; email?: string; address?: string }) =>
      api.put<{ customer: unknown }>('/customers/me', data),
  },

  notifications: {
    list: () => api.get<{ notifications: unknown[] }>('/notifications'),
    markRead: (id: string) => api.put<{ notification: unknown }>(`/notifications/${id}/read`),
  },

  push: {
    publicKey: () => api.get<{ enabled: boolean; publicKey: string }>('/push/vapid-public-key'),
    subscribe: (subscription: PushSubscriptionJSON) =>
      api.post<{ ok: boolean; id: string }>('/push/subscribe', { subscription }),
  },

  orders: {
    uploadPaymentProof: (file: File) => {
      const form = new FormData()
      form.append('file', file)
      return fetch(`${API_BASE}/orders/payment-proof`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: form,
      }).then(async (res) => {
        const data = await res.json().catch(() => ({ error: res.statusText }))
        if (!res.ok) throw new Error(data.error || `Error ${res.status}`)
        return data as { url: string; filename: string }
      })
    },
    list: () => api.get<{ orders: unknown[] }>('/orders'),
    create: (data: {
      items: unknown[]
      shipping_address?: string
      shipping_method?: string
      shipping_cost?: number
      notes?: string
      payment_method?: string
      payment_reference?: string
      payment_proof_url?: string
      payment_proof_name?: string
    }) => api.post<{ order: unknown }>('/orders', data),
  },

  loyalty: {
    get: () => api.get<{ loyalty: unknown }>('/loyalty'),
    redeem: (rewardId: string) =>
      api.post<{ redemption: unknown; points_remaining: number }>('/loyalty/redeem', {
        reward_id: rewardId,
      }),
  },

  admin: {
    products: {
      list: () => api.get<{ products: unknown[] }>('/admin/products'),
      create: (data: unknown) => api.post<{ product: unknown }>('/admin/products', data),
      update: (id: string, data: unknown) =>
        api.put<{ product: unknown }>(`/admin/products/${id}`, data),
      delete: (id: string) => api.del<{ deleted: boolean }>(`/admin/products/${id}`),
    },
    orders: {
      list: (status?: string) =>
        api.get<{ orders: unknown[] }>(`/admin/orders${status ? `?status=${status}` : ''}`),
      updateStatus: (id: string, status: string) =>
        api.put<{ order: unknown }>(`/admin/orders/${id}/status`, { status }),
    },
    posts: {
      list: () => api.get<{ posts: unknown[] }>('/admin/posts'),
      create: (data: unknown) => api.post<{ post: unknown }>('/admin/posts', data),
      update: (id: string, data: unknown) => api.put<{ post: unknown }>(`/admin/posts/${id}`, data),
      publish: (id: string) => api.put<{ post: unknown }>(`/admin/posts/${id}/publish`),
      delete: (id: string) => api.del<{ deleted: boolean }>(`/admin/posts/${id}`),
    },
    campaigns: {
      list: () => api.get<{ campaigns: unknown[] }>('/admin/campaigns'),
      create: (data: unknown) => api.post<{ campaign: unknown }>('/admin/campaigns', data),
      update: (id: string, data: unknown) =>
        api.put<{ campaign: unknown }>(`/admin/campaigns/${id}`, data),
      delete: (id: string) => api.del<{ deleted: boolean }>(`/admin/campaigns/${id}`),
    },
    metrics: () => api.get<{ metrics: unknown }>('/admin/metrics'),
    branding: {
      get: () => api.get<{ branding: unknown }>('/admin/branding'),
      update: (data: unknown) => api.put<{ branding: unknown }>('/admin/branding', data),
    },
    waConfig: {
      get: () => api.get<{ config: unknown }>('/admin/wa-config'),
      update: (data: unknown) => api.put<{ config: unknown }>('/admin/wa-config', data),
    },
    notifications: {
      list: () => api.get<{ notifications: unknown[] }>('/admin/notifications'),
      create: (data: unknown) => api.post<{ notification: unknown }>('/admin/notifications', data),
      markRead: (id: string) =>
        api.put<{ notification: unknown }>(`/admin/notifications/${id}/read`),
    },
    contactMessages: {
      list: (status?: string) =>
        api.get<{ messages: unknown[] }>(
          `/admin/contact-messages${status ? `?status=${status}` : ''}`,
        ),
      update: (id: string, data: { status?: string; admin_notes?: string }) =>
        api.put<{ message: unknown }>(`/admin/contact-messages/${id}`, data),
    },
  },
}
