<template>
  <div class="tops-card">
    <h3 class="tops-card__title">{{ title }}</h3>
    <ol class="tops">
      <li v-for="p in items" :key="p.productoId || p.nombre" class="tops__item">
        <div class="tops__detail">
          <span class="tops__name">{{ p.nombreOriginal || p.nombre || 'Producto' }}</span>
          <small v-if="p.referencia || p.sku" class="tops__sku">
            {{ p.referencia ? `SKU ${p.referencia}` : `SKU ${p.sku}` }}
          </small>
        </div>
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
.tops__detail {
  display: flex;
  flex-direction: column;
}
.tops__sku {
  color: rgba(15, 23, 42, 0.65);
}
</style>

