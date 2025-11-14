<template>
  <section class="reportes">
    <header class="reportes__header">
      <div class="reportes__headings">
        <h1 class="reportes__title">Reportes</h1>
        <p class="reportes__subtitle">
          Descarga y explora indicadores por rango de fechas. Filtra para ver totales, comparativos y top productos.
        </p>
      </div>
      <div class="reportes__actions">
        <button type="button" class="btn btn--ghost" @click="presetRango('hoy')">Hoy</button>
        <button type="button" class="btn btn--ghost" @click="presetRango('7d')">Últ. 7 días</button>
        <button type="button" class="btn btn--ghost" @click="presetRango('mes')">Mes actual</button>
        <button type="button" class="btn btn--ghost" @click="presetRango('anio')">Año actual</button>
      </div>
    </header>

    <section class="reportes__filters" v-reveal>
      <div class="reportes__dates">
        <label class="field">
          <span class="field__label">Fecha inicial</span>
          <input class="field__control" type="date" v-model="fechaInicio" :disabled="isLoading" />
        </label>
        <label class="field">
          <span class="field__label">Fecha final</span>
          <input class="field__control" type="date" v-model="fechaFin" :disabled="isLoading" />
        </label>
        <button type="button" class="btn btn--primary" @click="aplicarRango" :disabled="isLoading">
          {{ isLoading ? 'Cargando...' : 'Aplicar' }}
        </button>
      </div>
      <div class="reportes__downloads">
        <button
          type="button"
          class="btn btn--secondary"
          @click="descargarVentasCSV"
          :disabled="isLoading || detalleVentas.length === 0"
        >
          CSV Ventas
        </button>
        <button
          type="button"
          class="btn btn--secondary"
          @click="descargarComprasCSV"
          :disabled="isLoading || detalleCompras.length === 0"
        >
          CSV Compras
        </button>
        <button
          type="button"
          class="btn btn--secondary"
          @click="descargarResumenCSV"
          :disabled="isLoading"
        >
          CSV Resumen
        </button>
        <button type="button" class="btn btn--primary" @click="descargarResumenPDF" :disabled="isLoading">
          PDF detallado
        </button>
      </div>
    </section>

    <div v-if="errorMessage" class="reportes__alert">
      {{ errorMessage }}
    </div>

    <section class="reportes__kpis" v-reveal>
      <KpiCard
        label="Ingresos (ventas)"
        :value="formatCurrency(totalVentasMonto)"
        :meta="`${totalVentasCantidad} ventas | Ticket ${formatCurrency(ticketPromedioVentas)}`"
        accent="#22c55e"
      />
      <KpiCard
        label="Egresos (compras)"
        :value="formatCurrency(totalComprasMonto)"
        :meta="`${totalComprasCantidad} compras | Ticket ${formatCurrency(ticketPromedioCompras)}`"
        accent="#f59e0b"
      />
      <KpiCard
        label="Resultado neto"
        :value="formatCurrency(neto)"
        :meta="`Artículos vendidos ${totalItemsVendidos} | comprados ${totalItemsComprados}`"
        accent="#0d6efd"
      />
      <KpiCard
        label="Top producto vendido"
        :value="topVentaPrincipal ? (topVentaPrincipal.nombreOriginal || topVentaPrincipal.nombre) : 'Sin datos'"
        :meta="
          topVentaPrincipal
            ? `${topVentaPrincipal.referencia || topVentaPrincipal.sku || 'SKU sin referencia'} | ${topVentaPrincipal.cantidad} uds`
            : 'No se registran ventas en este rango'
        "
        accent="#7c3aed"
      />
    </section>

    <section class="reportes__charts" v-reveal>
      <BarsChartCard
        title="Ventas por día"
        subtitle="Importe total"
        :series="serieVentas"
        :max="maxTotalDiario"
        :totalValue="totalVentasMonto"
        totalLabel="Total"
        variant="ventas"
        :format="formatCurrency"
      />

      <BarsChartCard
        title="Compras por día"
        subtitle="Importe total"
        :series="serieCompras"
        :max="maxTotalDiario"
        :totalValue="totalComprasMonto"
        totalLabel="Total"
        variant="compras"
        :format="formatCurrency"
      />
    </section>

    <section class="reportes__table" v-if="serieVentas.length || serieCompras.length" v-reveal>
      <h3 class="reportes__table-title">Movimientos por día</h3>
      <div class="reportes__grid">
        <table class="tbl">
          <thead>
            <tr><th>Fecha</th><th>Total</th></tr>
          </thead>
          <tbody>
            <tr v-for="item in serieVentas" :key="`v-${item.fecha}`">
              <td>{{ item.fecha }}</td>
              <td class="tbl__num">{{ formatCurrency(item.total) }}</td>
            </tr>
            <tr v-if="serieVentas.length === 0">
              <td colspan="2" class="tbl__muted">Sin datos</td>
            </tr>
          </tbody>
        </table>
        <table class="tbl">
          <thead>
            <tr><th>Fecha</th><th>Total</th></tr>
          </thead>
          <tbody>
            <tr v-for="item in serieCompras" :key="`c-${item.fecha}`">
              <td>{{ item.fecha }}</td>
              <td class="tbl__num">{{ formatCurrency(item.total) }}</td>
            </tr>
            <tr v-if="serieCompras.length === 0">
              <td colspan="2" class="tbl__muted">Sin datos</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="reportes__tops" v-reveal>
      <TopsList title="Top productos vendidos" :items="topVendidos" />
      <TopsList title="Top productos comprados" :items="topComprados" />
    </section>

    <section class="reportes__table" v-if="detalleVentas.length || detalleCompras.length" v-reveal>
      <h3 class="reportes__table-title">Detalle rápido</h3>
      <div class="reportes__grid">
        <ReportTable
          title="Ventas"
          :rows="detalleVentas.map(v => ({ id: v.id, fecha: formatDate(v.fecha), nombre: v.nombre || 'Cliente', items: formatItemsLinea(v.items), total: formatCurrency(v.total) }))"
        />
        <ReportTable
          title="Compras"
          :rows="detalleCompras.map(c => ({ id: c.id, fecha: formatDate(c.fecha), nombre: c.nombre || 'Proveedor', items: formatItemsLinea(c.items), total: formatCurrency(c.total) }))"
        />
      </div>
    </section>
  </section>
</template>

<script>
import { onMounted } from 'vue'
import { useReportes } from '@/composables/useReportes'
import KpiCard from '@/components/reportes/KpiCard.vue'
import BarsChartCard from '@/components/reportes/BarsChartCard.vue'
import TopsList from '@/components/reportes/TopsList.vue'
import ReportTable from '@/components/reportes/ReportTable.vue'

export default {
  name: 'ReportesPage',
  components: { KpiCard, BarsChartCard, TopsList, ReportTable },
  setup() {
    const r = useReportes()
    onMounted(() => r.cargarResumen())
    return r
  },
}
</script>

<style src="../../theme/ReportesStyles.css"></style>
