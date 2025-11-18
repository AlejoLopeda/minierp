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
  const idProducto = item.idProducto ?? item.id_producto ?? item.id
  const nombre = item.nombre || 'Producto'
  const referencia = item.referencia ?? item.sku ?? item.codigo ?? item.codigoProducto ?? item.codigo_producto ?? String(idProducto ?? '')
  const categoria = item.categoria ?? item.category ?? ''
  const precio = Number(item.precioBase ?? item.precio_base ?? item.precio ?? 0)
  const stock = Number(item.cantidad ?? item.stockActual ?? item.stock_actual ?? item.stock ?? 0)
  const id = idProducto != null ? `prd-${idProducto}` : String(item.id || '')
  return { id, nombre, sku: String(referencia || ''), precio, stock, categoria }
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

function upsertProductoLocal(producto) {
  if (!producto || typeof producto !== 'object') return
  const productos = ensureProductos()
  const index = productos.findIndex((item) => item.id === producto.id || item.sku === producto.sku)
  const actualizados = [...productos]
  if (index === -1) {
    actualizados.push(producto)
  } else {
    actualizados[index] = producto
  }
  persist(actualizados)
}

function actualizarProductoLocal(id, data) {
  const productos = ensureProductos()
  const index = productos.findIndex(
    (item) => item.id === id || item.sku === data.sku
  )
  const actualizados = [...productos]
  if (index === -1) {
    const nuevo = {
      id: id || generarId(),
      ...data,
    }
    actualizados.push(nuevo)
    persist(actualizados)
    emitirProductoActualizado(nuevo)
    return nuevo
  }
  const base = actualizados[index]
  const actualizado = { ...base, ...data }
  actualizados[index] = actualizado
  persist(actualizados)
  emitirProductoActualizado(actualizado)
  return actualizado
}

function extraerIdNumerico(id) {
  if (id == null) return ''
  const raw = String(id)
  const match = raw.match(/\d+$/)
  return match ? match[0] : raw
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
  const precio = Number.parseFloat(
    payload?.precio ?? payload?.precioBase ?? payload?.precio_base ?? ''
  )
  const stock = Number.parseInt(
    payload?.stock ?? payload?.cantidad ?? payload?.stockActual ?? payload?.stock_actual ?? 0,
    10
  )

  if (!nombre) {
    throw new Error('El nombre del producto es obligatorio')
  }

  if (!sku) {
    throw new Error('El SKU del producto es obligatorio')
  }

  if (!categoria) {
    throw new Error('La categoria del producto es obligatoria')
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

function crearProductoLocal(data) {
  const productos = ensureProductos()

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

function generarId() {
  const base = Date.now().toString(36)
  const rand = Math.random().toString(36).slice(2, 6)
  return `prd-${base}-${rand}`
}

export async function obtenerProductos() {
  try {
    const lista = await fetchProductosRemote()
    if (Array.isArray(lista)) {
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
  const data = normalizarProducto(payload)

  try {
    const respuesta = await request(`${BASE_URL}`, {
      method: 'POST',
      body: buildApiPayload(data),
    })
    const normalizado = mapFromApi(respuesta)
    upsertProductoLocal(normalizado)
    emitirProductoActualizado(normalizado)
    return normalizado
  } catch (error) {
    if (error?.message !== 'NOT_IMPLEMENTED' && error?.status !== 404) {
      throw error
    }
  }

  return crearProductoLocal(data)
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

export async function obtenerProducto(id) {
  if (!id) {
    throw new Error('El ID del producto es obligatorio')
  }
  const numericId = extraerIdNumerico(id)
  try {
    const remoto = await fetchProductoByIdRemote(numericId || id)
    if (remoto) {
      upsertProductoLocal(remoto)
      return remoto
    }
  } catch (error) {
    if (error?.message !== 'NOT_IMPLEMENTED' && error?.status !== 404) {
      throw error
    }
  }
  const local = await obtenerProductoPorId(id)
  if (local) return local
  throw new Error('Producto no encontrado')
}

export async function actualizarProducto(id, payload) {
  if (!id) {
    throw new Error('El ID del producto es obligatorio')
  }
  const data = normalizarProducto(payload)
  const numericId = extraerIdNumerico(id)
  try {
    const respuesta = await request(`${BASE_URL}/${encodeURIComponent(numericId || id)}`, {
      method: 'PUT',
      body: buildApiPayload(data),
    })
    const normalizado = mapFromApi(respuesta)
    upsertProductoLocal(normalizado)
    emitirProductoActualizado(normalizado)
    return normalizado
  } catch (error) {
    if (error?.message !== 'NOT_IMPLEMENTED' && error?.status !== 404) {
      throw error
    }
  }
  return actualizarProductoLocal(id, data)
}


