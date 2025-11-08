<template>
  <section class="charts">
    <h2 class="charts__title" v-reveal>Ventas y compras del mes</h2>
    <div class="charts__grid">
      <div class="chart-card" v-if="false" v-reveal="{ hideOnDown: true }">
        <div class="chart-card__title">Ventas últimos 14 días</div>
        <svg :viewBox="`0 0 ${w} ${h}`" class="chart" @mousemove="onMoveSales" @mouseleave="hideTooltip('sales')">
          <defs>
            <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#16a34a" stop-opacity="0.30"/>
              <stop offset="100%" stop-color="#16a34a" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <!-- grid -->
          <g class="grid">
            <line v-for="x in gridSales.xs" :key="`gx-${x}`" :x1="x" y1="8" :x2="x" :y2="h-18" stroke="#e5e7eb" stroke-width="1" />
            <line v-for="g in gridSales.ys" :key="`gy-${g.y}`" x1="28" :y1="g.y" :x2="w-28" :y2="g.y" stroke="#e5e7eb" stroke-width="1" />
            <text v-for="g in gridSales.ys" :key="`gt-${g.y}`" x="10" :y="g.y+4" fill="#9ca3af" font-size="10">{{ g.label }}</text>
          </g>
          <path :d="salesAreaPath" fill="url(#areaFill)" />
          <path :d="salesPath" fill="none" stroke="#16a34a" :stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
          <g>
            <circle v-for="(p, i) in salesCoords" :key="`spt-${i}`" :cx="p.x" :cy="p.y" r="3" fill="#16a34a" />
          </g>
          <g v-if="tt.sales.visible">
            <line :x1="tt.sales.x" y1="8" :x2="tt.sales.x" :y2="h-22" stroke="#9ca3af" stroke-dasharray="2 4" />
            <circle :cx="tt.sales.x" :cy="tt.sales.y" r="4" fill="#16a34a" />
          </g>
        </svg>
        <div v-if="tt.sales.visible" class="tooltip" :style="tooltipStyle(tt.sales)">
          <div class="tooltip__title">{{ tt.sales.label }}</div>
          <div class="tooltip__value">$ {{ Math.round(tt.sales.value).toLocaleString() }}</div>
        </div>
      </div>

      <div class="chart-card" v-reveal="{ delay: 120, hideOnDown: true }">
        <div class="chart-card__header">
          <div class="chart-card__title">Ventas vs Compras (Mes actual)</div>
          <div class="chart-card__controls">
            <button type="button" class="toggle" :class="{ 'is-on': showV }" @click="showV = !showV">Ventas</button>
            <button type="button" class="toggle toggle--red" :class="{ 'is-on': showC }" @click="showC = !showC">Compras</button>
          </div>
        </div>
        <svg :viewBox="`0 0 ${w} ${h}`" class="chart" @mousemove="onMoveWeeks" @mouseleave="hideTooltip('weeks')">
          <defs>
            <linearGradient id="areaV" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#16a34a" stop-opacity="0.18"/>
              <stop offset="100%" stop-color="#16a34a" stop-opacity="0"/>
            </linearGradient>
            <linearGradient id="areaC" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#ef4444" stop-opacity="0.18"/>
              <stop offset="100%" stop-color="#ef4444" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <!-- grid -->
          <g class="grid">
            <line v-for="x in gridWeeks.xs" :key="`wx-${x}`" :x1="x" y1="8" :x2="x" :y2="h-18" stroke="#e5e7eb" stroke-width="1" />
            <line v-for="g in gridWeeks.ys" :key="`wy-${g.y}`" x1="28" :y1="g.y" :x2="w-28" :y2="g.y" stroke="#e5e7eb" stroke-width="1" />
            <text v-for="g in gridWeeks.ys" :key="`wyt-${g.y}`" x="10" :y="g.y+4" fill="#9ca3af" font-size="10">{{ g.label }}</text>
          </g>
          <template v-if="showV">
            <polyline :points="weeksPolylineV" fill="url(#areaV)" stroke="none" />
            <path :d="weeksPathV" fill="none" stroke="#16a34a" :stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
            <g>
              <circle v-for="(p, i) in weeksCoordsV" :key="`wv-${i}`" :cx="p.x" :cy="p.y" r="3" fill="#16a34a" />
            </g>
          </template>
          <template v-if="showC">
            <polyline :points="weeksPolylineC" fill="url(#areaC)" stroke="none" />
            <path :d="weeksPathC" fill="none" stroke="#ef4444" :stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
            <g>
              <circle v-for="(p, i) in weeksCoordsC" :key="`wc-${i}`" :cx="p.x" :cy="p.y" r="3" fill="#ef4444" />
            </g>
          </template>
          <g v-if="tt.weeks.visible">
            <line :x1="tt.weeks.x" y1="8" :x2="tt.weeks.x" :y2="h-22" stroke="#9ca3af" stroke-dasharray="2 4" />
            <circle :cx="tt.weeks.x" :cy="tt.weeks.yV" r="4" fill="#16a34a" />
            <circle :cx="tt.weeks.x" :cy="tt.weeks.yC" r="4" fill="#ef4444" />
          </g>
        </svg>
        <div v-if="tt.weeks.visible" class="tooltip" :style="tooltipStyle(tt.weeks)">
          <div class="tooltip__title">{{ tt.weeks.label }}</div>
          <div class="tooltip__value">Ventas: $ {{ Math.round(tt.weeks.v).toLocaleString() }}</div>
          <div class="tooltip__value">Compras: $ {{ Math.round(tt.weeks.c).toLocaleString() }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { computed, reactive, onMounted, ref } from 'vue'
import { useVentas } from '@/composables/useVentas'
import { useCompras } from '@/composables/useCompras'

export default {
  name: 'ChartsBoard',
  setup() {
    const w = 560
    const h = 180

    const { ventas, cargarVentas } = useVentas()
    const { compras, cargarCompras } = useCompras()

    // Ventas por día (últimos 14)
    const lastNDays = (n) => {
      const arr = []
      const base = new Date()
      for (let i = n - 1; i >= 0; i--) {
        const d = new Date(base)
        d.setDate(base.getDate() - i)
        arr.push(d.toISOString().slice(0, 10))
      }
      return arr
    }
    const days = computed(() => lastNDays(14))
    const salesSeries = computed(() => {
      const map = new Map(days.value.map((d) => [d, 0]))
      for (const v of ventas.value || []) {
        const k = (v.fecha || '').slice(0, 10)
        if (map.has(k)) map.set(k, (map.get(k) || 0) + Number(v.total || 0))
      }
      return Array.from(map.entries()).map(([label, value]) => ({ label, value }))
    })
    const maxSales = computed(() => Math.max(1, ...salesSeries.value.map((d) => d.value)))
    const salesCoords = computed(() => {
      const padX = 28, padY = 18
      const innerW = w - padX * 2
      const innerH = h - padY * 2
      const step = innerW / (salesSeries.value.length - 1 || 1)
      return salesSeries.value.map((d, i) => {
        const x = padX + i * step
        const y = padY + (innerH - (d.value / maxSales.value) * innerH)
        return { x, y, label: d.label, value: d.value }
      })
    })
    const pathFromPoints = (pts) => {
      if (!pts.length) return ''
      let d = `M ${pts[0].x} ${pts[0].y}`
      for (let i = 1; i < pts.length; i++) {
        const p0 = pts[i - 1]
        const p1 = pts[i]
        const mx = (p0.x + p1.x) / 2
        const my = (p0.y + p1.y) / 2
        d += ` Q ${p0.x} ${p0.y} ${mx} ${my}`
      }
      d += ` T ${pts[pts.length - 1].x} ${pts[pts.length - 1].y}`
      return d
    }
    const salesPath = computed(() => pathFromPoints(salesCoords.value))
    const salesPolyline = computed(() => `${salesCoords.value.map(p => `${p.x},${p.y}`).join(' ')} ${w-28},${h-18} 28,${h-18}`)
    const salesAreaPath = computed(() => `${salesPath.value} L ${w-28} ${h-18} L 28 ${h-18} Z`)

    const tt = reactive({
      sales: { visible: false, x: 0, y: 0, screenX: 0, screenY: 0, label: '', value: 0 },
      weeks: { visible: false, x: 0, yV: 0, yC: 0, screenX: 0, screenY: 0, label: '', v: 0, c: 0 },
    })
    const onMoveSales = (e) => {
      const rect = e.currentTarget.getBoundingClientRect()
      const padX = 28, padY = 18
      const innerW = w - padX * 2
      const step = innerW / (salesSeries.value.length - 1 || 1)
      const relX = e.clientX - rect.left - padX
      const i = Math.max(0, Math.min(salesSeries.value.length - 1, Math.round(relX / step)))
      const stepX = padX + i * step
      const max = maxSales.value
      const innerH = h - padY * 2
      const val = salesSeries.value[i]?.value || 0
      const y = padY + (innerH - (val / max) * innerH)
      tt.sales.visible = true
      tt.sales.x = stepX
      tt.sales.y = y
      tt.sales.screenX = e.clientX + 12
      tt.sales.screenY = e.clientY - 28
      tt.sales.label = salesSeries.value[i]?.label || ''
      tt.sales.value = val
    }
    const hideTooltip = (key) => { if (key) tt[key].visible = false }

    // Ventas vs Compras por semana (últimas 8)
    const getWeekKey = (dStr) => {
      const d = new Date(dStr)
      const onejan = new Date(d.getFullYear(), 0, 1)
      const millis = d - onejan
      const week = Math.ceil(((millis / 86400000) + onejan.getDay() + 1) / 7)
      return `${d.getFullYear()}-W${week}`
    }
    const weeks = computed(() => {
      const out = []
      const base = new Date()
      for (let i = 7; i >= 0; i--) {
        const d = new Date(base)
        d.setDate(base.getDate() - i * 7)
        out.push(getWeekKey(d.toISOString().slice(0, 10)))
      }
      return out
    })
    const seriesWeeks = computed(() => {
      const mapV = new Map(weeks.value.map((w) => [w, 0]))
      const mapC = new Map(weeks.value.map((w) => [w, 0]))
      for (const v of ventas.value || []) {
        const k = getWeekKey((v.fecha || '').slice(0, 10))
        if (mapV.has(k)) mapV.set(k, (mapV.get(k) || 0) + Number(v.total || 0))
      }
      for (const c of compras.value || []) {
        const k = getWeekKey((c.fecha || '').slice(0, 10))
        if (mapC.has(k)) mapC.set(k, (mapC.get(k) || 0) + Number(c.total || 0))
      }
      return weeks.value.map((w) => ({ w, v: mapV.get(w) || 0, c: mapC.get(w) || 0 }))
    })
    const maxWeek = computed(() => Math.max(1, ...seriesWeeks.value.map((d) => Math.max(d.v, d.c))))
    const buildCoords = (selector) => {
      const padX = 28, padY = 18
      const innerW = w - padX * 2
      const innerH = h - padY * 2
      const step = innerW / (seriesWeeks.value.length - 1 || 1)
      return seriesWeeks.value.map((d, i) => {
        const x = padX + i * step
        const val = d[selector]
        const y = padY + (innerH - (val / maxWeek.value) * innerH)
        return { x, y, label: d.w, value: val }
      })
    }
    const weeksCoordsV = computed(() => buildCoords('v'))
    const weeksCoordsC = computed(() => buildCoords('c'))
    const weeksPathV = computed(() => pathFromPoints(weeksCoordsV.value))
    const weeksPathC = computed(() => pathFromPoints(weeksCoordsC.value))
    const weeksLineV = computed(() => weeksCoordsV.value.map(p => `${p.x},${p.y}`).join(' '))
    const weeksLineC = computed(() => weeksCoordsC.value.map(p => `${p.x},${p.y}`).join(' '))
    const weeksPolylineV = computed(() => `${weeksLineV.value} ${w-28},${h-18} 28,${h-18}`)
    const weeksPolylineC = computed(() => `${weeksLineC.value} ${w-28},${h-18} 28,${h-18}`)

    const showV = ref(true)
    const showC = ref(true)

    const onMoveWeeks = (e) => {
      const rect = e.currentTarget.getBoundingClientRect()
      const padX = 28, padY = 18
      const innerW = w - padX * 2
      const step = innerW / (seriesWeeks.value.length - 1 || 1)
      const relX = e.clientX - rect.left - padX
      const i = Math.max(0, Math.min(seriesWeeks.value.length - 1, Math.round(relX / step)))
      const stepX = padX + i * step
      const innerH = h - padY * 2
      const max = maxWeek.value
      const d = seriesWeeks.value[i] || { v: 0, c: 0, w: '' }
      const yV = padY + (innerH - (d.v / max) * innerH)
      const yC = padY + (innerH - (d.c / max) * innerH)
      tt.weeks.visible = true
      tt.weeks.x = stepX
      tt.weeks.yV = yV
      tt.weeks.yC = yC
      tt.weeks.screenX = e.clientX + 12
      tt.weeks.screenY = e.clientY - 28
      tt.weeks.label = d.w
      tt.weeks.v = d.v
      tt.weeks.c = d.c
    }

    // grid helpers
    const makeGrid = (max) => {
      const padX = 28, padY = 18
      const innerW = w - padX * 2
      const innerH = h - padY * 2
      const xs = []
      const ys = []
      const vLines = 6
      const hLines = 4
      for (let i = 1; i < vLines; i++) xs.push(padX + (innerW / vLines) * i)
      for (let i = 0; i <= hLines; i++) {
        const y = padY + (innerH / hLines) * i
        const label = Math.round(((hLines - i) / hLines) * max).toLocaleString()
        ys.push({ y, label })
      }
      return { xs, ys }
    }
    const gridSales = computed(() => makeGrid(maxSales.value))
    const gridWeeks = computed(() => makeGrid(maxWeek.value))

    const tooltipStyle = (t) => {
      const left = Math.max(8, Math.min(window.innerWidth - 160, t.screenX))
      const top = Math.max(8, t.screenY)
      return { left: `${left}px`, top: `${top}px` }
    }

    onMounted(async () => {
      await Promise.allSettled([cargarVentas(), cargarCompras()])
    })

    return { w, h, salesPath, salesAreaPath, salesCoords, salesPolyline, onMoveSales, onMoveWeeks, hideTooltip, tt, weeksCoordsV, weeksCoordsC, weeksLineV, weeksLineC, weeksPolylineV, weeksPolylineC, weeksPathV, weeksPathC, gridSales, gridWeeks, tooltipStyle, showV, showC }
  },
}
</script>

<style scoped>
.charts { width: 100%; max-width: 1200px; margin: 8px auto 22px; padding: 0 10px; }
.charts__title { text-align: left; margin: 0 6px 10px; font-size: 20px; color: #0f172a; font-weight: 800; }
.charts__grid { display: grid; grid-template-columns: 1fr; gap: 18px; }
.chart-card { background: #fff; border: 1px solid #e9eef6; border-radius: 16px; padding: 12px; box-shadow: 0 10px 26px rgba(2,6,23,.06); position: relative; }
.chart-card__header { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin: 4px 6px 8px; }
.chart-card__title { font-weight: 800; color: #0f172a; }
.chart-card__controls { display: flex; gap: 8px; }
.toggle { border: 1px solid #d1d5db; background: #fff; color: #111827; border-radius: 999px; padding: 4px 10px; font-size: 12px; cursor: pointer; transition: background-color .2s ease, color .2s ease, border-color .2s ease; }
.toggle.is-on { background: #e8f7ee; border-color: #86efac; color: #065f46; }
.toggle.toggle--red.is-on { background: #fee2e2; border-color: #fecaca; color: #7f1d1d; }
.chart { width: 100%; height: 260px; display: block; }
.tooltip { position: fixed; background: #0f172a; color: #fff; padding: 6px 8px; border-radius: 6px; font-size: 12px; pointer-events: none; white-space: nowrap; box-shadow: 0 6px 18px rgba(2,6,23,.25); }
.tooltip__title { opacity: .8; }
.tooltip__value { font-weight: 800; }

@media (max-width: 1100px) { .chart { height: 240px; } }
</style>
