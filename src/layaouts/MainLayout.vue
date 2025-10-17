<template>
  <div class="home-layout">
    <header class="navbar">
      <div class="logo">Mini ERP</div>
      <nav class="navbar-right">
        <ul class="nav-links">
          <li><button @click="irA('')" class="nav-btn">Inicio</button></li>
          <li><button @click="irA('productos')" class="nav-btn">Productos</button></li>
          <li><button @click="irA('ventas')" class="nav-btn">Ventas</button></li>
          <li><button @click="irA('compras')" class="nav-btn">Compras</button></li>
          <li><button @click="irA('reportes')" class="nav-btn">Reportes</button></li>
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
  methods: {
    irA(ruta) {
      this.$router.push(`/${ruta}`)
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