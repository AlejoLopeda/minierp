import comprasSeed from '@/mocks/compras.json'
import router from '@/router'
import { useSession } from '@/composables/useSession'
import { ajustarStockProducto, obtenerProductoPorId } from '@/services/productoService'

const STORAGE_KEY = 'minierp_compras'

function getEnvBaseUrl() {
  const vite = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {}
  const candidates = [vite.VITE_API_URL, process.env?.VITE_API_URL, process.env?.REACT_APP_API_URL, process.env?.VUE_APP_API_URL].filter(Boolean)
  return candidates[0] || 'http://localhost:4000'
}

const BASE_URL = `${String(getEnvBaseUrl()).replace(/\/$/, '')}/compras`

function deepClone(value) {
  return JSON.parse(JSON.stringify(value))
}

function cloneSeed() {
  return deepClone(comprasSeed || [])
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
    console.warn('[compraService] No se pudo parsear el cache, se restablecera el mock.', error)
  }

  localStorage.removeItem(STORAGE_KEY)
  return null
}

function persist(compras) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(compras))
}

function ensureCompras() {
  const cache = readFromCache()
  if (cache) return cache

  const seed = cloneSeed()
  persist(seed)
  return seed
}

function persistSnapshot(compra) {
  const cache = readFromCache()
  const base = Array.isArray(cache) ? cache : []
  const next = [...base.filter((item) => item.id !== compra.id), compra]
  persist(next)
}

function generarId() {
  const base = Date.now().toString(36)
  const rand = Math.random().toString(36).slice(2, 6)
  return `cmp-${base}-${rand}`
}

function normalizarIdCompra(rawId) {
  if (!rawId && rawId !== 0) return generarId()
  const str = String(rawId)
  return str.startsWith('cmp-') ? str : `cmp-${str}`
}

function normalizarProductoId(productoId) {
  const raw = String(productoId || '').trim()
  if (!raw) return null
  const sinPrefijo = raw.startsWith('prd-') ? raw.slice(4) : raw
  if (/^\d+$/.test(sinPrefijo)) return Number(sinPrefijo)
  return sinPrefijo
}

function normalizarFechaMovimiento(valor) {
  if (!valor) return new Date().toISOString()
  const fecha = new Date(valor)
  if (Number.isNaN(fecha.getTime())) {
    return new Date().toISOString()
  }
  return fecha.toISOString()
}

async function request(path, { method = 'GET', body } = {}) {
  const { token } = useSession()
  const authToken =
    token?.value || localStorage.getItem('minierp_token') || localStorage.getItem('token') || ''
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
  }

  const res = await fetch(path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  const contentType = res.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')
  const data = isJson ? await res.json().catch(() => ({})) : null

  if (!res.ok) {
    if (res.status === 404) {
      const err = new Error('NOT_IMPLEMENTED')
      err.status = 404
      throw err
    }
    if (res.status === 401) {
      try {
        await router.push({ name: 'Inicio-sesion' })
      } catch (e) {
        void e
      }
    }
    const message =
      (res.status === 400 && (data?.error || 'Solicitud invalida')) ||
      (data && (data.message || data.error)) ||
      `Error ${res.status}`
    const err = new Error(message)
    err.status = res.status
    err.payload = data
    throw err
  }

  return data
}

function mapCompraItemFromApi(item = {}) {
  const productoId =
    item.productoId ??
    item.idProducto ??
    item.id_producto ??
    item.producto?.id ??
    item.producto_id ??
    null
  const idFormat = productoId != null ? `prd-${productoId}` : item.producto?.id ?? ''
  const nombre = item.nombre ?? item.producto?.nombre ?? 'Producto'
  const sku =
    item.sku ?? item.producto?.sku ?? item.producto?.referencia ?? item.producto?.codigo ?? ''
  const cantidad = Number(item.cantidad ?? item.cant ?? item.qty ?? 0)
  const precioUnitario = Number(item.precioUnitario ?? item.precio_unitario ?? item.precio ?? 0)
  const subtotal = Number(item.subtotal ?? item.total ?? cantidad * precioUnitario)

  return {
    productoId: idFormat || String(productoId ?? ''),
    sku,
    nombre,
    cantidad,
    precioUnitario,
    subtotal,
  }
}

function mapCompraFromApi(item = {}) {
  const rawId = item.idCompra ?? item.id_compra ?? item.id ?? item.uuid
  const proveedorSrc = item.cliente ?? item.proveedor ?? {}
  const cliente = {
    id:
      proveedorSrc.id ??
      proveedorSrc.idCliente ??
      item.clienteId ??
      item.proveedorId ??
      proveedorSrc.identificador ??
      '',
    nombre:
      proveedorSrc.nombre ??
      proveedorSrc.nombreRazonSocial ??
      item.proveedorNombre ??
      item.clienteNombre ??
      'Proveedor',
    numeroDocumento:
      proveedorSrc.numeroDocumento ??
      proveedorSrc.numero_documento ??
      proveedorSrc.documento ??
      item.proveedorDocumento ??
      item.clienteDocumento ??
      null,
  }

  const itemsRaw =
    item.items ?? item.detalle ?? item.detalles ?? item.detalleCompra ?? item.detalle_compra ?? []
  const items = Array.isArray(itemsRaw) ? itemsRaw.map(mapCompraItemFromApi) : []

  return {
    id: normalizarIdCompra(rawId),
    fecha: item.fecha ?? item.fechaCompra ?? item.createdAt ?? new Date().toISOString(),
    cliente,
    items,
    total: Number(item.total ?? item.monto_total ?? item.montoTotal ?? 0),
    notas: item.notas ?? item.observaciones ?? '',
  }
}

