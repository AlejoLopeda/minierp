<template>
  <div class="chart-card">
    <header class="chart-card__header">
      <h3 class="chart-card__title">{{ title }}</h3>
      <small class="chart-card__subtitle">{{ subtitle }}</small>
    </header>
    <div class="bars">
      <div
        v-for="(p, i) in series"
        :key="i"
        class="bar"
        :class="barClass"
        :title="`${p.fecha} • ${format(p.total)}`"
        :style="{ height: calcAltura(p.total) }"
      ></div>
    </div>
    <footer class="chart-card__footer">
      <span>{{ totalLabel }} {{ format(totalValue) }}</span>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'BarsChartCard',
  props: {
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    totalLabel: { type: String, default: 'Total' },
    totalValue: { type: Number, default: 0 },
    series: { type: Array, default: () => [] }, // [{ fecha, total }]
    max: { type: Number, default: 1 },
    variant: { type: String, default: 'ventas' }, // 'ventas' | 'compras'
    format: { type: Function, default: (v) => String(v) },
  },
  computed: {
    barClass() {
      return this.variant === 'compras' ? 'bar--compras' : 'bar--ventas'
    },
  },
  methods: {
    calcAltura(valor) {
      const v = Number(valor)
      const m = Number(this.max || 1)
      const pct = m > 0 ? Math.max(2, Math.round((v / m) * 100)) : 2
      return pct + '%'
    },
  },
}
</script>

<style scoped>
/* estilos base provienen de theme/ReportesStyles.css */
</style>

