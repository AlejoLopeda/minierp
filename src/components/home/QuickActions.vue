<template>
  <section class="qactions">
    <h2 class="qactions__title" v-reveal>Modulos principales</h2>
    <div class="qactions__grid">
      <button
        v-for="(act, i) in actions"
        :key="act.key"
        class="qa qa--full"
        v-reveal.scale="{ delay: i * 90, threshold: 0.05, rootMargin: '0px 0px -5% 0px' }"
        @mousemove="tilt($event)"
        @mouseleave="resetTilt"
        @click="go(act.routeName)"
        :style="{ '--accent': act.accent }"
      >
        <div class="qa__inner">
          <div class="qa__left">
            <div class="qa__badge"><span class="qa__icon">{{ act.icon }}</span></div>
            <div class="qa__text">
              <div class="qa__title">{{ act.title }}</div>
              <div class="qa__desc">{{ act.desc }}</div>
            </div>
          </div>
          <div class="qa__media">
            <img
              v-if="act.image"
              class="qa__img"
              :src="resolveImage(act.image)"
              :alt="act.alt || act.title"
              loading="lazy"
              @error="$event.target.style.display='none'"
            />
            <span v-else class="qa__media-ph">Espacio para imagen</span>
          </div>
        </div>
      </button>
    </div>
  </section>
</template>

<script>
import { useRouter } from 'vue-router'
import imgTerceros from '@/assets/qa-terceros.jpg'
import imgProductos from '@/assets/qa-productos.jpg'
import imgVentas from '@/assets/qa-ventas.jpg'
import imgCompras from '@/assets/qa-compras.jpg'

