import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'
import LoginPage from '../views/LoginPage.vue'
import RegisterPage from '../views/RegisterPage.vue'
import { useSession } from '../composables/useSession'

// Productos
import ProductosListPage from '@/views/productos/ProductosListPage.vue'
import ProductosCreatePage from '@/views/productos/ProductosCreatePage.vue'
const ProductosEditPage = () => import('@/views/productos/ProductosEditPage.vue')

// Terceros (lazy-loaded)
const TercerosCreatePage = () => import('@/views/terceros/TercerosCreatePage.vue')
const TercerosListPage = () => import('@/views/terceros/TercerosListPage.vue')
const TercerosEditPage = () => import('@/views/terceros/TercerosEditPage.vue')
// Compras (lazy-loaded)
const ComprasListPage = () => import('@/views/compras/ComprasListPage.vue')
const ComprasCreatePage = () => import('@/views/compras/ComprasCreatePage.vue')

// Ventas (lazy-loaded)
const VentasListPage = () => import('@/views/ventas/VentasListPage.vue')
const VentasCreatePage = () => import('@/views/ventas/VentasCreatePage.vue')
/* import VentasEditPage from '../views/ventas/VentasEditPage.vue'
 */
// Reportes (lazy-loaded)
const ReportesPage = () => import('@/views/reportes/ReportesPage.vue')
const routes = [
  { path: '/', name: 'Home', component: HomePage, meta: { requiresAuth: true } },
  { path: '/inicio-sesion', name: 'Inicio-sesion', component: LoginPage, meta: { noLayout: true } },
  { path: '/registro', name: 'Registro', component: RegisterPage, meta: { noLayout: true } },

  // Productos
  { path: '/productos', name: 'ProductosList', component: ProductosListPage, meta: { requiresAuth: true } },
  { path: '/productos/nuevo', name: 'ProductosCrear', component: ProductosCreatePage, meta: { requiresAuth: true } },
  { path: '/productos/editar/:idProducto', name: 'ProductosEditar', component: ProductosEditPage, props: true, meta: { requiresAuth: true } },

  // Terceros
  { path: '/terceros', name: 'TercerosList', component: TercerosListPage, meta: { requiresAuth: true } },
  { path: '/terceros/nuevo', name: 'TercerosCrear', component: TercerosCreatePage, meta: { requiresAuth: true } },
  { path: '/terceros/:id/editar', name: 'TercerosEditar', component: TercerosEditPage, props: true, meta: { requiresAuth: true } },

  // Ventas
  { path: '/ventas', name: 'VentasList', component: VentasListPage, meta: { requiresAuth: true } },
  { path: '/ventas/nueva', name: 'VentasCrear', component: VentasCreatePage, meta: { requiresAuth: true } },
/*   { path: '/ventas/:id/editar', name: 'VentasEditar', component: VentasEditPage, props: true, meta: { requiresAuth: true } },
 */   // compras
  { path: '/compras', name: 'ComprasList', component: ComprasListPage, meta: { requiresAuth: true } },
  { path: '/compras/nueva', name: 'ComprasCrear', component: ComprasCreatePage, meta: { requiresAuth: true } },

  // Reportes
  { path: '/reportes', name: 'Reportes', component: ReportesPage, meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  const { token } = useSession()
  const isAuthenticated = Boolean(token.value)

  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({ name: 'Inicio-sesion', query: { redirect: to.fullPath } })
  }

  if (isAuthenticated && (to.name === 'Inicio-sesion' || to.name === 'Registro')) {
    return next({ name: 'Home' })
  }

  return next()
})

export default router
