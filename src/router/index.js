import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'
import LoginPage from '../views/LoginPage.vue'
import RegisterPage from '../views/RegisterPage.vue'
import { useSession } from '../composables/useSession'

const routes = [
  { path: '/', name: 'Home', component: HomePage, meta: { requiresAuth: true } },
  { path: '/login', name: 'Login', component: LoginPage, meta: { noLayout: true } },
  { path: '/register', name: 'Register', component: RegisterPage, meta: { noLayout: true } },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  const { token } = useSession()
  const isAuthenticated = Boolean(token.value)

  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({ name: 'Login', query: { redirect: to.fullPath } })
  }

  if (isAuthenticated && (to.name === 'Login' || to.name === 'Register')) {
    return next({ name: 'Home' })
  }

  return next()
})

export default router
