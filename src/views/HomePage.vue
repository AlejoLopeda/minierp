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
      <h1>Bienvenido a <span>Mini ERP</span></h1>
      <p>
        Gestiona tus <b>ventas</b>, <b>compras</b> y <b>reportes</b> desde un mismo lugar.
      </p>
      <p>Optimiza tus procesos con un sistema rápido, intuitivo y moderno.</p>
    </main>

    <footer class="footer">
      <p>© 2025 Mini ERP | Sistema de gestión empresarial</p>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'HomePage',
  methods: {
    irA(ruta) {
      this.$router.push(`/${ruta}`)
    }
  }
}
</script>

<style scoped src="../theme/HomeStyle.css"></style>
