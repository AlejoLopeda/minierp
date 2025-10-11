<template>
  <div class="layout">
    <MainNavbar />
    <main class="layout__content">
      <slot />
    </main>
    <footer class="layout__footer">
      <p>&copy; 2025 Mini ERP | Sistema de gestion empresarial</p>
    </footer>
  </div>
</template>

<script>
import MainNavbar from '@/components/layout/MainNavbar.vue'

export default {
  name: 'MainLayout',
  components: {
    MainNavbar
  }
}
</script>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f6fa;
  color: #333;
}

.layout__content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
}

.layout__footer {
  text-align: center;
  padding: 1.25rem 1rem;
  background-color: #e5e5e5;
  color: #555;
  font-size: 0.9rem;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

@media (max-width: 768px) {
  .layout__content {
    padding: 2.5rem 1rem;
  }
}
</style>
