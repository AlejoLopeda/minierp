<template>
  <section class="modules">
    <h2 class="modules__title">Módulos clave</h2>
    <div class="modules__grid">
      <article
        v-for="m in modules"
        :key="m.key"
        class="mod"
        @mousemove="tilt($event)"
        @mouseleave="resetTilt"
        @click="open(m)"
        :class="{ 'is-disabled': !m.routeName }"
        role="button"
        tabindex="0"
      >
        <div class="mod__icon">{{ m.icon }}</div>
        <div class="mod__title">{{ m.title }}</div>
        <div class="mod__desc">{{ m.desc }}</div>
        <div class="mod__cta">{{ m.cta }}</div>
      </article>
    </div>
  </section>
</template>

<script>
import { useRouter } from 'vue-router'

export default {
  name: 'ModulesShowcase',
  setup() {
    const router = useRouter()
    const modules = [
      { key: 'ventas', title: 'Ventas', desc: 'Crea ventas con control de stock y caja.', icon: '🧾', cta: 'Abrir Ventas', routeName: 'VentasList' },
      { key: 'compras', title: 'Compras', desc: 'Ordena, recibe, valoriza y concilia.', icon: '🛒', cta: 'Abrir Compras', routeName: 'ComprasList' },
      { key: 'terceros', title: 'Terceros', desc: 'CRM ligero para clientes y proveedores.', icon: '👤', cta: 'Ver Terceros', routeName: 'TercerosList' },
      { key: 'productos', title: 'Productos', desc: 'Catálogo con SKUs, costos e inventarios.', icon: '📦', cta: 'Ver Productos', routeName: 'ProductosList' },
      { key: 'reportes', title: 'Reportes', desc: 'Indicadores accionables para decidir.', icon: '📊', cta: 'Abrir Reportes', routeName: 'Reportes' },
    ]
    const tilt = (e) => {
      const el = e.currentTarget
      const r = el.getBoundingClientRect()
      const cx = e.clientX - r.left
      const cy = e.clientY - r.top
      const rx = ((cy / r.height) - 0.5) * -4
      const ry = ((cx / r.width) - 0.5) * 4
      el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`
    }
    const resetTilt = (e) => { e.currentTarget.style.transform = 'none' }
    const open = (m) => { if (m.routeName) router.push({ name: m.routeName }) }
    return { modules, tilt, resetTilt, open }
  },
}
</script>

<style scoped>
.modules { max-width: 1200px; margin: 10px auto 22px; padding: 0 10px; }
.modules__title { margin: 10px 0 14px; font-size: 22px; color: #0f172a; }
.modules__grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; }

.mod { background: #fff; border: 1px solid #e9eef6; border-radius: 18px; padding: 20px; min-height: 150px; box-shadow: 0 10px 26px rgba(2,6,23,.06); transition: box-shadow .2s, transform .18s; will-change: transform; cursor: pointer; }
.mod:hover { box-shadow: 0 16px 34px rgba(2,6,23,.1); }
.mod.is-disabled { opacity: .7; cursor: default; }
.mod__icon { font-size: 26px; }
.mod__title { margin-top: 10px; font-weight: 800; color: #111827; font-size: 16px; }
.mod__desc { margin-top: 6px; color: #6b7280; font-size: 13px; min-height: 42px; }
.mod__cta { margin-top: 10px; font-size: 12px; color: #0d6efd; font-weight: 700; }

@media (max-width: 1100px) { .modules__grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 700px) { .modules__grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 480px) { .modules__grid { grid-template-columns: 1fr; } }
</style>
