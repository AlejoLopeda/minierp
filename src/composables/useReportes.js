import { computed, ref } from 'vue'
import { obtenerResumen } from '@/services/reporteService'
import { descargarCSV as descargarCsvService } from '@/services/reportesService'
import { generarReportePDF } from '@/services/reportePdfService'
import { useProductos } from '@/composables/useProductos'

const hoyISO = () => new Date().toISOString().slice(0, 10)
const addDays = (date, delta) => {
  const x = new Date(date)
  x.setDate(x.getDate() + delta)
  return x
}

function crearResumenVacio(desde, hasta) {
  return {
    rango: { desde, hasta },
    ingresos: { total: 0, cantidad: 0, ticketPromedio: 0 },
    egresos: { total: 0, cantidad: 0, ticketPromedio: 0 },
    resultadoNeto: 0,
    ventasPorDia: [],
    comprasPorDia: [],
    topProductosVendidos: [],
    topProductosComprados: [],
    detalleVentas: [],
    detalleCompras: [],
  }
}

function formatItemsLinea(items = []) {
  if (!Array.isArray(items) || !items.length) return ''
  return items
    .map((it) => `${it.nombreOriginal || it.nombre || 'Producto'} x${Number(it.cantidad || 0)}`)
    .join(', ')
}

export function useReportes() {
  const fechaFin = ref(hoyISO())
  const fechaInicio = ref(addDays(new Date(), -30).toISOString().slice(0, 10))

  const resumen = ref(crearResumenVacio(fechaInicio.value, fechaFin.value))
  const isLoading = ref(false)
  const errorMessage = ref('')
  const { productos, cargarProductos } = useProductos()
  let catalogoSincronizado = false

  const ensureCatalogo = async () => {
    if (catalogoSincronizado) return
    try {
      await cargarProductos({ force: false })
    } catch (error) {
      void error
    } finally {
      catalogoSincronizado = true
    }
  }

  const presetRango = (preset) => {
    const hoy = new Date()
    if (preset === 'hoy') {
      fechaInicio.value = hoy.toISOString().slice(0, 10)
      fechaFin.value = hoy.toISOString().slice(0, 10)
    } else if (preset === '7d') {
      fechaInicio.value = addDays(hoy, -6).toISOString().slice(0, 10)
      fechaFin.value = hoy.toISOString().slice(0, 10)
    } else if (preset === 'mes') {
      const first = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
      fechaInicio.value = first.toISOString().slice(0, 10)
      fechaFin.value = hoy.toISOString().slice(0, 10)
    } else if (preset === 'anio') {
      const first = new Date(hoy.getFullYear(), 0, 1)
      fechaInicio.value = first.toISOString().slice(0, 10)
      fechaFin.value = hoy.toISOString().slice(0, 10)
    }
  }

  const resumenActual = computed(() => {
    if (
      resumen.value &&
      resumen.value.rango?.desde === fechaInicio.value &&
      resumen.value.rango?.hasta === fechaFin.value
    ) {
      return resumen.value
    }
    return crearResumenVacio(fechaInicio.value, fechaFin.value)
  })

  const totalVentasMonto = computed(() => resumenActual.value.ingresos.total)
  const totalComprasMonto = computed(() => resumenActual.value.egresos.total)
  const neto = computed(() => resumenActual.value.resultadoNeto)
  const totalVentasCantidad = computed(() => resumenActual.value.ingresos.cantidad)
  const totalComprasCantidad = computed(() => resumenActual.value.egresos.cantidad)
  const ticketPromedioVentas = computed(() =>
    totalVentasCantidad.value ? totalVentasMonto.value / totalVentasCantidad.value : 0
  )
  const ticketPromedioCompras = computed(() =>
    totalComprasCantidad.value ? totalComprasMonto.value / totalComprasCantidad.value : 0
  )

  const serieVentas = computed(() => resumenActual.value.ventasPorDia)
  const serieCompras = computed(() => resumenActual.value.comprasPorDia)
  const maxTotalDiario = computed(() => {
    const all = [
      ...serieVentas.value.map((x) => x.total),
      ...serieCompras.value.map((x) => x.total),
    ]
    return all.length ? Math.max(...all) : 1
  })

  const topVendidos = computed(() => resumenActual.value.topProductosVendidos)
  const topComprados = computed(() => resumenActual.value.topProductosComprados)
  const totalItemsVendidos = computed(() =>
    topVendidos.value.reduce((acc, item) => acc + Number(item.cantidad || 0), 0)
  )
  const totalItemsComprados = computed(() =>
    topComprados.value.reduce((acc, item) => acc + Number(item.cantidad || 0), 0)
  )
  const topVentaPrincipal = computed(() => topVendidos.value[0] || null)
  const topCompraPrincipal = computed(() => topComprados.value[0] || null)
  const detalleVentas = computed(() => resumenActual.value.detalleVentas)
  const detalleCompras = computed(() => resumenActual.value.detalleCompras)

  const currencyFormatter = new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  })
  const dateFormatter = new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium' })
  const formatCurrency = (v) => currencyFormatter.format(Number.isFinite(Number(v)) ? Number(v) : 0)
  const formatDate = (v) => {
    const d = v ? new Date(v) : null
    if (!d || Number.isNaN(d.getTime())) return '—'
    return dateFormatter.format(d)
  }
  const calcAltura = (valor, max) => {
    const v = Number(valor)
    const m = Number(max || 1)
    const pct = m > 0 ? Math.max(2, Math.round((v / m) * 100)) : 2
    return `${pct}%`
  }

  const descargarVentasCSV = () => {
    if (!detalleVentas.value.length) return
    const header = ['Fecha', 'Cliente', 'Items', 'Total']
    const rows = detalleVentas.value.map((venta) => [
      formatDate(venta.fecha),
      venta.nombre || 'Cliente',
      formatItemsLinea(venta.items),
      String(Number(venta.total || 0).toFixed(2)),
    ])
    descargarCsvService(`ventas_${fechaInicio.value}_a_${fechaFin.value}.csv`, [header, ...rows])
  }

  const descargarComprasCSV = () => {
    if (!detalleCompras.value.length) return
    const header = ['Fecha', 'Proveedor', 'Items', 'Total']
    const rows = detalleCompras.value.map((compra) => [
      formatDate(compra.fecha),
      compra.nombre || 'Proveedor',
      formatItemsLinea(compra.items),
      String(Number(compra.total || 0).toFixed(2)),
    ])
    descargarCsvService(`compras_${fechaInicio.value}_a_${fechaFin.value}.csv`, [header, ...rows])
  }

  const descargarResumenCSV = () => {
    const filas = [
      ['Periodo', `${fechaInicio.value} a ${fechaFin.value}`],
      ['Ingresos (monto)', Number(totalVentasMonto.value.toFixed(2))],
      ['Ingresos (cantidad)', totalVentasCantidad.value],
      ['Ticket promedio ventas', Number(ticketPromedioVentas.value.toFixed(2))],
      ['Egresos (monto)', Number(totalComprasMonto.value.toFixed(2))],
      ['Egresos (cantidad)', totalComprasCantidad.value],
      ['Ticket promedio compras', Number(ticketPromedioCompras.value.toFixed(2))],
      ['Resultado neto', Number(neto.value.toFixed(2))],
      ['Articulos vendidos', totalItemsVendidos.value],
      ['Articulos comprados', totalItemsComprados.value],
    ]
    descargarCsvService(`resumen_${fechaInicio.value}_a_${fechaFin.value}.csv`, filas)
  }

  const mapearNombreProducto = (item) => {
    const catalogo = productos.value || []
    if (!item?.productoId && !item?.sku && !item?.referencia) return item
    const rawId = String(item.productoId ?? '').trim()
    const normalizedId = rawId.replace(/^prd-/, '')
    const skuLower = (item.sku || item.referencia || '').toString().toLowerCase()
    const match = catalogo.find((producto) => {
      const candidateId = String(producto.id || '').replace(/^prd-/, '')
      const isSameId =
        candidateId === normalizedId ||
        String(producto.id || '') === rawId ||
        (!rawId && skuLower && String(producto.sku || '').toLowerCase() === skuLower)
      if (isSameId) return true
      if (skuLower && String(producto.sku || '').toLowerCase() === skuLower) return true
      return false
    })
    const apiNombre = item.nombreOriginal || item.nombre
    if (!match) {
      return {
        ...item,
        nombre: apiNombre || item.nombre,
        nombreOriginal: apiNombre || item.nombre,
        referencia: item.referencia || item.sku || null,
      }
    }
    return {
      ...item,
      nombre: apiNombre || match.nombre || item.nombre,
      nombreOriginal: apiNombre || match.nombre || item.nombre,
      sku: match.sku || item.sku,
      referencia: item.referencia || match.sku || item.sku || null,
    }
  }

  const enriquecerConCatalogo = (data) => {
    if (!data) return data
    return {
      ...data,
      topProductosVendidos: (data.topProductosVendidos || []).map(mapearNombreProducto),
      topProductosComprados: (data.topProductosComprados || []).map(mapearNombreProducto),
    }
  }

  const cargarResumen = async () => {
    if (isLoading.value) return
    isLoading.value = true
    errorMessage.value = ''
    try {
      await ensureCatalogo()
      const data = await obtenerResumen({ desde: fechaInicio.value, hasta: fechaFin.value })
      resumen.value = enriquecerConCatalogo(data)
    } catch (error) {
      errorMessage.value = error.message || 'No fue posible cargar el resumen'
    } finally {
      isLoading.value = false
    }
  }

  const aplicarRango = () => {
    cargarResumen()
  }

  const descargarResumenPDF = async () => {
    if (isLoading.value) return
    try {
      await generarReportePDF(resumenActual.value)
    } catch (error) {
      errorMessage.value = error.message || 'No fue posible generar el PDF'
    }
  }

  return {
    // filtros
    fechaInicio,
    fechaFin,
    presetRango,
    aplicarRango,
    // estado
    isLoading,
    errorMessage,
    // totales y kpis
    totalVentasMonto,
    totalComprasMonto,
    neto,
    totalVentasCantidad,
    totalComprasCantidad,
    ticketPromedioVentas,
    ticketPromedioCompras,
    totalItemsVendidos,
    totalItemsComprados,
    // series
    serieVentas,
    serieCompras,
    maxTotalDiario,
    // tops y tablas
    topVendidos,
    topComprados,
    topVentaPrincipal,
    topCompraPrincipal,
    detalleVentas,
    detalleCompras,
    // helpers
    formatCurrency,
    formatDate,
    calcAltura,
    formatItemsLinea,
    // descargas
    descargarVentasCSV,
    descargarComprasCSV,
    descargarResumenCSV,
    descargarResumenPDF,
    // carga
    cargarResumen,
  }
}
