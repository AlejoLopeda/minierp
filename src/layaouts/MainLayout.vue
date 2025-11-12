<template>
  <div class="home-layout">
    <header class="navbar">
      <router-link to="/" class="logo" aria-label="Ir al inicio">Mini ERP</router-link>
      <button class="navbar-toggle" @click="isOpen = !isOpen" :aria-expanded="isOpen.toString()" aria-label="Abrir o cerrar menú">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M4 6H20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="M4 12H20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="M4 18H20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
      <nav class="navbar-right" :class="{ 'is-open': isOpen }">
        <ul class="nav-links">
          <li><button @click="go('')" :class="['nav-btn', { 'is-active': isActive('') }]">Inicio</button></li>
          <li><button @click="go('productos')" :class="['nav-btn', { 'is-active': isActive('productos') }]">Productos</button></li>
          <li><button @click="go('terceros')" :class="['nav-btn', { 'is-active': isActive('terceros') }]">Terceros</button></li>
          <li><button @click="go('ventas')" :class="['nav-btn', { 'is-active': isActive('ventas') }]">Ventas</button></li>
          <li><button @click="go('compras')" :class="['nav-btn', { 'is-active': isActive('compras') }]">Compras</button></li>
          <li><button @click="go('reportes')" :class="['nav-btn', { 'is-active': isActive('reportes') }]">Reportes</button></li>
        </ul>
        <button class="logout-btn" @click="logout">Cerrar sesión</button>
      </nav>
    </header>

    <main class="home-content">
      <slot />
    </main>

    <footer class="footer">
      <p>© 2025 Mini ERP | Sistema de gestión empresarial</p>
    </footer>
  </div>
  
</template>

<script>
import { useSession } from '../composables/useSession'

export default {
  name: 'MainLayout',
  data() {
    return { isOpen: false }
  },
  methods: {
    go(ruta) {
      this.isOpen = false
      this.$router.push(`/${ruta}`)
    },
    isActive(segment) {
      const path = this.$route.path || '/'
      if (!segment) return path === '/'
      return path.startsWith(`/${segment}`)
    },
    logout() {
      const { clearSession } = useSession()
      clearSession()
      this.$router.push({ name: 'Inicio-sesion' })
    },
  },
}
</script>

<style src="../theme/HomeStyles.css"></style>
