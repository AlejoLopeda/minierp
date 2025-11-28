import router from '@/router'
import { useSession } from '@/composables/useSession'
import { obtenerProductoPorId } from '@/services/productoService'
import { obtenerTercero } from '@/services/terceroService'

function getEnvBaseUrl() {
  const vite = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {}
  const candidates = [vite.VITE_API_URL, process.env?.VITE_API_URL, process.env?.REACT_APP_API_URL, process.env?.VUE_APP_API_URL].filter(Boolean)
  return candidates[0] || 'http://localhost:4000'
}

const BASE_URL = `${String(getEnvBaseUrl()).replace(/\/$/, '')}/ventas`

function normalizarIdVenta(rawId) {
  if (!rawId && rawId !== 0) return ''
  return String(rawId)
}

const clienteCache = new Map()

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

function combinarFechaHora(fechaRaw, horaRaw) {
  const fechaStr = fechaRaw ? String(fechaRaw).trim() : ''
  const horaStr = horaRaw ? String(horaRaw).trim() : ''
  if (!fechaStr || !horaStr) return null

  const horaNormalizada = /^\d{1,2}:\d{2}(:\d{2})?$/.test(horaStr) ? horaStr : `${horaStr}:00`
  const combinada = new Date(`${fechaStr}T${horaNormalizada}`)
  if (!Number.isNaN(combinada.getTime())) {
    return combinada.toISOString()
  }
  return null
}

