<template>
  <div class="tops-card">
    <h3 class="tops-card__title">{{ title }}</h3>
    <ol class="tops">
      <li v-for="p in items" :key="p.productoId || p.nombre" class="tops__item">
        <span class="tops__name">{{ p.nombre }}</span>
        <span class="tops__qty">x{{ p.cantidad }}</span>
      </li>
      <li v-if="!items || items.length === 0" class="tops__item tops__empty">
        <span class="tops__name">Sin datos</span>
      </li>
    </ol>
  </div>
</template>

<script>
export default {
  name: 'TopsList',
  props: {
    title: { type: String, required: true },
    items: { type: Array, default: () => [] },
  },
}
</script>

<style scoped>
/* estilos base provienen de theme/ReportesStyles.css */
.tops__empty { opacity: .7; }
</style>

