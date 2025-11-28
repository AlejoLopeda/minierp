import router from '@/router'
import { useSession } from '@/composables/useSession'

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
  const idProducto = item.idProducto ?? item.id_producto ?? item.id
  const nombre = item.nombre || 'Producto'
  const referencia = item.referencia ?? item.sku ?? item.codigo ?? item.codigoProducto ?? item.codigo_producto ?? String(idProducto ?? '')
  const categoria = item.categoria ?? item.category ?? ''
  const precio = Number(item.precioBase ?? item.precio_base ?? item.precio ?? 0)
  const stock = Number(item.cantidad ?? item.stockActual ?? item.stock_actual ?? item.stock ?? 0)
  const id = idProducto != null ? `prd-${idProducto}` : String(item.id || '')
  return { id, nombre, sku: String(referencia || ''), precio, stock, categoria }
}

function buildApiPayload(data) {
  return {
    referencia: data.sku,
    categoria: data.categoria,
    precio: data.precio,
    nombre: data.nombre,
    cantidad: data.stock,
  }
}

function normalizarProducto(payload) {
  const nombre = (payload?.nombre || '').trim()
  const sku = (payload?.sku || payload?.referencia || '').trim().toUpperCase()
  const categoria = (payload?.categoria || '').trim()
  const precio = Number.parseFloat(payload?.precio ?? payload?.precioBase ?? payload?.precio_base ?? '')
  const stock = Number.parseInt(payload?.stock ?? payload?.cantidad ?? payload?.stockActual ?? payload?.stock_actual ?? 0, 10)

  if (!nombre) {
    throw new Error('El nombre del producto es obligatorio')
  }

  if (!sku) {
    throw new Error('El SKU del producto es obligatorio')
  }

  if (!Number.isFinite(precio) || precio < 0) {
    throw new Error('El precio debe ser un numero mayor o igual a cero')
  }

  if (!Number.isInteger(stock) || stock < 0) {
    throw new Error('El stock debe ser un numero entero mayor o igual a cero')
  }

  return {
    nombre,
    sku,
    categoria,
    precio: Number(precio.toFixed(2)),
    stock,
  }
}

const extraerIdNumerico = (id) => {
  if (id == null) return ''
  const raw = String(id).trim()
  if (!raw) return ''
  if (raw.startsWith('prd-')) {
    const rest = raw.slice(4)
    return rest || raw
  }
  if (/^[0-9a-fA-F-]{8,}$/.test(raw)) {
    return raw
  }
  if (/^\d+$/.test(raw)) {
    return raw
  }
  const match = raw.match(/\d+$/)
  return match ? match[0] : raw
}

function normalizarIdApi(id) {
  return extraerIdNumerico(id)
}

function cloneProducto(producto) {
  if (!producto || typeof producto !== 'object') return null
  return JSON.parse(JSON.stringify(producto))
}

const productosCache = new Map()

function setProductosCache(list = []) {
  productosCache.clear()
  for (const item of list) {
    if (item?.id) {
      productosCache.set(item.id, cloneProducto(item))
    }
  }
}

function upsertProductoCache(producto) {
  if (!producto?.id) return
  productosCache.set(producto.id, cloneProducto(producto))
}

function buscarEnCache(id) {
  if (!id) return null
  const numeric = extraerIdNumerico(id)
  for (const producto of productosCache.values()) {
    const numericProducto = extraerIdNumerico(producto.id)
    if (producto.id === id || numericProducto === numeric || producto.sku === String(id)) {
      return cloneProducto(producto)
    }
  }
  return null
}

async function fetchProductosRemote() {
  const url = new URL(BASE_URL)
  const data = await request(url.toString(), { method: 'GET' })
  const items = Array.isArray(data) ? data : data?.items || []
  const mapped = items.map(mapFromApi)
  setProductosCache(mapped)
  return mapped
}

async function fetchProductoByIdRemote(id) {
  if (!id) return null
  const apiId = normalizarIdApi(id)
  const data = await request(`${BASE_URL}/${encodeURIComponent(apiId)}`, { method: 'GET' })
  const mapped = mapFromApi(data)
  upsertProductoCache(mapped)
  return mapped
}

function emitirProductoActualizado(producto) {
  if (typeof window === 'undefined' || !producto) return
  const evento = new CustomEvent(PRODUCTO_ACTUALIZADO_EVENT, {
    detail: { producto: cloneProducto(producto) },
  })
  window.dispatchEvent(evento)
}

export async function obtenerProductos() {
  return fetchProductosRemote()
}

export async function obtenerProductoPorId(id) {
  if (!id) return null
  const cache = buscarEnCache(id)
  if (cache) return cache
  return fetchProductoByIdRemote(id)
}

export async function crearProducto(payload) {
  const data = normalizarProducto(payload)
  const respuesta = await request(`${BASE_URL}`, {
    method: 'POST',
    body: buildApiPayload(data),
  })
  const normalizado = mapFromApi(respuesta)
  upsertProductoCache(normalizado)
  emitirProductoActualizado(normalizado)
  return normalizado
}

export async function actualizarProducto(id, payload) {
  if (!id) {
    throw new Error('El ID del producto es obligatorio')
  }
  const data = normalizarProducto(payload)
  const apiId = normalizarIdApi(id)
  const respuesta = await request(`${BASE_URL}/${encodeURIComponent(apiId)}`, {
    method: 'PUT',
    body: buildApiPayload(data),
  })
  const normalizado = mapFromApi(respuesta)
  upsertProductoCache(normalizado)
  emitirProductoActualizado(normalizado)
  return normalizado
}

export async function eliminarProducto(id) {
  if (!id) {
    throw new Error('El ID del producto es obligatorio')
  }
  const apiId = normalizarIdApi(id)
  await request(`${BASE_URL}/${encodeURIComponent(apiId)}`, { method: 'DELETE' })
  productosCache.delete(id)
  productosCache.delete(`prd-${apiId}`)
  emitirProductoActualizado({ id: `prd-${apiId || id}`, eliminado: true })
  return true
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

  const producto = await obtenerProductoPorId(id)
  if (!producto) {
    throw new Error('Producto no encontrado')
  }

  const nuevoStock = Number(producto.stock ?? 0) + cantidad
  if (!Number.isInteger(nuevoStock) || nuevoStock < 0) {
    throw new Error('El stock resultante debe ser un numero entero mayor o igual a cero')
  }

  return actualizarProducto(id, { ...producto, stock: nuevoStock })
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

export async function obtenerProducto(id) {
  if (!id) {
    throw new Error('El ID del producto es obligatorio')
  }
  const producto = await obtenerProductoPorId(id)
  if (producto) return producto
  throw new Error('Producto no encontrado')
}
