import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'
import LoginPage from '../views/LoginPage.vue'
import RegisterPage from '../views/RegisterPage.vue'
import { useSession } from '../composables/useSession'
import ProductosListPage from '../views/productos/ProductosListPage.vue'
import ProductosCreatePage from '../views/productos/ProductosCreatePage.vue'
import ClientesCreatePage from '../views/clientes/ClientesCreatePage.vue'
import ClientesListPage from '../views/clientes/ClientesListPage.vue'
import ClientesEditPage from '../views/clientes/ClientesEditPage.vue'
import ComprasListPage from '../views/compras/ComprasListPage.vue'
import ComprasCreatePage from '../views/compras/ComprasCreatePage.vue'
import VentasListPage from '../views/ventas/VentasListPage.vue'
import VentasCreatePage from '../views/ventas/VentasCreatePage.vue'

const routes = [
  { path: '/', name: 'Home', component: HomePage, meta: { requiresAuth: true } },
  { path: '/inicio-sesion', name: 'Inicio-sesion', component: LoginPage, meta: { noLayout: true } },
  { path: '/registro', name: 'Registro', component: RegisterPage, meta: { noLayout: true } },
  { path: '/productos', name: 'ProductosList', component: ProductosListPage, meta: { requiresAuth: true } },
  { path: '/productos/nuevo', name: 'ProductosCrear', component: ProductosCreatePage, meta: { requiresAuth: true } },
  { path: '/clientes', name: 'ClientesList', component: ClientesListPage, meta: { requiresAuth: true } },
  { path: '/clientes/nuevo', name: 'ClientesCrear', component: ClientesCreatePage, meta: { requiresAuth: true } },
  { path: '/clientes/:id/editar', name: 'ClientesEditar', component: ClientesEditPage, props: true, meta: { requiresAuth: true } },
  { path: '/compras', name: 'ComprasList', component: ComprasListPage, meta: { requiresAuth: true } },
  { path: '/compras/nueva', name: 'ComprasCrear', component: ComprasCreatePage, meta: { requiresAuth: true } },
  { path: '/ventas', name: 'VentasList', component: VentasListPage, meta: { requiresAuth: true } },
  { path: '/ventas/nueva', name: 'VentasCrear', component: VentasCreatePage, meta: { requiresAuth: true } },
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
