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
          <input class="field__control" type="date" v-model="fechaInicio" />
        </label>
        <label class="field">
          <span class="field__label">Fecha final</span>
          <input class="field__control" type="date" v-model="fechaFin" />
        </label>
        <button type="button" class="btn btn--primary">Aplicar</button>
      </div>
      <div class="reportes__downloads">
        <button type="button" class="btn btn--secondary" @click="descargarVentasCSV" :disabled="ventasFiltradas.length===0">CSV Ventas</button>
        <button type="button" class="btn btn--secondary" @click="descargarComprasCSV" :disabled="comprasFiltradas.length===0">CSV Compras</button>
        <button type="button" class="btn btn--secondary" @click="descargarResumenCSV">CSV Resumen</button>
      </div>
    </section>

    <section class="reportes__kpis" v-reveal>
      <KpiCard
        label="Ingresos (ventas)"
        :value="formatCurrency(totalVentasMonto)"
        :meta="`${ventasFiltradas.length} ventas • Ticket ${formatCurrency(ticketPromedioVentas)}`"
        accent="#22c55e"
      />
      <KpiCard
        label="Egresos (compras)"
        :value="formatCurrency(totalComprasMonto)"
        :meta="`${comprasFiltradas.length} compras • Ticket ${formatCurrency(ticketPromedioCompras)}`"
        accent="#f59e0b"
      />
      <KpiCard
        label="Resultado neto"
        :value="formatCurrency(neto)"
        :meta="`Artículos vendidos ${totalItemsVendidos} • comprados ${totalItemsComprados}`"
        accent="#0d6efd"
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

    <section class="reportes__tops" v-reveal>
      <TopsList title="Top productos vendidos" :items="topVendidos" />
      <TopsList title="Top productos comprados" :items="topComprados" />
    </section>

    <section class="reportes__table" v-if="ventasFiltradas.length || comprasFiltradas.length" v-reveal>
      <h3 class="reportes__table-title">Detalle rápido</h3>
      <div class="reportes__grid">
        <ReportTable
          title="Ventas"
          :rows="ventasFiltradas.map(v => ({ id: v.id, fecha: formatDate(v.fecha), nombre: v.cliente?.nombre || 'Cliente', items: describirProductos(v.items), total: formatCurrency(v.total) }))"
        />
        <ReportTable
          title="Compras"
          :rows="comprasFiltradas.map(c => ({ id: c.id, fecha: formatDate(c.fecha), nombre: c.cliente?.nombre || 'Proveedor', items: describirProductos(c.items), total: formatCurrency(c.total) }))"
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
    onMounted(() => r.cargar())
    return r
  },
}
</script>

<style src="../../theme/ReportesStyles.css"></style>

