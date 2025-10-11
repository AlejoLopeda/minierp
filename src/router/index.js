import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'
import LoginPage from '../views/LoginPage.vue'
import RegisterPage from '../views/RegisterPage.vue'
import { useSession } from '../composables/useSession'
import ProductosListPage from '../views/productos/ProductosListPage.vue'
import ProductosCreatePage from '../views/productos/ProductosCreatePage.vue'

const routes = [
  { path: '/', name: 'Home', component: HomePage, meta: { requiresAuth: true } },
  { path: '/inicio-sesion', name: 'Inicio-sesion', component: LoginPage, meta: { noLayout: true } },
  { path: '/registro', name: 'Registro', component: RegisterPage, meta: { noLayout: true } },
  { path: '/productos', name: 'ProductosList', component: ProductosListPage,/*  meta: { requiresAuth: true } */ },
  { path: '/productos/nuevo', name: 'ProductosCrear', component: ProductosCreatePage, /* meta: { requiresAuth: true } */ },
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