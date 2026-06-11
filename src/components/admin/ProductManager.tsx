import { useEffect, useMemo, useState } from 'react'
import { api } from '@/services/api'
import { useProductStore } from '@/stores/productStore'
import type { Category, Product } from '@/types/product'
import ProductImageManager from './ProductImageManager'
import SalesProjection from './SalesProjection'

const CATEGORIES: Array<{ value: Category; label: string }> = [
  { value: 'vestidos', label: 'Vestidos' },
  { value: 'tops', label: 'Tops' },
  { value: 'conjuntos', label: 'Conjuntos' },
  { value: 'accesorios', label: 'Accesorios' },
]

type AdminView = 'products' | 'stock' | 'images'

type Draft = {
  name: string
  description: string
  category: Category
  price: string
  stock: string
  lowStockThreshold: string
  costPrice: string
  badge: string
  sizes: string
  images: string[]
  active: boolean
}

const emptyDraft: Draft = {
  name: '',
  description: '',
  category: 'accesorios',
  price: '0',
  stock: '0',
  lowStockThreshold: '5',
  costPrice: '0',
  badge: '',
  sizes: '',
  images: [],
  active: true,
}

function toDraft(product: Product): Draft {
  return {
    name: product.name,
    description: product.description ?? '',
    category: product.category,
    price: String(product.price ?? 0),
    stock: String(product.stock ?? 0),
    lowStockThreshold: String(product.lowStockThreshold ?? 5),
    costPrice: String(product.costPrice ?? 0),
    badge: product.badge ?? '',
    sizes: product.sizes.join(', '),
    images: product.images ?? [],
    active: product.active ?? true,
  }
}

function toPayload(draft: Draft) {
  return {
    name: draft.name.trim(),
    description: draft.description.trim(),
    category_id: draft.category,
    price: Number(draft.price),
    stock: Number(draft.stock),
    low_stock_threshold: Number(draft.lowStockThreshold),
    cost_price: Number(draft.costPrice),
    badge: draft.badge.trim(),
    sizes: draft.sizes
      .split(',')
      .map((size) => size.trim())
      .filter(Boolean),
    images: draft.images,
    active: draft.active,
  }
}