function normalizarFechaVentaDesdeApi(item = {}) {
  const fechaBase =
    item.fecha ??
    item.fechaVenta ??
    item.fecha_venta ??
    item.fechaMovimiento ??
    item.fecha_movimiento ??
    item.fechaRegistro ??
    item.fecha_registro ??
    item.createdAt ??
    item.created_at ??
    null

  const hora =
    item.hora ??
    item.horaVenta ??
    item.hora_venta ??
    item.horaMovimiento ??
    item.hora_movimiento ??
    item.horaRegistro ??
    item.hora_registro ??
    null

  return combinarFechaHora(fechaBase, hora) || normalizarFechaMovimiento(fechaBase)
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

function mapVentaItemFromApi(item = {}) {
  const productoId =
    item.productoId ??
    item.idProducto ??
    item.id_producto ??
    item.producto?.id ??
    item.producto_id ??
    null
  const idFormat = productoId != null ? `prd-${productoId}` : item.producto?.id ?? ''
  const nombre =
    item.nombre ??
    item.nombreProducto ??
    item.nombre_producto ??
    item.descripcion ??
    item.productoNombre ??
    item.producto_nombre ??
    (typeof item.producto === 'string' ? item.producto : null) ??
    item.producto?.nombre ??
    item.producto?.nombreProducto ??
    item.producto?.nombre_producto ??
    'Producto'
  const sku =
    item.sku ??
    item.codigo ??
    item.codigoProducto ??
    item.codigo_producto ??
    item.referencia ??
    item.producto?.sku ??
    item.producto?.referencia ??
    item.producto?.codigo ??
    ''
  const cantidad = Number(
    item.cantidad ??
      item.cant ??
      item.qty ??
      item.cantidadVendida ??
      item.cantidad_vendida ??
      item.cantidadProducto ??
      item.cantidad_producto ??
      0
  )
  const precioUnitario = Number(
    item.precioUnitario ??
      item.precio_unitario ??
      item.precio ??
      item.precioVenta ??
      item.precio_venta ??
      item.valorUnitario ??
      item.valor_unitario ??
      0
  )
  const subtotal = Number(
    item.subtotal ??
      item.sub_total ??
      item.totalLinea ??
      item.total_linea ??
      item.total ??
      item.importe ??
      cantidad * precioUnitario
  )

  return {
    productoId: idFormat || String(productoId ?? ''),
    sku,
    nombre,
    cantidad,
    precioUnitario,
    subtotal,
  }
}

function mapVentaFromApi(item = {}) {
  const rawId = item.idVenta ?? item.id_venta ?? item.id ?? item.uuid ?? item.codigo
  const clienteSrcRaw = item.cliente ?? item.client ?? item.customer ?? {}
  const clienteSrc = typeof clienteSrcRaw === 'string' ? { nombre: clienteSrcRaw } : clienteSrcRaw
  const cliente = {
    id:
      clienteSrc.id ??
      clienteSrc.idCliente ??
      clienteSrc.id_cliente ??
      item.clienteId ??
      item.cliente_id ??
      clienteSrc.identificador ??
      '',
    nombre:
      clienteSrc.nombre ??
      clienteSrc.nombreRazonSocial ??
      clienteSrc.nombre_razon_social ??
      clienteSrc.razonSocial ??
      clienteSrc.razon_social ??
      clienteSrc.nombre_razon_social ??
      clienteSrc.nombreCliente ??
      clienteSrc.nombre_cliente ??
      item.clienteNombre ??
      item.nombreCliente ??
      item.nombreRazonSocial ??
      item.nombre_razon_social ??
      item.razonSocial ??
      item.razon_social ??
      item.razonSocialCliente ??
      item.nombre_razon_social_cliente ??
      item.nombre_cliente ??
      'Cliente',
    numeroDocumento:
      clienteSrc.numeroDocumento ??
      clienteSrc.numero_documento ??
      clienteSrc.documento ??
      clienteSrc.nro_documento ??
      item.clienteDocumento ??
      item.numeroDocumentoCliente ??
      item.numero_documento_cliente ??
      null,
  }

  const itemsRaw =
    item.items ??
    item.detalle ??
    item.detalles ??
    item.detalleVenta ??
    item.detalle_venta ??
    item.detalleVentas ??
    item.detalle_ventas ??
    item.productos ??
    []
  const itemsList = Array.isArray(itemsRaw) ? itemsRaw : itemsRaw ? [itemsRaw] : []
  const items = itemsList.map(mapVentaItemFromApi)

  return {
    id: normalizarIdVenta(rawId),
    fecha: normalizarFechaVentaDesdeApi(item),
    cliente,
    items,
    total: Number(
      item.total ??
        item.monto_total ??
        item.montoTotal ??
        item.importe_total ??
        item.importe ??
        item.precioTotal ??
        0
    ),
    notas: item.notas ?? item.observaciones ?? item.observacion ?? '',
    metodoPago: item.metodoPago ?? item.metodo_pago ?? null,
  }
}

async function enriquecerCliente(venta) {
  if (!venta?.cliente?.id) return venta
  const nombreActual = venta.cliente?.nombre || ''
  if (nombreActual && nombreActual !== 'Cliente') return venta

  const cacheHit = clienteCache.get(venta.cliente.id)
  if (cacheHit) {
    return {
      ...venta,
      cliente: { ...venta.cliente, nombre: cacheHit.nombre || venta.cliente.nombre },
    }
  }

  try {
    const tercero = await obtenerTercero(venta.cliente.id)
    const nombre = tercero?.nombreRazonSocial || tercero?.nombre || nombreActual || 'Cliente'
    const numeroDocumento =
      tercero?.numeroDocumento || tercero?.numero_documento || venta.cliente.numeroDocumento || null
    clienteCache.set(venta.cliente.id, { nombre, numeroDocumento })
    return { ...venta, cliente: { ...venta.cliente, nombre, numeroDocumento } }
  } catch (_) {
    return venta
  }
}

async function enriquecerProductos(venta) {
  if (!Array.isArray(venta?.items) || !venta.items.length) return venta

  const items = await Promise.all(
    venta.items.map(async (item) => {
      const nombreActual = item?.nombre || ''
      const needsNombre = !nombreActual || nombreActual === 'Producto'
      if (!needsNombre) return item

      try {
        const producto = await obtenerProductoPorId(item.productoId)
        if (!producto) return item
        return {
          ...item,
          nombre: producto.nombre || nombreActual || 'Producto',
          sku: producto.sku || item.sku,
        }
      } catch (_) {
        return item
      }
    })
  )

  return { ...venta, items }
}

async function enriquecerVenta(venta) {
  const conCliente = await enriquecerCliente(venta)
  return enriquecerProductos(conCliente)
}

function normalizarCliente(payload = {}) {
  const fuente = payload.cliente || {}

  const clienteId = String(
    payload.clienteId ?? fuente.id ?? fuente.clienteId ?? fuente.identificador ?? ''
  ).trim()

  const clienteNombre = String(
    payload.clienteNombre ?? fuente.nombre ?? fuente.nombreRazonSocial ?? fuente.nombreCliente ?? ''
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

async function prepararVenta(payload) {
  const cliente = normalizarCliente(payload || {})
  const notas = sanitizarNotas(payload?.notas)
  const { items, total } = await prepararItems(payload?.items || [])
  const fecha = payload?.fecha ? normalizarFechaMovimiento(payload?.fecha) : null
  return { cliente, notas, items, total, fecha }
}

export async function obtenerVentas() {
  const data = await request(BASE_URL, { method: 'GET' })
  const items = Array.isArray(data) ? data : data?.items || []
  const basicas = items.map(mapVentaFromApi)
  return Promise.all(basicas.map(enriquecerVenta))
}

export async function crearVenta(payload) {
  const draft = await prepararVenta(payload)
  const idClienteRaw = draft.cliente.id ? Number(draft.cliente.id) : undefined
  const idCliente = Number.isInteger(idClienteRaw) && idClienteRaw > 0 ? idClienteRaw : undefined

  const data = await request(BASE_URL, {
    method: 'POST',
    body: {
      idCliente,
      fecha: draft.fecha ?? null,
      metodoPago: payload?.metodoPago || undefined,
      items: draft.items.map((item) => {
        const normalizado = normalizarProductoId(item.productoId)
        const esNumerico = /^\d+$/.test(String(normalizado))
        const productId = esNumerico ? Number(normalizado) : String(normalizado || '')
        if ((esNumerico && (!Number.isInteger(productId) || productId <= 0)) || !productId) {
          throw new Error('Cada producto debe tener un ID válido')
        }
        return {
          productId,
          quantity: Number(item.cantidad),
          unitPrice: Number(item.precioUnitario),
        }
      }),
    },
  })
  const ventaBase = mapVentaFromApi(data)
  return enriquecerVenta(ventaBase)
}
