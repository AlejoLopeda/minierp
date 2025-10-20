import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'
import LoginPage from '../views/LoginPage.vue'
import RegisterPage from '../views/RegisterPage.vue'
import { useSession } from '../composables/useSession'

// Productos
import ProductosListPage from '../views/productos/ProductosListPage.vue'
import ProductosCreatePage from '../views/productos/ProductosCreatePage.vue'

// Clientes
import ClientesCreatePage from '../views/clientes/ClientesCreatePage.vue'
import ClientesListPage from '../views/clientes/ClientesListPage.vue'
import ClientesEditPage from '../views/clientes/ClientesEditPage.vue'

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

  // Clientes
  { path: '/clientes', name: 'ClientesList', component: ClientesListPage, meta: { requiresAuth: true } },
  { path: '/clientes/nuevo', name: 'ClientesCrear', component: ClientesCreatePage, meta: { requiresAuth: true } },
  { path: '/clientes/:id/editar', name: 'ClientesEditar', component: ClientesEditPage, props: true, meta: { requiresAuth: true } },

  // Ventas
  { path: '/ventas', name: 'VentasList', component: VentasListPage, meta: { requiresAuth: true } },
  { path: '/ventas/nuevo', name: 'VentasCrear', component: VentasCreatePage, meta: { requiresAuth: true } },
  { path: '/ventas/:id/editar', name: 'VentasEditar', component: VentasEditPage, props: true, meta: { requiresAuth: true } },
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
