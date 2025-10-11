<template>
  <div class="layout">
    <header class="layout__header">
      <h1 class="layout__title">Mini ERP</h1>
      <p class="layout__subtitle">Gestion de usuarios</p>
    </header>
    <main class="layout__content">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.layout__header {
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, #2f80ed, #56ccf2);
  color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.layout__title {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 600;
}

.layout__subtitle {
  margin: 0.25rem 0 0;
  opacity: 0.85;
}

.layout__content {
  flex: 1;
  padding: 2rem;
  display: flex;
  justify-content: center;
}
</style>