function normalizarCliente(payload = {}) {
  const fuente = payload.cliente || {}

  const clienteId = String(
    payload.clienteId ??
      fuente.id ??
      fuente.clienteId ??
      fuente.identificador ??
      ''
  ).trim()

  const clienteNombre = String(
    payload.clienteNombre ??
      fuente.nombre ??
      fuente.nombreRazonSocial ??
      fuente.nombreCliente ??
      ''
  ).trim()

  const clienteDocumento = String(
    payload.clienteDocumento ??
      fuente.numeroDocumento ??
      fuente.numero_documento ??
      fuente.documento ??
      ''
  ).trim()

  if (!clienteId) {
    throw new Error('Debes seleccionar un cliente')
  }

  if (!clienteNombre) {
    throw new Error('El cliente seleccionado no tiene nombre valido')
  }

  return {
    id: clienteId,
    nombre: clienteNombre,
    numeroDocumento: clienteDocumento || null,
  }
}

function sanitizarNotas(value) {
  return typeof value === 'string' ? value.trim() : ''
}

async function prepararItems(itemsPayload = []) {
  if (!Array.isArray(itemsPayload) || itemsPayload.length === 0) {
    throw new Error('Debes agregar al menos un producto a la compra')
  }

  const acumulados = new Map()
  const preciosConfigurados = new Map()

  itemsPayload.forEach((raw) => {
    const productoId = String(raw?.productoId || '').trim()
    const cantidad = Number(raw?.cantidad ?? 0)
    const precioUnitarioPersonalizado = Number(raw?.precioUnitario ?? raw?.precio ?? Number.NaN)

    if (!productoId) {
      throw new Error('Al menos un producto no es valido')
    }

    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      throw new Error('La cantidad de cada producto debe ser un numero entero mayor a cero')
    }

    const actual = acumulados.get(productoId) || 0
    acumulados.set(productoId, actual + cantidad)

    if (Number.isFinite(precioUnitarioPersonalizado) && precioUnitarioPersonalizado >= 0) {
      // Tomamos el ultimo precio ingresado para ese producto
      preciosConfigurados.set(productoId, Number(precioUnitarioPersonalizado.toFixed(2)))
    }
  })

  if (acumulados.size === 0) {
    throw new Error('No se pudo interpretar la lista de productos seleccionados')
  }

  const items = []

  for (const [productoId, cantidad] of acumulados.entries()) {
    const producto = await obtenerProductoPorId(productoId)
    if (!producto) {
      throw new Error('Uno de los productos seleccionados ya no esta disponible')
    }

    const precioBase = Number(producto.precio ?? 0)
    const precioConfigurado = preciosConfigurados.get(productoId)
    const precioUnitario = Number.isFinite(precioConfigurado) ? precioConfigurado : precioBase

    if (!Number.isFinite(precioUnitario) || precioUnitario < 0) {
      throw new Error('El precio unitario debe ser un numero mayor o igual a cero')
    }

    const subtotal = Number((precioUnitario * cantidad).toFixed(2))

    items.push({
      productoId,
      sku: producto.sku,
      nombre: producto.nombre,
      cantidad,
      precioUnitario: Number(precioUnitario.toFixed(2)),
      subtotal,
    })
  }

  const total = Number(items.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2))

  return { items, total }
}

async function prepararCompra(payload) {
  const cliente = normalizarCliente(payload || {})
  const notas = sanitizarNotas(payload?.notas)
  const { items, total } = await prepararItems(payload?.items || [])
  const fecha = normalizarFechaMovimiento(payload?.fecha)
  return { cliente, notas, items, total, fecha }
}

async function crearCompraLocal({ cliente, notas, items, total, fecha }) {
  const compras = ensureCompras()

  const nuevaCompra = {
    id: generarId(),
    fecha: fecha || new Date().toISOString(),
    cliente,
    items,
    total,
    notas,
  }

  const actualizadas = [...compras, nuevaCompra]
  const ajustesAplicados = []

  try {
    for (const item of items) {
      await ajustarStockProducto(item.productoId, item.cantidad)
      ajustesAplicados.push(item)
    }
    persist(actualizadas)
  } catch (error) {
    if (ajustesAplicados.length) {
      for (const item of ajustesAplicados) {
        try {
          await ajustarStockProducto(item.productoId, -item.cantidad)
        } catch (_) {
          // no-op
        }
      }
    }
    throw error
  }

  return nuevaCompra
}

export async function obtenerCompras() {
  try {
    const data = await request(BASE_URL, { method: 'GET' })
    const items = Array.isArray(data) ? data : data?.items || []
    const normalizadas = items.map(mapCompraFromApi)
    persist(normalizadas)
    return normalizadas
  } catch (error) {
    if (error?.message !== 'NOT_IMPLEMENTED') {
      throw error
    }
  }
  return ensureCompras()
}

export async function crearCompra(payload) {
  const draft = await prepararCompra(payload)

  try {
    const data = await request(BASE_URL, {
      method: 'POST',
      body: {
        clienteId: draft.cliente.id,
        clienteNombre: draft.cliente.nombre,
        clienteDocumento: draft.cliente.numeroDocumento,
        notas: draft.notas,
        fecha: draft.fecha,
        total: draft.total,
        items: draft.items.map((item) => ({
          productId: normalizarProductoId(item.productoId),
          quantity: Number(item.cantidad),
          unitPrice: Number(item.precioUnitario),
          subtotal: Number(item.subtotal),
        })),
      },
    })
    const compra = mapCompraFromApi(data)
    persistSnapshot(compra)
    return compra
  } catch (error) {
    if (error?.message !== 'NOT_IMPLEMENTED' && error?.status !== 404) {
      throw error
    }
  }

  return crearCompraLocal(draft)
}
