<template>
  <section class="widgets">
    <h2 class="widgets__title" v-reveal>Flujo de caja</h2>
    <div class="widgets__grid">
      <div class="wcard" v-reveal="{ hideOnDown: true }">
        <div class="wcard__title">Estado de caja</div>
        <div class="wcard__value">$ {{ caja.toLocaleString() }}</div>
        <div class="wcard__hint" :class="{ 'is-good': caja >= 0, 'is-bad': caja < 0 }">{{ caja >= 0 ? 'Saldo positivo' : 'Saldo negativo' }}</div>
      </div>
    </div>
  </section>
</template>

<script>
import { computed, onMounted } from 'vue'
import { useVentas } from '@/composables/useVentas'
import { useCompras } from '@/composables/useCompras'

export default {
  name: 'LiveWidgets',
  setup() {
    const { totalRecaudado, cargarVentas } = useVentas()
    const { totalInvertido, cargarCompras } = useCompras()

    // Caja demo animada
    const caja = computed(() => Number(totalRecaudado.value || 0) - Number(totalInvertido.value || 0))

    onMounted(async () => {
      await Promise.allSettled([cargarVentas(), cargarCompras()])
    })

    return { caja }
  },
}
</script>

<style scoped>
.widgets { max-width: 1200px; margin: 6px auto 24px; padding: 0 10px; }
.widgets__title { text-align: left; margin: 0 0 12px; font-size: 20px; color: #0f172a; font-weight: 800; }
.widgets__grid { display: grid; grid-template-columns: 1fr; gap: 16px; }

.wcard { background: #fff; border: 1px solid #e9eef6; border-radius: 18px; padding: 16px; box-shadow: 0 10px 26px rgba(2,6,23,.06); }
.wcard__title { font-weight: 800; color: #111827; margin-bottom: 8px; }
.wcard__value { font-size: 24px; font-weight: 800; color: #0f172a; }
.wcard__hint { margin-top: 2px; font-size: 12px; color: #6b7280; }
.wcard__hint.is-good { color: #15803d; }
.wcard__hint.is-bad { color: #b91c1c; }

@media (max-width: 900px) { .widgets__grid { grid-template-columns: 1fr; } }
</style>
