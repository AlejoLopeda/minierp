import productosSeed from '@/mocks/productos.json'

const STORAGE_KEY = 'minierp_productos'
const PRODUCTO_ACTUALIZADO_EVENT = 'minierp:producto-actualizado'

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
  return ensureProductos()
}

export async function obtenerProductoPorId(id) {
  if (!id) return null
  const productos = ensureProductos()
  const producto = productos.find((item) => item.id === id)
  return cloneProducto(producto)
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
