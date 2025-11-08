<template>
  <section class="kpis" ref="root" v-reveal="{ threshold: 0.1, rootMargin: '0px 0px -8% 0px' }">
    <h2 class="kpis__title">Indicadores clave</h2>
    <div class="kpis__grid">
      <article
        v-for="card in cards"
        :key="card.id"
        class="kpi"
        :class="{ 'is-visible': isVisible }"
        :style="{ '--accent': card.color }"
      >
        <div class="kpi__art">
          <div class="kpi__badge">
            <span class="kpi__icon">{{ card.icon }}</span>
          </div>
          <svg class="kpi__bgshape" width="120" height="120" viewBox="0 0 120 120" aria-hidden="true">
            <defs>
              <linearGradient :id="`g-${card.id}`" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="var(--accent)" stop-opacity=".25" />
                <stop offset="100%" stop-color="var(--accent)" stop-opacity="0" />
              </linearGradient>
            </defs>
            <circle cx="60" cy="60" r="50" :fill="`url(#g-${card.id})`" />
          </svg>
        </div>

        <div class="kpi__label">{{ card.label }}</div>
        <div class="kpi__value">{{ displayValues[card.id]?.toLocaleString() }}</div>
        <div class="kpi__hint">{{ card.hint }}</div>
      </article>
    </div>
  </section>
  
</template>

<script>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useVentas } from '@/composables/useVentas'
import { useCompras } from '@/composables/useCompras'
import { useProductos } from '@/composables/useProductos'
import { useTerceros } from '@/composables/useTerceros'

export default {
  name: 'KPICards',
  setup() {
    const root = ref(null)
    const isVisible = ref(false)
    // Datos reales
    const { ventas, cargarVentas } = useVentas()
    const { compras, cargarCompras } = useCompras()
    const { productos, cargarProductos } = useProductos()
    const { clientes, cargarClientes } = useTerceros()

    const hoyISO = () => new Date().toISOString().slice(0, 10)
    const esMismoDia = (fechaStr) => (fechaStr || '').slice(0, 10) === hoyISO()
    const esMismoMes = (fechaStr) => {
      if (!fechaStr) return false
      const d = new Date(fechaStr)
      const n = new Date()
      return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth()
    }

    const kpiTargets = computed(() => {
      const ventasHoy = (ventas.value || []).filter(v => esMismoDia(v.fecha)).length
      const comprasMes = (compras.value || []).filter(c => esMismoMes(c.fecha)).length
      const tercerosActivos = (clientes.value || []).length
      const stockBajo = (productos.value || []).filter(p => Number(p.stock || 0) <= 5).length
      return { ventasHoy, comprasMes, tercerosActivos, stockBajo }
    })

    const cards = ref([
      { id: 'ventasHoy', label: 'Ventas hoy', hint: 'Registros confirmados', color: '#0d6efd', icon: '🧾' },
      { id: 'comprasMes', label: 'Compras del mes', hint: 'Órdenes recibidas', color: '#22c55e', icon: '🛒' },
      { id: 'tercerosActivos', label: 'Terceros activos', hint: 'Clientes y proveedores', color: '#f59e0b', icon: '👤' },
      { id: 'stockBajo', label: 'Items con stock bajo', hint: 'Revisar reposición', color: '#ef4444', icon: '⚠️' },
    ])
    const displayValues = ref({ ventasHoy: 0, comprasMes: 0, tercerosActivos: 0, stockBajo: 0 })
    let observer

    const animateCounters = () => {
      const duration = 900
      const start = performance.now()
      const from = { ...displayValues.value }
      const target = kpiTargets.value
      const to = { ventasHoy: target.ventasHoy, comprasMes: target.comprasMes, tercerosActivos: target.tercerosActivos, stockBajo: target.stockBajo }

      const step = (now) => {
        const t = Math.min(1, (now - start) / duration)
        const ease = 1 - Math.pow(1 - t, 3)
        const next = {}
        for (const c of cards.value) {
          next[c.id] = Math.round(from[c.id] + (to[c.id] - from[c.id]) * ease)
        }
        displayValues.value = next
        if (t < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }

    onMounted(async () => {
      // Cargar datos de servicios/mock/APIs
      await Promise.allSettled([
        cargarVentas(),
        cargarCompras(),
        cargarProductos(),
        cargarClientes(),
      ])
      observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (!isVisible.value) animateCounters()
            isVisible.value = true
            observer.disconnect()
          }
        }
      }, { threshold: 0.3 })
      if (root.value) observer.observe(root.value)
    })

    onBeforeUnmount(() => {
      if (observer) observer.disconnect()
    })

    return { root, isVisible, cards, displayValues }
  },
}
</script>

<style scoped>
.kpis { width: 100%; margin: 0; padding: 28px 24px 20px; }
.kpis__title { text-align: left; margin: 0 0 12px; font-size: 20px; color: #0f172a; font-weight: 800; }
.kpis__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 32px;
}

.kpi {
  position: relative;
  background: linear-gradient(180deg, #ffffff, #f7fbff);
  border: 1px solid #e2e9f3;
  border-radius: 22px;
  padding: 34px 34px 28px;
  min-height: 220px;
  box-shadow: 0 18px 46px rgba(2, 6, 23, 0.10);
  transform: translate3d(0, 14px, 0);
  opacity: 0;
  transition: transform .5s ease, opacity .5s ease, box-shadow .28s ease;
  overflow: hidden;
}
.kpi.is-visible { transform: translate3d(0, 0, 0); opacity: 1; }
.kpi:hover { box-shadow: 0 24px 56px rgba(2, 6, 23, 0.16); }

.kpi__art { position: absolute; right: -10px; top: -12px; width: 220px; height: 220px; pointer-events: none; }
.kpi__bgshape { position: absolute; right: 0; top: 0; transform: rotate(-12deg) scale(1.1); }
.kpi__badge {
  position: absolute;
  left: 6px; top: 6px;
  background: radial-gradient(80% 80% at 30% 30%, var(--accent, #0d6efd), rgba(255,255,255,0) 70%);
  border-radius: 50%;
  width: 60px; height: 60px;
  box-shadow: 0 12px 22px rgba(0,0,0,.08);
  display: grid; place-items: center;
}
.kpi__icon { font-size: 26px; }

.kpi__label { color: #5b6b80; font-size: 14px; letter-spacing: .04em; text-transform: uppercase; }
.kpi__value { color: #0f172a; font-size: 56px; font-weight: 900; margin: 14px 0 8px; line-height: 1; }
.kpi__hint { color: #667085; font-size: 16px; }

@media (max-width: 1100px) {
  .kpis { padding-left: 16px; padding-right: 16px; }
}
@media (max-width: 900px) {
  .kpis__grid { grid-template-columns: 1fr; gap: 20px; }
  .kpi { min-height: 200px; }
  .kpi__value { font-size: 48px; }
}
</style>