export default function ProductManager() {
  const products = useProductStore((s) => s.items)
  const loading = useProductStore((s) => s.loading)
  const error = useProductStore((s) => s.error)
  const fetchAdminProducts = useProductStore((s) => s.fetchAdminProducts)
  const [activeView, setActiveView] = useState<AdminView>('products')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const [isCreating, setIsCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    fetchAdminProducts()
  }, [fetchAdminProducts])

  const selected = products.find((product) => String(product.id) === selectedId) ?? products[0]

  useEffect(() => {
    if (isCreating) return
    if (!selected) {
      setDraft(emptyDraft)
      return
    }
    setSelectedId(String(selected.id))
    setDraft(toDraft(selected))
  }, [isCreating, selected])

  const stats = useMemo(() => {
    const totalStock = products.reduce((sum, product) => sum + (product.stock ?? 0), 0)
    const active = products.filter((product) => product.active !== false).length
    const lowProducts = products.filter(
      (product) => (product.stock ?? 0) <= (product.lowStockThreshold ?? 5),
    )
    const value = products.reduce(
      (sum, product) => sum + (product.stock ?? 0) * Number(product.price ?? 0),
      0,
    )
    return { totalStock, active, lowProducts, value }
  }, [products])

  const updateDraft = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  const selectProduct = (id: string) => {
    setIsCreating(false)
    setSelectedId(id)
  }

  const startCreate = () => {
    setIsCreating(true)
    setSelectedId(null)
    setDraft(emptyDraft)
    setActiveView('products')
    setNotice('')
  }

  const handleSave = async () => {
    if (!draft.name.trim()) {
      setNotice('El nombre del producto es obligatorio.')
      return
    }

    setSaving(true)
    setNotice('')
    try {
      if (isCreating) {
        const res = await api.admin.products.create(toPayload(draft))
        const created = res.product as { id?: string | number }
        await fetchAdminProducts()
        setSelectedId(created.id ? String(created.id) : null)
        setIsCreating(false)
        setNotice('Producto creado en la base de datos.')
      } else if (selected) {
        await api.admin.products.update(String(selected.id), toPayload(draft))
        await fetchAdminProducts()
        setNotice('Producto actualizado desde la base de datos.')
      }
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'No se pudo guardar el producto.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selected || isCreating) return
    if (!window.confirm(`Eliminar ${selected.name}?`)) return

    setSaving(true)
    setNotice('')
    try {
      await api.admin.products.delete(String(selected.id))
      await fetchAdminProducts()
      setSelectedId(null)
      setNotice('Producto eliminado de la base de datos.')
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'No se pudo eliminar el producto.')
    } finally {
      setSaving(false)
    }
  }

  const handleImagesChange = async (images: string[]) => {
    updateDraft('images', images)
    await fetchAdminProducts()
  }

  if (loading && products.length === 0) {
    return <div className='admin-panel-empty'>Cargando inventario desde la API...</div>
  }

  return (
    <div className='wp-admin-shell'>
      <aside className='wp-admin-menu' aria-label='Menu de inventario'>
        <strong>Productos</strong>
        <button
          className={activeView === 'products' ? 'active' : ''}
          onClick={() => setActiveView('products')}
          type='button'
        >
          Todos los productos
        </button>
        <button
          className={activeView === 'stock' ? 'active' : ''}
          onClick={() => setActiveView('stock')}
          type='button'
        >
          Stock
        </button>
        <button
          className={activeView === 'images' ? 'active' : ''}
          onClick={() => setActiveView('images')}
          type='button'
        >
          Imagenes
        </button>
      </aside>

      <section className='wp-admin-main'>
        <header className='wp-admin-header'>
          <div>
            <p className='wp-admin-kicker'>Inventario</p>
            <h2>Productos y stock</h2>
            <span>Fuente: API + PostgreSQL. Sin datos locales para operar.</span>
          </div>
          <div className='orders-toolbar'>
            <button className='btn-secondary' onClick={() => fetchAdminProducts()} type='button'>
              Refrescar
            </button>
            <button className='btn-primary' onClick={startCreate} type='button'>
              Nuevo producto
            </button>
          </div>
        </header>

        {error && <div className='admin-error'>{error}</div>}
        {notice && <div className='admin-notice'>{notice}</div>}

        <div className='wp-stat-grid'>
          <div>
            <span>Productos activos</span>
            <strong>{stats.active}</strong>
          </div>
          <div>
            <span>Unidades en stock</span>
            <strong>{stats.totalStock}</strong>
          </div>
          <button onClick={() => setActiveView('stock')} type='button'>
            <span>Alertas stock bajo</span>
            <strong>{stats.lowProducts.length}</strong>
          </button>
          <div>
            <span>Valor potencial</span>
            <strong>₡{stats.value.toLocaleString('es-CR')}</strong>
          </div>
        </div>

        {activeView === 'stock' ? (
          <div className='wp-product-list'>
            <div className='wp-product-list__head'>
              <span>Producto</span>
              <span>Stock</span>
              <span>Minimo</span>
            </div>
            {stats.lowProducts.map((product) => (
              <button
                key={product.id}
                className='wp-product-row'
                onClick={() => {
                  selectProduct(String(product.id))
                  setActiveView('products')
                }}
                type='button'
              >
                <span>
                  <strong>{product.name}</strong>
                  <small>{product.category}</small>
                </span>
                <span className='stock-low'>{product.stock ?? 0}</span>
                <span>{product.lowStockThreshold ?? 5}</span>
              </button>
            ))}
            {stats.lowProducts.length === 0 && (
              <div className='admin-panel-empty'>No hay productos con stock bajo.</div>
            )}
          </div>
        ) : (
          <div className='wp-product-workbench'>
            <div className='wp-product-list'>
              <div className='wp-product-list__head'>
                <span>Producto</span>
                <span>Stock</span>
                <span>Estado</span>
              </div>
              {products.map((product) => {
                const stock = product.stock ?? 0
                const low = stock <= (product.lowStockThreshold ?? 5)
                return (
                  <button
                    key={product.id}
                    className={`wp-product-row ${
                      !isCreating && String(product.id) === selectedId ? 'active' : ''
                    }`}
                    onClick={() => selectProduct(String(product.id))}
                    type='button'
                  >
                    <span>
                      <strong>{product.name}</strong>
                      <small>{product.category}</small>
                    </span>
                    <span className={low ? 'stock-low' : ''}>{stock}</span>
                    <span>
                      {product.active === false ? 'Oculto' : low ? 'Revisar' : 'Publicado'}
                    </span>
                  </button>
                )
              })}
              {products.length === 0 && (
                <div className='admin-panel-empty'>No hay productos en la base de datos.</div>
              )}
            </div>

            <form className='wp-product-editor' onSubmit={(e) => e.preventDefault()}>
              <div className='admin-home__panel-head'>
                <h3>{isCreating ? 'Nuevo producto' : 'Editar producto'}</h3>
                {!isCreating && selected && (
                  <button
                    className='btn-outline btn-small'
                    disabled={saving}
                    onClick={handleDelete}
                    type='button'
                  >
                    Eliminar
                  </button>
                )}
              </div>

              {activeView === 'images' && selected ? (
                <ProductImageManager
                  productId={String(selected.id)}
                  currentImages={draft.images}
                  onImagesChange={handleImagesChange}
                />
              ) : (
                <>
                  <div className='form-group'>
                    <label htmlFor='admin-product-name'>Nombre</label>
                    <input
                      id='admin-product-name'
                      value={draft.name}
                      onChange={(e) => updateDraft('name', e.target.value)}
                    />
                  </div>
                  <div className='form-group'>
                    <label htmlFor='admin-product-description'>Descripcion</label>
                    <textarea
                      id='admin-product-description'
                      value={draft.description}
                      onChange={(e) => updateDraft('description', e.target.value)}
                    />
                  </div>
                  <div className='wp-form-grid'>
                    <div className='form-group'>
                      <label htmlFor='admin-product-category'>Categoria</label>
                      <select
                        id='admin-product-category'
                        value={draft.category}
                        onChange={(e) => updateDraft('category', e.target.value as Category)}
                      >
                        {CATEGORIES.map((category) => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className='form-group'>
                      <label htmlFor='admin-product-status'>Estado</label>
                      <select
                        id='admin-product-status'
                        value={draft.active ? 'active' : 'hidden'}
                        onChange={(e) => updateDraft('active', e.target.value === 'active')}
                      >
                        <option value='active'>Publicado</option>
                        <option value='hidden'>Oculto</option>
                      </select>
                    </div>
                  </div>
                  <div className='wp-form-grid'>
                    <div className='form-group'>
                      <label htmlFor='admin-product-price'>Precio venta</label>
                      <input
                        id='admin-product-price'
                        type='number'
                        min='0'
                        value={draft.price}
                        onChange={(e) => updateDraft('price', e.target.value)}
                      />
                    </div>
                    <div className='form-group'>
                      <label htmlFor='admin-product-cost'>Costo</label>
                      <input
                        id='admin-product-cost'
                        type='number'
                        min='0'
                        value={draft.costPrice}
                        onChange={(e) => updateDraft('costPrice', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className='wp-form-grid'>
                    <div className='form-group'>
                      <label htmlFor='admin-product-stock'>Stock disponible</label>
                      <input
                        id='admin-product-stock'
                        type='number'
                        min='0'
                        value={draft.stock}
                        onChange={(e) => updateDraft('stock', e.target.value)}
                      />
                    </div>
                    <div className='form-group'>
                      <label htmlFor='admin-product-low-stock'>Alerta stock bajo</label>
                      <input
                        id='admin-product-low-stock'
                        type='number'
                        min='0'
                        value={draft.lowStockThreshold}
                        onChange={(e) => updateDraft('lowStockThreshold', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className='wp-form-grid'>
                    <div className='form-group'>
                      <label htmlFor='admin-product-badge'>Etiqueta</label>
                      <input
                        id='admin-product-badge'
                        value={draft.badge}
                        onChange={(e) => updateDraft('badge', e.target.value)}
                        placeholder='BESTSELLER, LIMITADO, EXCLUSIVO...'
                      />
                    </div>
                    <div className='form-group'>
                      <label htmlFor='admin-product-sizes'>Tallas</label>
                      <input
                        id='admin-product-sizes'
                        value={draft.sizes}
                        onChange={(e) => updateDraft('sizes', e.target.value)}
                        placeholder='XS, S, M, L'
                      />
                    </div>
                  </div>
                  <button
                    className='btn-primary'
                    disabled={saving}
                    onClick={handleSave}
                    type='button'
                  >
                    {saving ? 'Guardando...' : isCreating ? 'Crear producto' : 'Guardar cambios'}
                  </button>
                </>
              )}

              {activeView === 'images' && !selected && (
                <div className='admin-panel-empty'>
                  Selecciona un producto existente para administrar imagenes.
                </div>
              )}
            </form>
          </div>
        )}

        <SalesProjection />
      </section>
    </div>
  )
}
