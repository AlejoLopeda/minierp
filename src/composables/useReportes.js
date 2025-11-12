import { computed, ref } from 'vue'
import { useVentas } from '@/composables/useVentas'
import { useCompras } from '@/composables/useCompras'
import { descargarCSV as descargarCsvService } from '@/services/reportesService'

export function useReportes() {
  const { ventas, cargarVentas } = useVentas()
  const { compras, cargarCompras } = useCompras()

  // Rango
  const hoyISO = () => new Date().toISOString().slice(0, 10)
  const addDays = (date, delta) => {
    const x = new Date(date)
    x.setDate(x.getDate() + delta)
    return x
  }
  const fechaInicio = ref(new Date(addDays(new Date(), -30)).toISOString().slice(0, 10))
  const fechaFin = ref(hoyISO())

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

  const inRange = (iso) => {
    if (!iso) return false
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return false
    const start = new Date(`${fechaInicio.value}T00:00:00`)
    const end = new Date(`${fechaFin.value}T23:59:59`)
    return d >= start && d <= end
  }

  const ventasFiltradas = computed(() => (ventas.value || []).filter(v => inRange(v.fecha)))
  const comprasFiltradas = computed(() => (compras.value || []).filter(c => inRange(c.fecha)))

  // KPI
  const totalVentasMonto = computed(() => ventasFiltradas.value.reduce((s, v) => s + Number(v.total || 0), 0))
  const totalComprasMonto = computed(() => comprasFiltradas.value.reduce((s, c) => s + Number(c.total || 0), 0))
  const neto = computed(() => Number((totalVentasMonto.value - totalComprasMonto.value).toFixed(2)))
  const totalItemsVendidos = computed(() => ventasFiltradas.value.reduce((s, v) => s + (Array.isArray(v.items) ? v.items.reduce((a, i) => a + Number(i.cantidad || 0), 0) : 0), 0))
  const totalItemsComprados = computed(() => comprasFiltradas.value.reduce((s, c) => s + (Array.isArray(c.items) ? c.items.reduce((a, i) => a + Number(i.cantidad || 0), 0) : 0), 0))
  const ticketPromedioVentas = computed(() => ventasFiltradas.value.length ? totalVentasMonto.value / ventasFiltradas.value.length : 0)
  const ticketPromedioCompras = computed(() => comprasFiltradas.value.length ? totalComprasMonto.value / comprasFiltradas.value.length : 0)

  // Series
  const agruparPorDia = (items) => {
    const map = new Map()
    for (const it of items) {
      const d = new Date(it.fecha)
      if (Number.isNaN(d.getTime())) continue
      const key = d.toISOString().slice(0, 10)
      const acc = map.get(key) || 0
      map.set(key, acc + Number(it.total || 0))
    }
    const arr = Array.from(map.entries()).map(([fecha, total]) => ({ fecha, total }))
    return arr.sort((a, b) => a.fecha.localeCompare(b.fecha))
  }
  const serieVentas = computed(() => agruparPorDia(ventasFiltradas.value))
  const serieCompras = computed(() => agruparPorDia(comprasFiltradas.value))
  const maxTotalDiario = computed(() => {
    const all = [...serieVentas.value.map(x => x.total), ...serieCompras.value.map(x => x.total)]
    return all.length ? Math.max(...all) : 1
  })

  // Tops
  const topFrom = (items) => {
    const acc = new Map()
    for (const d of items) {
      for (const it of (d.items || [])) {
        const key = it.productoId || it.sku || it.nombre
        const cur = acc.get(key) || { productoId: key, nombre: it.nombre || String(key), cantidad: 0 }
        cur.cantidad += Number(it.cantidad || 0)
        acc.set(key, cur)
      }
    }
    return Array.from(acc.values()).sort((a, b) => b.cantidad - a.cantidad).slice(0, 10)
  }
  const topVendidos = computed(() => topFrom(ventasFiltradas.value))
  const topComprados = computed(() => topFrom(comprasFiltradas.value))

  // Formatters
  const currencyFormatter = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 2 })
  const dateFormatter = new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium' })
  const formatCurrency = (v) => currencyFormatter.format(Number.isFinite(Number(v)) ? Number(v) : 0)
  const formatDate = (v) => { const d = v ? new Date(v) : null; return (d && !Number.isNaN(d.getTime())) ? dateFormatter.format(d) : '–' }
  const describirProductos = (items = []) => Array.isArray(items) ? items.map(i => `${i.nombre} x${i.cantidad}`).join(', ') : ''
  const calcAltura = (valor, max) => {
    const v = Number(valor)
    const m = Number(max || 1)
    const pct = m > 0 ? Math.max(2, Math.round((v / m) * 100)) : 2
    return pct + '%'
  }

  // CSV exports
  const descargarVentasCSV = () => {
    const header = ['Fecha', 'Cliente', 'Items', 'Total']
    const rows = ventasFiltradas.value.map(v => [
      formatDate(v.fecha),
      v.cliente?.nombre || '',
      describirProductos(v.items || []),
      String(Number(v.total || 0).toFixed(2))
    ])
    descargarCsvService(`ventas_${fechaInicio.value}_a_${fechaFin.value}.csv`, [header, ...rows])
  }
  const descargarComprasCSV = () => {
    const header = ['Fecha', 'Proveedor', 'Items', 'Total']
    const rows = comprasFiltradas.value.map(c => [
      formatDate(c.fecha),
      c.cliente?.nombre || '',
      describirProductos(c.items || []),
      String(Number(c.total || 0).toFixed(2))
    ])
    descargarCsvService(`compras_${fechaInicio.value}_a_${fechaFin.value}.csv`, [header, ...rows])
  }
  const descargarResumenCSV = () => {
    const filas = [
      ['Periodo', `${fechaInicio.value} a ${fechaFin.value}`],
      ['Ventas (monto)', Number(totalVentasMonto.value.toFixed(2))],
      ['Compras (monto)', Number(totalComprasMonto.value.toFixed(2))],
      ['Resultado neto', Number(neto.value.toFixed(2))],
      ['Ventas (count)', ventasFiltradas.value.length],
      ['Compras (count)', comprasFiltradas.value.length],
      ['Ticket promedio ventas', Number(ticketPromedioVentas.value.toFixed(2))],
      ['Ticket promedio compras', Number(ticketPromedioCompras.value.toFixed(2))],
      ['Artículos vendidos', totalItemsVendidos.value],
      ['Artículos comprados', totalItemsComprados.value],
    ]
    descargarCsvService(`resumen_${fechaInicio.value}_a_${fechaFin.value}.csv`, filas)
  }

  const cargar = () => { cargarVentas(); cargarCompras() }

  return {
    // carga
    cargar,
    // filtros
    fechaInicio, fechaFin, presetRango,
    // datos filtrados
    ventasFiltradas, comprasFiltradas,
    // kpis
    totalVentasMonto, totalComprasMonto, neto,
    totalItemsVendidos, totalItemsComprados,
    ticketPromedioVentas, ticketPromedioCompras,
    // series tops
    serieVentas, serieCompras, maxTotalDiario, topVendidos, topComprados,
    // util
    formatCurrency, formatDate, describirProductos, calcAltura,
    // export
    descargarVentasCSV, descargarComprasCSV, descargarResumenCSV,
  }
}

