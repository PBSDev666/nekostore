import { beforeEach, describe, expect, it } from 'vitest'
import { roundShippingCost, useCartStore } from '@/stores/cartStore'
import type { Product } from '@/types/product'

const mockProduct: Product = {
  id: 1,
  name: 'Vestido Shadow Bloom',
  category: 'vestidos',
  price: 89,
  imgSeed: 'shadowbloom',
  sizes: ['XS', 'S', 'M', 'L', 'XL'],
  description: 'Un vestido oscuro',
  points: 89,
  featured: true,
}

const mockProduct2: Product = {
  id: 2,
  name: 'Corset Velvet',
  category: 'tops',
  price: 65,
  imgSeed: 'velvet99',
  sizes: ['S', 'M', 'L'],
  description: 'Un corset de terciopelo',
  badge: 'LIMITADO',
  points: 65,
  featured: true,
}

describe('useCartStore', () => {
  beforeEach(() => {
    useCartStore.setState({
      items: [],
      shippingCost: 0,
      shippingMethod: 'Recogida en tienda',
    })
  })

  it('comienza con carrito vacio', () => {
    const state = useCartStore.getState()
    expect(state.items).toHaveLength(0)
    expect(state.getItemCount()).toBe(0)
    expect(state.getSubtotal()).toBe(0)
  })

  it('agrega un item al carrito', () => {
    useCartStore.getState().addItem(mockProduct, 'M')
    const state = useCartStore.getState()
    expect(state.items).toHaveLength(1)
    expect(state.items[0]?.product.id).toBe(1)
    expect(state.items[0]?.size).toBe('M')
    expect(state.items[0]?.quantity).toBe(1)
  })

  it('incrementa cantidad si el mismo producto/talla ya existe', () => {
    useCartStore.getState().addItem(mockProduct, 'M')
    useCartStore.getState().addItem(mockProduct, 'M')
    const state = useCartStore.getState()
    expect(state.items).toHaveLength(1)
    expect(state.items[0]?.quantity).toBe(2)
  })

  it('agrega item separado si la talla es diferente', () => {
    useCartStore.getState().addItem(mockProduct, 'M')
    useCartStore.getState().addItem(mockProduct, 'L')
    const state = useCartStore.getState()
    expect(state.items).toHaveLength(2)
  })

  it('actualiza cantidad con updateQuantity', () => {
    useCartStore.getState().addItem(mockProduct, 'M')
    useCartStore.getState().updateQuantity(0, 2)
    const state = useCartStore.getState()
    expect(state.items[0]?.quantity).toBe(3)
  })

  it('elimina item si cantidad llega a 0', () => {
    useCartStore.getState().addItem(mockProduct, 'M')
    useCartStore.getState().updateQuantity(0, -1)
    const state = useCartStore.getState()
    expect(state.items).toHaveLength(0)
  })

  it('elimina item por indice', () => {
    useCartStore.getState().addItem(mockProduct, 'M')
    useCartStore.getState().addItem(mockProduct2, 'S')
    useCartStore.getState().removeItem(0)
    const state = useCartStore.getState()
    expect(state.items).toHaveLength(1)
    expect(state.items[0]?.product.id).toBe(2)
  })

  it('calcula subtotal correctamente', () => {
    useCartStore.getState().addItem(mockProduct, 'M')
    useCartStore.getState().addItem(mockProduct2, 'S')
    const subtotal = useCartStore.getState().getSubtotal()
    expect(subtotal).toBe(89 + 65)
  })

  it('aplica descuento segun tier del cliente', () => {
    expect(useCartStore.getState().getDiscount(1)).toBe(0.05)
    expect(useCartStore.getState().getDiscount(500)).toBe(0.08)
    expect(useCartStore.getState().getDiscount(1500)).toBe(0.12)
    expect(useCartStore.getState().getDiscount(4000)).toBe(0.18)
  })

  it('no aplica descuento si puntos es 0', () => {
    expect(useCartStore.getState().getDiscount(0)).toBe(0)
  })

  it('calcula total con subtotal + envio - descuento', () => {
    useCartStore.getState().addItem(mockProduct, 'M')
    useCartStore.getState().setShipping(2500, 'Envio estandar')
    const total = useCartStore.getState().getTotal(500)
    expect(total).toBe(89 * (1 - 0.08) + 2500)
  })

  it('setShipping redondea costo hacia arriba y actualiza metodo', () => {
    useCartStore.getState().setShipping(2640, 'Envio express')
    const state = useCartStore.getState()
    expect(state.shippingCost).toBe(3000)
    expect(state.shippingMethod).toBe('Envio express')
  })

  it('roundShippingCost usa bloques cerrados de 500', () => {
    expect(roundShippingCost(0)).toBe(0)
    expect(roundShippingCost(2500)).toBe(2500)
    expect(roundShippingCost(2501)).toBe(3000)
    expect(roundShippingCost(2640)).toBe(3000)
  })

  it('clearCart vacia todo', () => {
    useCartStore.getState().addItem(mockProduct, 'M')
    useCartStore.getState().setShipping(2500, 'Envio estandar')
    useCartStore.getState().clearCart()
    const state = useCartStore.getState()
    expect(state.items).toHaveLength(0)
    expect(state.shippingCost).toBe(0)
    expect(state.shippingMethod).toBe('Recogida en tienda')
  })
})
