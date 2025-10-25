import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'
import LoginPage from '../views/LoginPage.vue'
import RegisterPage from '../views/RegisterPage.vue'
import { useSession } from '../composables/useSession'

// Productos
import ProductosListPage from '../views/productos/ProductosListPage.vue'
import ProductosCreatePage from '../views/productos/ProductosCreatePage.vue'

// Terceros
import TercerosCreatePage from '../views/terceros/TercerosCreatePage.vue'
import TercerosListPage from '../views/terceros/TercerosListPage.vue'
import TercerosEditPage from '../views/terceros/TercerosEditPage.vue'
//Compras
import ComprasListPage from '../views/compras/ComprasListPage.vue'
import ComprasCreatePage from '../views/compras/ComprasCreatePage.vue'

// Ventas
import VentasListPage from '../views/ventas/VentasListPage.vue'
import VentasCreatePage from '../views/ventas/VentasCreatePage.vue'
import VentasEditPage from '../views/ventas/VentasEditPage.vue'

const routes = [
  { path: '/', name: 'Home', component: HomePage, meta: { requiresAuth: true } },
  { path: '/inicio-sesion', name: 'Inicio-sesion', component: LoginPage, meta: { noLayout: true } },
  { path: '/registro', name: 'Registro', component: RegisterPage, meta: { noLayout: true } },

  // Productos
  { path: '/productos', name: 'ProductosList', component: ProductosListPage, meta: { requiresAuth: true } },
  { path: '/productos/nuevo', name: 'ProductosCrear', component: ProductosCreatePage, meta: { requiresAuth: true } },

  // Terceros
  { path: '/terceros', name: 'TercerosList', component: TercerosListPage, meta: { requiresAuth: true } },
  { path: '/terceros/nuevo', name: 'TercerosCrear', component: TercerosCreatePage, meta: { requiresAuth: true } },
  { path: '/terceros/:id/editar', name: 'TercerosEditar', component: TercerosEditPage, props: true, meta: { requiresAuth: true } },

  // Ventas
  { path: '/ventas', name: 'VentasList', component: VentasListPage, meta: { requiresAuth: true } },
  { path: '/ventas/nuevo', name: 'VentasCrear', component: VentasCreatePage, meta: { requiresAuth: true } },
  { path: '/ventas/:id/editar', name: 'VentasEditar', component: VentasEditPage, props: true, meta: { requiresAuth: true } },
   // compras
  { path: '/compras', name: 'ComprasList', component: ComprasListPage, meta: { requiresAuth: true } },
  { path: '/compras/nueva', name: 'ComprasCrear', component: ComprasCreatePage, meta: { requiresAuth: true } },
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
