const JSPDF_CDN = 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js'

let jsPdfPromise = null

function loadJsPDF() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('PDF solo disponible en entorno de navegador'))
  }
  if (window.jspdf?.jsPDF) {
    return Promise.resolve(window.jspdf.jsPDF)
  }
  if (jsPdfPromise) return jsPdfPromise
  jsPdfPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = JSPDF_CDN
    script.async = true
    script.onload = () => {
      if (window.jspdf?.jsPDF) {
        resolve(window.jspdf.jsPDF)
      } else {
        reject(new Error('No se pudo inicializar jsPDF'))
      }
    }
    script.onerror = () => reject(new Error('No se pudo cargar jsPDF'))
    document.head.appendChild(script)
  })
  return jsPdfPromise
}

function formatCurrency(valor) {
  const formatter = new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  })
  return formatter.format(Number(valor || 0))
}

function drawHeader(doc, margin, pageWidth, resumen) {
  doc.setFillColor(14, 90, 170)
  doc.rect(0, 0, pageWidth, 90, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont(undefined, 'bold')
  doc.text('Mini ERP - Reporte financiero', margin, 45)
  doc.setFontSize(12)
  doc.setFont(undefined, 'normal')
  doc.text(
    `Periodo analizado: ${resumen.rango?.desde || '-'} al ${resumen.rango?.hasta || '-'}`,
    margin,
    65
  )
  doc.setTextColor(0, 0, 0)
  return 110
}

function drawMetricCards(doc, cards, startY, margin, pageWidth) {
  const availableWidth = pageWidth - margin * 2
  const gap = 16
  const cardWidth = (availableWidth - gap * (cards.length - 1)) / cards.length
  const cardHeight = 80
  cards.forEach((card, index) => {
    const x = margin + index * (cardWidth + gap)
    doc.setFillColor(...card.color)
    doc.roundedRect(x, startY, cardWidth, cardHeight, 8, 8, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(11)
    doc.setFont(undefined, 'bold')
    doc.text(card.title, x + 14, startY + 20)
    doc.setFontSize(18)
    doc.setFont(undefined, 'bold')
    doc.text(card.value, x + 14, startY + 44)
    doc.setFontSize(10)
    doc.setFont(undefined, 'normal')
    doc.text(card.meta, x + 14, startY + 62)
  })
  doc.setTextColor(0, 0, 0)
  return startY + cardHeight + 16
}

function drawSectionTitle(doc, text, margin, y) {
  doc.setFontSize(13)
  doc.setFont(undefined, 'bold')
  doc.text(text, margin, y)
  doc.setFont(undefined, 'normal')
  doc.setDrawColor(229, 231, 235)
  doc.setLineWidth(1)
  doc.line(margin, y + 6, margin + 520, y + 6)
}

function drawTable(doc, { title, columns, rows }, startY, margin, pageWidth) {
  drawSectionTitle(doc, title, margin, startY)
  let y = startY + 16
  const tableWidth = pageWidth - margin * 2
  const colWidths = columns.map((col) =>
    typeof col.width === 'number' && col.width > 1 ? col.width : Math.round(tableWidth * col.width)
  )
  doc.setFontSize(10)
  doc.setFillColor(243, 244, 246)
  doc.setDrawColor(229, 231, 235)
  doc.setLineWidth(0.7)
  let x = margin
  columns.forEach((col, idx) => {
    doc.rect(x, y, colWidths[idx], 20, 'FD')
    doc.text(col.label, x + 6, y + 13)
    x += colWidths[idx]
  })
  y += 20
  const pageHeight = doc.internal.pageSize.getHeight()
  const rowHeight = 22

  const ensureSpace = () => {
    if (y + rowHeight > pageHeight - margin) {
      doc.addPage()
      y = margin
      drawSectionTitle(doc, title + ' (cont.)', margin, y)
      y += 16
    }
  }

  if (!rows.length) {
    ensureSpace()
    doc.text('Sin datos para este periodo.', margin + 6, y + 13)
    y += rowHeight
    return y + 6
  }

  rows.forEach((row) => {
    ensureSpace()
    x = margin
    row.forEach((cell, idx) => {
      doc.rect(x, y, colWidths[idx], rowHeight)
      const text = String(cell ?? '')
      doc.text(text, x + 6, y + 14, { maxWidth: colWidths[idx] - 12 })
      x += colWidths[idx]
    })
    y += rowHeight
  })
  return y + 10
}

function obtenerCantidadProductos(topLista = [], detalle = []) {
  const sumaTop = topLista.reduce((acc, item) => acc + Number(item.cantidad || 0), 0)
  if (sumaTop > 0) return sumaTop
  return detalle.reduce(
    (acc, mov) => acc + mov.items.reduce((suma, item) => suma + Number(item.cantidad || 0), 0),
    0
  )
}

export async function generarReportePDF(resumen) {
  const jsPDF = await loadJsPDF()
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const margen = 40
  const pageWidth = doc.internal.pageSize.getWidth()
  let cursorY = drawHeader(doc, margen, pageWidth, resumen)
  const ticketVentas =
    resumen.ingresos?.cantidad > 0 ? resumen.ingresos.total / resumen.ingresos.cantidad : 0
  const ticketCompras =
    resumen.egresos?.cantidad > 0 ? resumen.egresos.total / resumen.egresos.cantidad : 0

  cursorY = drawMetricCards(
    doc,
    [
      {
        title: 'Ingresos',
        value: formatCurrency(resumen.ingresos.total),
        meta: `${resumen.ingresos.cantidad} ventas | Ticket ${formatCurrency(ticketVentas)}`,
        color: [34, 197, 94],
      },
      {
        title: 'Egresos',
        value: formatCurrency(resumen.egresos.total),
        meta: `${resumen.egresos.cantidad} compras | Ticket ${formatCurrency(ticketCompras)}`,
        color: [249, 115, 22],
      },
      {
        title: 'Resultado neto',
        value: formatCurrency(resumen.resultadoNeto),
        meta:
          resumen.resultadoNeto >= 0
            ? 'Periodo con balance positivo'
            : 'Periodo con balance negativo',
        color: [14, 116, 144],
      },
    ],
    cursorY,
    margen,
    pageWidth
  )

  cursorY = drawMetricCards(
    doc,
    [
      {
        title: 'Artículos vendidos',
        value: `${obtenerCantidadProductos(resumen.topProductosVendidos, resumen.detalleVentas)} uds`,
        meta: `${resumen.detalleVentas.length} comprobantes`,
        color: [79, 70, 229],
      },
      {
        title: 'Artículos comprados',
        value: `${obtenerCantidadProductos(resumen.topProductosComprados, resumen.detalleCompras)} uds`,
        meta: `${resumen.detalleCompras.length} comprobantes`,
        color: [190, 18, 60],
      },
      {
        title: 'Top producto vendido',
        value:
          resumen.topProductosVendidos?.[0]?.nombreOriginal ||
          resumen.topProductosVendidos?.[0]?.nombre ||
          'Sin datos',
        meta: resumen.topProductosVendidos?.[0]
          ? `${
              resumen.topProductosVendidos[0].referencia ||
              resumen.topProductosVendidos[0].sku ||
              'SKU sin referencia'
            } | ${resumen.topProductosVendidos[0].cantidad} uds`
          : 'No hay ventas registradas',
        color: [15, 118, 110],
      },
    ],
    cursorY,
    margen,
    pageWidth
  )

  cursorY = drawTable(
    doc,
    {
      title: 'Ventas por día',
      columns: [
        { label: 'Fecha', width: 0.5 },
        { label: 'Importe', width: 0.5 },
      ],
      rows: (resumen.ventasPorDia || []).map((item) => [item.fecha, formatCurrency(item.total)]),
    },
    cursorY,
    margen,
    pageWidth
  )

  cursorY = drawTable(
    doc,
    {
      title: 'Compras por día',
      columns: [
        { label: 'Fecha', width: 0.5 },
        { label: 'Importe', width: 0.5 },
      ],
      rows: (resumen.comprasPorDia || []).map((item) => [item.fecha, formatCurrency(item.total)]),
    },
    cursorY,
    margen,
    pageWidth
  )

  cursorY = drawTable(
    doc,
    {
      title: 'Top productos vendidos',
      columns: [
        { label: '#', width: 0.08 },
        { label: 'Producto', width: 0.52 },
        { label: 'SKU', width: 0.2 },
        { label: 'Cantidad', width: 0.2 },
      ],
      rows: (resumen.topProductosVendidos || []).slice(0, 8).map((item, index) => [
        index + 1,
        item.nombre || 'Producto',
        item.sku || 'S/N',
        `${item.cantidad} uds`,
      ]),
    },
    cursorY,
    margen,
    pageWidth
  )

  cursorY = drawTable(
    doc,
    {
      title: 'Top productos comprados',
      columns: [
        { label: '#', width: 0.08 },
        { label: 'Producto', width: 0.52 },
        { label: 'SKU', width: 0.2 },
        { label: 'Cantidad', width: 0.2 },
      ],
      rows: (resumen.topProductosComprados || []).slice(0, 8).map((item, index) => [
        index + 1,
        item.nombre || 'Producto',
        item.sku || 'S/N',
        `${item.cantidad} uds`,
      ]),
    },
    cursorY,
    margen,
    pageWidth
  )

  if (cursorY > doc.internal.pageSize.getHeight() - margen * 2) {
    doc.addPage()
    cursorY = margen
  }

  drawSectionTitle(doc, 'Notas', margen, cursorY)
  cursorY += 20
  doc.setFontSize(10)
  doc.text(
    [
      'Este documento resume las transacciones registradas en Mini ERP para el rango seleccionado.',
      'Los valores mostrados consolidan los comprobantes de venta y compra, así como los productos con mayor movimiento.',
      'Para ver los detalles o descargar la información original visita el módulo de Reportes dentro de la aplicación.',
    ],
    margen,
    cursorY,
    { maxWidth: pageWidth - margen * 2 }
  )

  const nombreArchivo = `reporte_${resumen.rango?.desde || 'inicio'}_${resumen.rango?.hasta || 'fin'}.pdf`
  doc.save(nombreArchivo)
}
