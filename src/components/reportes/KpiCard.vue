<template>
  <article class="kpi" :style="{ '--accent': accent }">
    <div class="kpi__label">{{ label }}</div>
    <div class="kpi__value">{{ value }}</div>
    <div class="kpi__meta">{{ meta }}</div>
  </article>
</template>

<script>
export default {
  name: 'KpiCard',
  props: {
    label: { type: String, required: true },
    value: { type: String, required: true },
    meta: { type: String, default: '' },
    accent: { type: String, default: '#0d6efd' },
  },
}
</script>

<style scoped>
/* estilos base provienen de theme/ReportesStyles.css (clase .kpi) */
</style>

