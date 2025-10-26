import ventasSeed from '@/mocks/ventas.json'
import { ajustarStockProducto, obtenerProductoPorId } from '@/services/productoService'

const STORAGE_KEY = 'minierp_ventas'

function deepClone(value) {
  return JSON.parse(JSON.stringify(value))
}

function cloneSeed() {
  return deepClone(ventasSeed || [])
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
    console.warn('[ventaService] No se pudo parsear el cache, se restablecera el mock.', error)
  }

  localStorage.removeItem(STORAGE_KEY)
  return null
}

function persist(ventas) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ventas))
}

function ensureVentas() {
  const cache = readFromCache()
  if (cache) return cache

  const seed = cloneSeed()
  persist(seed)
  return seed
}

function generarId() {
  const base = Date.now().toString(36)
  const rand = Math.random().toString(36).slice(2, 6)
  return `vta-${base}-${rand}`
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
    throw new Error('Debes agregar al menos un producto a la venta')
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

export async function obtenerVentas() {
  return ensureVentas()
}

export async function crearVenta(payload) {
  const cliente = normalizarCliente(payload || {})
  const notas = sanitizarNotas(payload?.notas)
  const { items, total } = await prepararItems(payload?.items || [])

  const ventas = ensureVentas()

  const nuevaVenta = {
    id: generarId(),
    fecha: new Date().toISOString(),
    cliente,
    items,
    total,
    notas,
  }

  const actualizadas = [...ventas, nuevaVenta]

  const ajustesAplicados = []

  try {
    // Al crear una venta restamos stock: delta = -cantidad
    for (const item of items) {
      await ajustarStockProducto(item.productoId, -item.cantidad)
      ajustesAplicados.push(item)
    }
    persist(actualizadas)
  } catch (error) {
    // rollback: devolver stock
    if (ajustesAplicados.length) {
      for (const item of ajustesAplicados) {
        try {
          await ajustarStockProducto(item.productoId, item.cantidad)
        } catch (_) {
          // no-op, preferimos no romper la app si falla el rollback
        }
      }
    }
    throw error
  }

  return nuevaVenta
}
