import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '@/services/api'
import type { CartItem } from '@/types/cart'
import type { Product } from '@/types/product'
import { useLoyaltyDataStore } from './loyaltyDataStore'

interface CartState {
  items: CartItem[]
  shippingCost: number
  shippingMethod: string
  addItem: (product: Product, size: string, quantity?: number) => void
  removeItem: (index: number) => void
  updateQuantity: (index: number, delta: number) => void
  setShipping: (cost: number, method: string) => void
  clearCart: () => void
  getItemCount: () => number
  getSubtotal: () => number
  getDiscount: (customerPoints?: number) => number
  getTotal: (customerPoints?: number) => number
  submitOrder: (data: {
    address: string
    notes?: string
    paymentReference?: string
    paymentProofUrl: string
    paymentProofName?: string
  }) => Promise<{ ok: boolean; error?: string; order?: Record<string, unknown> }>
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      shippingCost: 0,
      shippingMethod: 'Recogida en tienda',

      addItem: (product, size, quantity = 1) => {
        const { items } = get()
        const existingIndex = items.findIndex(
          (item) => item.product.id === product.id && item.size === size,
        )
        if (existingIndex >= 0) {
          const updated = items.map((item, idx) =>
            idx === existingIndex ? { ...item, quantity: item.quantity + quantity } : item,
          )
          set({ items: updated })
        } else {
          set({ items: [...items, { product, quantity, size }] })
        }
      },

      removeItem: (index) => {
        const items = [...get().items]
        items.splice(index, 1)
        set({ items })
      },

      updateQuantity: (index, delta) => {
        const items = [...get().items]
        const item = items[index]
        if (!item) return
        const newQty = item.quantity + delta
        if (newQty <= 0) {
          items.splice(index, 1)
        } else {
          items[index] = { ...item, quantity: newQty }
        }
        set({ items })
      },

      setShipping: (cost, method) => {
        set({ shippingCost: cost, shippingMethod: method })
      },

      clearCart: () => set({ items: [], shippingCost: 0, shippingMethod: 'Recogida en tienda' }),

      getItemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
      getSubtotal: () =>
        get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
      getDiscount: (customerPoints = 0) => {
        if (customerPoints <= 0) return 0
        const TIERS = useLoyaltyDataStore.getState().tiers
        const tier = [...TIERS].reverse().find((t) => customerPoints >= t.min)
        return tier?.discount ?? 0
      },
      getTotal: (customerPoints = 0) => {
        const subtotal = get().getSubtotal()
        const discount = get().getDiscount(customerPoints)
        return subtotal * (1 - discount) + get().shippingCost
      },
      submitOrder: async ({
        address,
        notes,
        paymentReference,
        paymentProofUrl,
        paymentProofName,
      }) => {
        const { items, shippingCost, shippingMethod } = get()
        if (items.length === 0) return { ok: false, error: 'Carrito vacío' }
        try {
          const res = await api.orders.create({
            items: items.map((i) => ({
              product_id: i.product.id.toString(),
              quantity: i.quantity,
              size: i.size,
            })),
            shipping_address: address || 'Recogida en tienda',
            shipping_method: shippingMethod,
            shipping_cost: shippingCost,
            notes: notes || '',
            payment_method: 'sinpe_movil',
            payment_reference: paymentReference || '',
            payment_proof_url: paymentProofUrl,
            payment_proof_name: paymentProofName || '',
          })
          get().clearCart()
          return { ok: true, order: res.order as Record<string, unknown> }
        } catch (e) {
          return { ok: false, error: (e as Error).message }
        }
      },
    }),
    {
      name: 'nekoCart',
      partialize: (state) => ({
        items: state.items,
        shippingCost: state.shippingCost,
        shippingMethod: state.shippingMethod,
      }),
    },
  ),
)
