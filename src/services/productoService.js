import productosSeed from '@/mocks/productos.json'
import router from '@/router'
import { useSession } from '@/composables/useSession'

const STORAGE_KEY = 'minierp_productos'
const PRODUCTO_ACTUALIZADO_EVENT = 'minierp:producto-actualizado'

function getEnvBaseUrl() {
  const vite = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {}
  const candidates = [vite.VITE_API_URL, process.env?.VITE_API_URL, process.env?.REACT_APP_API_URL, process.env?.VUE_APP_API_URL].filter(Boolean)
  return candidates[0] || 'http://localhost:4000'
}

const BASE_URL = `${String(getEnvBaseUrl()).replace(/\/$/, '')}/productos`

async function request(path, { method = 'GET', body } = {}) {
  const { token } = useSession()
  const authToken = token?.value || localStorage.getItem('minierp_token') || localStorage.getItem('token') || ''
  const headers = { Accept: 'application/json', 'Content-Type': 'application/json', ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}) }

  const res = await fetch(path, { method, headers, body: body ? JSON.stringify(body) : undefined })
  const contentType = res.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')
  const data = isJson ? await res.json().catch(() => ({})) : null

  if (!res.ok) {
    if (res.status === 404) {
      // API de productos aun no implementada; permitir fallback silencioso
      const err = new Error('NOT_IMPLEMENTED')
      err.status = 404
      throw err
    }
    if (res.status === 401) {
      try { await router.push({ name: 'Inicio-sesion' }) } catch (e) { void e }
    }
    const message = (res.status === 400 && (data?.error || 'Solicitud inválida')) || (data && (data.message || data.error)) || `Error ${res.status}`
    const err = new Error(message)
    err.status = res.status
    err.payload = data
    throw err
  }

  return data
}

function mapFromApi(item = {}) {
  // Contrato sugerido provisional
  const idProducto = item.idProducto ?? item.id_producto ?? item.id
  const nombre = item.nombre || 'Producto'
  const sku = item.sku || String(idProducto ?? '')
  const precio = Number(item.precioBase ?? item.precio_base ?? item.precio ?? 0)
  const stock = Number(item.stockActual ?? item.stock_actual ?? item.stock ?? 0)
  // Mantener IDs string compatibles con UI actual
  const id = idProducto != null ? `prd-${idProducto}` : String(item.id || '')
  return { id, nombre, sku, precio, stock }
}

function cloneSeed() {
  return productosSeed.map((producto) => ({ ...producto }))
}

function cloneProducto(producto) {
  if (!producto || typeof producto !== 'object') return null
  return JSON.parse(JSON.stringify(producto))
}

function readFromCache() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return parsed
    }
  } catch (error) {
    console.warn('[productoService] No se pudo leer el cache, se restablecera el mock.', error)
  }

  localStorage.removeItem(STORAGE_KEY)
  return null
}

function persist(productos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(productos))
}

function ensureProductos() {
  const cache = readFromCache()
  if (cache) return cache

  const seed = cloneSeed()
  persist(seed)
  return seed
}

async function fetchProductosRemote() {
  const url = new URL(BASE_URL)
  const data = await request(url.toString(), { method: 'GET' })
  const items = Array.isArray(data) ? data : data?.items || []
  return items.map(mapFromApi)
}

async function fetchProductoByIdRemote(id) {
  if (!id) return null
  const data = await request(`${BASE_URL}/${encodeURIComponent(id)}`, { method: 'GET' })
  return mapFromApi(data)
}

function emitirProductoActualizado(producto) {
  if (typeof window === 'undefined' || !producto) return
  const evento = new CustomEvent(PRODUCTO_ACTUALIZADO_EVENT, {
    detail: { producto: cloneProducto(producto) },
  })
  window.dispatchEvent(evento)
}

