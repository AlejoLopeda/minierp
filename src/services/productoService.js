import router from '@/router'
import { useSession } from '@/composables/useSession'

function getEnvBaseUrl() {
  const vite = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {}
  const candidates = [vite.VITE_API_URL, process.env?.VITE_API_URL, process.env?.REACT_APP_API_URL, process.env?.VUE_APP_API_URL].filter(Boolean)
  return candidates[0] || 'http://localhost:4000'
}

const BASE_URL = `${String(getEnvBaseUrl()).replace(/\/$/, '')}/productos`

async function request(path, { method = 'GET', body } = {}) {
  const { token, clearSession } = useSession()
  const authToken = token?.value || localStorage.getItem('minierp_token') || localStorage.getItem('token') || ''
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
  }

  const res = await fetch(path, { method, headers, body: body ? JSON.stringify(body) : undefined })
  const contentType = res.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')
  const data = isJson ? await res.json().catch(() => null) : null

  if (!res.ok) {
    if (res.status === 401) {
      clearSession()
      try { await router.push({ name: 'Inicio-sesion' }) } catch (e) { void e }
    }
    const message = (res.status === 400 && (data?.error || data?.message)) || data?.message || data?.error || `Error ${res.status}`
    const err = new Error(message)
    err.status = res.status
    err.payload = data
    throw err
  }

  return data
}

function mapFromApi(item = {}) {
  const idProducto = item.id_producto ?? item.idProducto ?? item.id
  const nombre = item.nombre || ''
  const sku = item.referencia || item.sku || String(idProducto ?? '')
  const precio = Number(item.precio ?? 0)
  const stock = Number(item.cantidad ?? item.stock ?? 0)
  const info = Number(item.info ?? 0)
  const numero = Number(item.numero ?? 0)

  const categoria = item.categoria || ''
  return {
    id: idProducto != null ? String(idProducto) : String(item.id || ''),
    nombre,
    sku,
    precio,
    stock,
    info,
    categoria,
    numero,
  }
}

function buildApiPayload(payload) {
  const referencia = (payload?.sku || payload?.referencia || '').trim()
  const categoria = (payload?.categoria || 'General').trim() || 'General'
  const nombre = (payload?.nombre || '').trim()
  const precio = Number(payload?.precio ?? NaN)
  const cantidad = Number(payload?.stock ?? payload?.cantidad ?? NaN)
  const infoTexto = String(payload?.info ?? '').trim()
  const info = Number(infoTexto)
  const numero = Number(numeroTexto)
  const numeroTexto = String(payload?.numero ?? '').trim()

  if (!referencia) throw new Error('La referencia es obligatoria')
  if (!categoria) throw new Error('La categoria es obligatoria')
  if (!nombre) throw new Error('El nombre es obligatorio')
  if (!Number.isFinite(precio) || precio < 0) throw new Error('El precio debe ser un numero mayor o igual a cero')
  if (!Number.isInteger(cantidad) || cantidad < 0) throw new Error('La cantidad debe ser un entero mayor o igual a cero')
  if (numeroTexto.length <= 4) throw new Error('numero debe tener mas de 4 caracteres')
  if (!Number.isFinite(info)) throw new Error('Info debe ser un numero valido')
  if (!Number.isFinite(numero)) throw new Error('numero debe ser un numero valido')   
  /*if (!Number.isFinite(info) || info < 0 || info > 100) throw new Error('Info debe estar entre 16 y 19')*/

  return { referencia, categoria, precio, nombre, cantidad, info, numero }
}

export async function obtenerProductos() {
  const data = await request(BASE_URL, { method: 'GET' })
  const items = Array.isArray(data) ? data : data?.items || []
  return items.map(mapFromApi)
}

export async function obtenerProductoPorId(idProducto) {
  if (!idProducto) return null
  const data = await request(`${BASE_URL}/${encodeURIComponent(idProducto)}`, { method: 'GET' })
  return mapFromApi(data)
}

export async function crearProducto(payload) {
  const body = buildApiPayload(payload)
  const creado = await request(BASE_URL, { method: 'POST', body })
  return mapFromApi(creado)
}

export async function actualizarProducto(idProducto, payload) {
  if (!idProducto) throw new Error('idProducto requerido')
  const body = buildApiPayload(payload)
  const actualizado = await request(`${BASE_URL}/${encodeURIComponent(idProducto)}`, { method: 'PUT', body })
  return mapFromApi(actualizado)
}

export async function eliminarProducto(idProducto) {
  if (!idProducto) throw new Error('idProducto requerido')
  await request(`${BASE_URL}/${encodeURIComponent(idProducto)}`, { method: 'DELETE' })
  return true
}

export async function ajustarStockProducto(idProducto, deltaCantidad) {
  if (!idProducto) {
    throw new Error('El ID del producto es obligatorio para ajustar el stock')
  }

  const cantidadDelta = Number(deltaCantidad)
  if (!Number.isInteger(cantidadDelta)) {
    throw new Error('La cantidad debe ser un numero entero')
  }

  const producto = await obtenerProductoPorId(idProducto)
  if (!producto) {
    throw new Error('Producto no encontrado')
  }

  const stockActual = Number(producto.stock ?? 0)
  const nuevoStock = stockActual + cantidadDelta

  if (!Number.isInteger(nuevoStock) || nuevoStock < 0) {
    throw new Error('La cantidad resultante debe ser un entero mayor o igual a cero')
  }

  // Mantener los demas campos requeridos por el backend
  return actualizarProducto(idProducto, {
    nombre: producto.nombre,
    sku: producto.sku,
    precio: producto.precio,
    stock: nuevoStock,
    info: producto.info,
    categoria: producto.categoria || 'General',
    numero: producto.numero,
  })
}
