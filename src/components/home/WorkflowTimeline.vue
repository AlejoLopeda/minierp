<template>
  <section class="timeline">
    <div class="timeline__canvas">
      <svg :width="width" :height="height" viewBox="0 0 1000 120" role="img" aria-label="Flujo de operación">
        <path class="timeline__path" d="M40,80 C220,40 420,120 600,80 C760,46 900,110 960,60" fill="none" />
      </svg>
    </div>
    <ul class="timeline__steps">
      <li v-for="(s, i) in steps" :key="s.key" class="tstep" :style="{ transitionDelay: `${i * 80}ms` }">
        <div class="tstep__icon">{{ s.icon }}</div>
        <div class="tstep__title">{{ s.title }}</div>
        <div class="tstep__desc">{{ s.desc }}</div>
      </li>
    </ul>
  </section>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'WorkflowTimeline',
  setup() {
    const width = 1000
    const height = 120
    const steps = ref([
      { key: 'compras', title: 'Compras', desc: 'Ordena y recibe', icon: '🛒' },
      { key: 'inventario', title: 'Inventario', desc: 'Actualiza stocks', icon: '📦' },
      { key: 'ventas', title: 'Ventas', desc: 'Factura y cobra', icon: '🧾' },
      { key: 'reportes', title: 'Reportes', desc: 'Mide y decide', icon: '📊' },
    ])
    onMounted(() => {
      // forzar reflow para animar el trazo
      const path = document.querySelector('.timeline__path')
      if (path) {
        const len = 1200
        path.setAttribute('stroke-dasharray', `${len}`)
        path.setAttribute('stroke-dashoffset', `${len}`)
        // trigger
        setTimeout(() => { path.classList.add('is-animated') }, 50)
      }
    })
    return { steps, width, height }
  },
}
</script>

<style scoped>
.timeline { max-width: 1200px; margin: 10px auto 0; padding: 0 10px 10px; }
.timeline__canvas { background: linear-gradient(180deg, #ffffff, #f7faff); border: 1px solid #eef2f7; border-radius: 16px; padding: 8px; }

.timeline__path { stroke: url(#grad);
  stroke: #0d6efd; stroke-width: 3px; filter: drop-shadow(0 2px 2px rgba(13,110,253,.15)); transition: stroke-dashoffset 1.6s ease;
}
.timeline__path.is-animated { stroke-dashoffset: 0; }

.timeline__steps { list-style: none; display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; padding: 0; margin: 12px 0 0; }
.tstep {
  background: #fff; border: 1px solid #e9eef6; border-radius: 14px; padding: 12px; text-align: center;
  transform: translate3d(0, 6px, 0); opacity: 0; transition: transform .5s ease, opacity .5s ease;
}
.tstep:nth-child(1), .tstep:nth-child(2), .tstep:nth-child(3), .tstep:nth-child(4) { transform: translate3d(0, 0, 0); opacity: 1; }
.tstep__icon { font-size: 20px; }
.tstep__title { font-weight: 700; margin-top: 6px; color: #111827; }
.tstep__desc { color: #6b7280; font-size: 13px; }

@media (max-width: 900px) { .timeline__steps { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 520px) { .timeline__steps { grid-template-columns: 1fr; } }
</style>

