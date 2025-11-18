import router from '@/router'
import { useSession } from '@/composables/useSession'

function getEnvBaseUrl() {
  const vite = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {}
  const candidates = [
    vite.VITE_API_URL,
    process.env?.VITE_API_URL,
    process.env?.REACT_APP_API_URL,
    process.env?.VUE_APP_API_URL,
  ].filter(Boolean)
  return candidates[0] || 'http://localhost:4000'
}

const BASE_URL = `${String(getEnvBaseUrl()).replace(/\/$/, '')}/reportes`
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

function assertFecha(value, label) {
  if (!value || !DATE_REGEX.test(value)) {
    throw new Error(`La fecha ${label} es inválida (formato esperado YYYY-MM-DD)`)
  }
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
    if (res.status === 401) {
      try {
        await router.push({ name: 'Inicio-sesion' })
      } catch (error) {
        void error
      }
    }
    const message =
      (res.status === 400 && (data?.error || 'Solicitud inválida')) ||
      (data && (data.message || data.error)) ||
      `Error ${res.status}`
    const err = new Error(message)
    err.status = res.status
    err.payload = data
    throw err
  }

  return data
}

function normalizeSerie(items = []) {
  return items
    .map((item = {}) => {
      const fecha = item.fecha ?? item.fechaDia ?? item.dia ?? item.date ?? null
      const total = Number(item.total ?? item.monto ?? item.importe ?? 0)
      return fecha ? { fecha, total } : null
    })
    .filter(Boolean)
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
}

function normalizeTop(items = []) {
  return items
    .map((item = {}) => {
      const productoId =
        item.productoId ??
        item.idProducto ??
        item.id_producto ??
        item.producto?.id ??
        item.id ??
        null
      const nombre =
        item.nombre ??
        item.producto?.nombre ??
        item.nombreProducto ??
        item.nombre_producto ??
        item.descripcion ??
        'Producto'
      const nombreOriginal = item.nombreOriginal ?? item.nombre_original ?? nombre
      const referencia =
        item.referencia ??
        item.codigo ??
        item.codigoProducto ??
        item.codigo_producto ??
        item.producto?.referencia ??
        item.producto?.sku ??
        null
      const sku =
        item.sku ??
        item.codigo ??
        item.producto?.sku ??
        item.producto?.referencia ??
        referencia ??
        null
      const cantidad = Number(item.cantidad ?? item.quantity ?? item.total ?? 0)
      const total = Number(item.total ?? item.monto ?? item.importe ?? 0)
      return {
        productoId: productoId || nombre,
        nombre,
        nombreOriginal,
        referencia,
        sku,
        cantidad,
        total,
      }
    })
    .filter((item) => Number.isFinite(item.cantidad))
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 10)
}

function crearIdFallback() {
  return `rep-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

function normalizeDetalle(items = [], tipo = 'venta') {
  return items
    .map((item = {}) => {
      const id =
        item.id ??
        item.idVenta ??
        item.id_venta ??
        item.idCompra ??
        item.id_compra ??
        (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : crearIdFallback())
      const fecha = item.fecha ?? item.fechaMovimiento ?? item.createdAt ?? null
      const nombre =
        item.cliente?.nombre ??
        item.proveedor?.nombre ??
        item.clienteNombre ??
        item.nombreCliente ??
        item.proveedorNombre ??
        (tipo === 'venta' ? 'Cliente' : 'Proveedor')
      const total = Number(item.total ?? item.monto ?? 0)
      const itemsDetalle = Array.isArray(item.items) ? item.items : item.detalle ?? []
      const lineas = itemsDetalle.map((linea = {}) => ({
        nombre: linea.nombre ?? linea.descripcion ?? 'Producto',
        cantidad: Number(linea.cantidad ?? linea.quantity ?? 0),
      }))
      return { id: String(id), fecha, nombre, total, items: lineas }
    })
    .sort((a, b) => {
      const fechaA = a.fecha ? new Date(a.fecha).getTime() : 0
      const fechaB = b.fecha ? new Date(b.fecha).getTime() : 0
      return fechaB - fechaA
    })
}

function normalizeMetricas(section = {}) {
  return {
    total: Number(section.total ?? section.monto ?? 0),
    cantidad: Number(section.cantidad ?? section.totalRegistros ?? section.count ?? 0),
    ticketPromedio: Number(section.ticketPromedio ?? section.ticket_promedio ?? 0),
  }
}

function normalizeResumen(data = {}, rango = { desde: '', hasta: '' }) {
  return {
    rango,
    ingresos: normalizeMetricas(data.ingresos ?? data.ventas ?? {}),
    egresos: normalizeMetricas(data.egresos ?? data.compras ?? {}),
    resultadoNeto: Number(data.resultadoNeto ?? data.neto ?? 0),
    ventasPorDia: normalizeSerie(data.ventasPorDia ?? data.ventas_diarias ?? []),
    comprasPorDia: normalizeSerie(data.comprasPorDia ?? data.compras_diarias ?? []),
    topProductosVendidos: normalizeTop(data.topProductosVendidos ?? data.topVendidos ?? []),
    topProductosComprados: normalizeTop(data.topProductosComprados ?? data.topComprados ?? []),
    detalleVentas: normalizeDetalle(data.detalleVentas ?? data.ventas ?? [], 'venta'),
    detalleCompras: normalizeDetalle(data.detalleCompras ?? data.compras ?? [], 'compra'),
  }
}

export async function obtenerResumen({ desde, hasta }) {
  const desdeTrim = String(desde || '').trim()
  const hastaTrim = String(hasta || '').trim()
  assertFecha(desdeTrim, 'inicial')
  assertFecha(hastaTrim, 'final')

  const url = new URL(BASE_URL)
  url.searchParams.set('desde', desdeTrim)
  url.searchParams.set('hasta', hastaTrim)

  const data = await request(url.toString(), { method: 'GET' })
  return normalizeResumen(data, { desde: desdeTrim, hasta: hastaTrim })
}
