<template>
  <div class="home-layout">
    <header class="navbar">
      <div class="logo">Mini ERP</div>
      <nav>
        <ul class="nav-links">
          <li><button @click="irA('ventas')" class="nav-btn">Ventas</button></li>
          <li><button @click="irA('compras')" class="nav-btn">Compras</button></li>
          <li><button @click="irA('reportes')" class="nav-btn">Reportes</button></li>
        </ul>
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
export default {
  name: 'MainLayout',
  methods: {
    irA(ruta) {
      this.$router.push(`/${ruta}`)
    },
  },
}
</script>

<style src="../theme/HomeStyles.css"></style>