function normalizarProducto(payload) {
  const nombre = (payload?.nombre || '').trim()
  const sku = (payload?.sku || '').trim().toUpperCase()
  const precio = Number(payload?.precio ?? 0)
  const stock = Number(payload?.stock ?? 0)

  if (!nombre) {
    throw new Error('El nombre del producto es obligatorio')
  }

  if (!sku) {
    throw new Error('El SKU del producto es obligatorio')
  }

  if (Number.isNaN(precio) || precio < 0) {
    throw new Error('El precio debe ser un numero mayor o igual a cero')
  }

  if (!Number.isInteger(stock) || stock < 0) {
    throw new Error('El stock debe ser un numero entero mayor o igual a cero')
  }

  return {
    nombre,
    sku,
    precio,
    stock,
  }
}

function generarId() {
  const base = Date.now().toString(36)
  const rand = Math.random().toString(36).slice(2, 6)
  return `prd-${base}-${rand}`
}

export async function obtenerProductos() {
  // Intentar remoto primero; si no existe, usar mock
  try {
    const lista = await fetchProductosRemote()
    // Refrescar caché local para futuras consultas por id
    if (Array.isArray(lista) && lista.length) {
      persist(lista)
      return lista
    }
  } catch (error) {
    if (error?.message !== 'NOT_IMPLEMENTED') {
      // Otros errores: continuar con fallback silenciosamente
      void error
    }
  }
  return ensureProductos()
}

export async function obtenerProductoPorId(id) {
  if (!id) return null
  // Aceptar 'prd-123' o '123'
  const raw = String(id)
  const match = raw.match(/\d+$/)
  const numericId = match ? match[0] : ''

  // Intentar resolver local
  const productos = ensureProductos()
  const local = productos.find((item) => item.id === id || (numericId && item.id === `prd-${numericId}`))
  if (local) return cloneProducto(local)

  // Intentar remoto si API disponible
  try {
    if (numericId) {
      const remoto = await fetchProductoByIdRemote(numericId)
      if (remoto) {
        const actualizados = [...productos, remoto]
        persist(actualizados)
        return cloneProducto(remoto)
      }
    }
  } catch (error) {
    // Silenciar si no implementado u otros; fallback a null
    void error
  }

  return null
}

export async function crearProducto(payload) {
  const productos = ensureProductos()
  const data = normalizarProducto(payload)

  if (productos.some((producto) => producto.sku === data.sku)) {
    throw new Error('Ya existe un producto con ese SKU')
  }

  const nuevoProducto = {
    id: generarId(),
    ...data,
  }

  const actualizados = [...productos, nuevoProducto]
  persist(actualizados)

  emitirProductoActualizado(nuevoProducto)

  return nuevoProducto
}

export async function ajustarStockProducto(id, deltaCantidad) {
  if (!id) {
    throw new Error('El ID del producto es obligatorio para ajustar el stock')
  }

  const cantidad = Number(deltaCantidad)
  if (!Number.isFinite(cantidad)) {
    throw new Error('La cantidad debe ser un numero')
  }
  if (!Number.isInteger(cantidad)) {
    throw new Error('La cantidad debe ser un numero entero')
  }

  const productos = ensureProductos()
  const index = productos.findIndex((producto) => producto.id === id)
  if (index === -1) {
    throw new Error('Producto no encontrado')
  }

  const producto = { ...productos[index] }
  const stockActual = Number(producto.stock ?? 0)

  const nuevoStock = stockActual + cantidad
  if (!Number.isInteger(nuevoStock) || nuevoStock < 0) {
    throw new Error('El stock resultante debe ser un numero entero mayor o igual a cero')
  }

  producto.stock = nuevoStock

  const actualizados = [...productos]
  actualizados[index] = producto
  persist(actualizados)

  emitirProductoActualizado(producto)

  return producto
}

export function onProductoActualizado(callback) {
  if (typeof window === 'undefined') return () => {}
  if (typeof callback !== 'function') return () => {}

  const handler = (event) => {
    callback(event?.detail?.producto || null)
  }

  window.addEventListener(PRODUCTO_ACTUALIZADO_EVENT, handler)

  return () => {
    window.removeEventListener(PRODUCTO_ACTUALIZADO_EVENT, handler)
  }
}