export default {
  name: 'QuickActions',
  setup() {
    const router = useRouter()
    const go = (name) => router.push({ name })
    const actions = [
      { key: 'terceros', title: 'Crear Tercero', desc: 'Clientes y proveedores en orden', icon: '👤', routeName: 'TercerosCrear', accent: '#7c3aed' },
      { key: 'producto', title: 'Crear Producto', desc: 'Catálogo con inventario y costos', icon: '📦', routeName: 'ProductosCrear', accent: '#0ea5e9', image: '/media/qa-productos.jpg', alt: 'Almacén con productos' },
      { key: 'venta', title: 'Nueva Venta', desc: 'Factura en segundos', icon: '🧾', routeName: 'VentasCrear', accent: '#22c55e' },
      { key: 'compra', title: 'Nueva Compra', desc: 'Recibe y valoriza', icon: '🛒', routeName: 'ComprasCrear', accent: '#f59e0b' },
      { key: 'reportes', title: 'Ver Reportes', desc: 'KPIs y descargas filtradas', icon: '📊', routeName: 'Reportes', accent: '#3b82f6' },
    ]
    // Sustituir por configuración con imágenes (evita issues de encoding)
    try {
      actions.splice(0, actions.length,
        { key: 'terceros', title: 'Crear Tercero', desc: 'Clientes y proveedores en orden', icon: '\uD83D\uDC64', routeName: 'TercerosCrear', accent: '#7c3aed', image: imgTerceros, alt: 'Relacion con clientes y proveedores' },
        { key: 'producto', title: 'Crear Producto', desc: 'Catalogo con inventario y costos', icon: '\uD83D\uDCE6', routeName: 'ProductosCrear', accent: '#0ea5e9', image: imgProductos, alt: 'Almacen con productos' },
        { key: 'venta', title: 'Nueva Venta', desc: 'Factura en segundos', icon: '\uD83D\uDCC4', routeName: 'VentasCrear', accent: '#22c55e', image: imgVentas, alt: 'Carrito de compras y paquetes' },
        { key: 'compra', title: 'Nueva Compra', desc: 'Recibe y valoriza', icon: '\uD83D\uDED2', routeName: 'ComprasCrear', accent: '#f59e0b', image: imgCompras, alt: 'Montacargas con cajas y carrito' },
        { key: 'reportes', title: 'Ver Reportes', desc: 'KPIs y descargas filtradas', icon: '\uD83D\uDCCA', routeName: 'Reportes', accent: '#3b82f6' },
      )
    } catch (_) { /* no-op */ }

    const resolveImage = (path) => {
      if (!path) return ''
      try {
        const base = (import.meta?.env?.BASE_URL || '/').replace(/\/$/, '')
        return path.startsWith('/') ? `${base}${path}` : path
      } catch (_) { return path }
    }

    const tilt = (e) => {
      const card = e.currentTarget
      const inner = card.querySelector('.qa__inner')
      const r = card.getBoundingClientRect()
      const cx = e.clientX - r.left
      const cy = e.clientY - r.top
      const rx = ((cy / r.height) - 0.5) * -2.5
      const ry = ((cx / r.width) - 0.5) * 2.5
      if (inner) inner.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`
    }
    const resetTilt = (e) => {
      const inner = e.currentTarget.querySelector('.qa__inner')
      if (inner) inner.style.transform = 'none'
    }
    return { go, tilt, resetTilt, actions, resolveImage }
  },
}
</script>

<style scoped>
.qactions { width: 100%; max-width: 1440px; margin: 12px auto 30px; padding: 0 24px; overflow-x: hidden; }
.qactions__title { text-align: left; margin: 10px 0 14px; font-size: 20px; color: #0f172a; font-weight: 800; }
.qactions__grid { display: grid; grid-template-columns: 1fr; gap: 18px; }

.qa {
  position: relative;
  display: flex; align-items: center; justify-content: space-between;
  background: linear-gradient(180deg, #ffffff, #f9fbff);
  border: 1px solid #e9eef6;
  border-radius: 18px;
  padding: 28px;
  min-height: 184px;
  box-shadow: 0 10px 26px rgba(2, 6, 23, 0.06);
  cursor: pointer;
  transition: box-shadow .2s ease, transform .16s ease;
  will-change: transform;
  overflow: hidden; /* evita overflow horizontal con sheen/tilt */
  backface-visibility: hidden;
  contain: paint; /* aisla pintura y evita scrollbars intermitentes */
  transform-style: preserve-3d;
  perspective: 800px; /* perspectiva en el contenedor, no en body */
}
.qa__inner { display: flex; align-items: center; justify-content: space-between; width: 100%; will-change: transform; transform-style: preserve-3d; }
.qa::after { content: ''; position: absolute; inset: 0; pointer-events: none; background: linear-gradient(120deg, transparent 40%, rgba(255,255,255,.28) 50%, transparent 60%); transform: translateX(-120%) skewX(-12deg); transition: transform .6s ease; }
.qa--full { width: 100%; }
.qa:hover { box-shadow: 0 16px 36px rgba(2, 6, 23, 0.12); }
.qa:hover::after { transform: translateX(220%) skewX(-12deg); }

.qa__left { display: flex; align-items: center; gap: 14px; }
.qa__badge { width: 52px; height: 52px; border-radius: 50%; display: grid; place-items: center; background: radial-gradient(90% 90% at 30% 30%, var(--accent, #0d6efd), rgba(255,255,255,0) 70%); box-shadow: 0 10px 20px rgba(0,0,0,.06); }
.qa__icon { font-size: 22px; }
.qa__title { font-weight: 800; color: #0f172a; font-size: 18px; }
.qa__desc { margin-top: 2px; color: #64748b; font-size: 14px; }

.qa__media { flex: 0 0 min(40%, 520px); height: 200px; border-radius: 16px; background: linear-gradient(135deg, rgba(13,110,253,.06), rgba(34,197,94,.06)); border: 1px dashed rgba(2,6,23,.12); display: grid; place-items: center; overflow: hidden; }
.qa__img { width: 100%; height: 100%; object-fit: cover; display: block; }
.qa__media-ph { color: #7a8699; font-size: 12px; }

@media (max-width: 900px) { .qactions { padding: 0 12px; } }
@media (max-width: 700px) { .qa { flex-direction: column; align-items: flex-start; gap: 12px; } .qa__media { width: 100%; height: 200px; } }
</style>
