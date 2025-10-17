<template>
  <section class="cliente-form">
    <header class="cliente-form__header">
      <div>
        <h1 class="cliente-form__title">Nuevo cliente</h1>
        <p class="cliente-form__subtitle">
          Registra un cliente para empezar a gestionar tus ventas.
        </p>
      </div>
    </header>

    <div class="cliente-form__placeholder">
      <p>El formulario de clientes irá aquí.</p>
    </div>
  </section>
  
</template>

<script>
export default {
  name: 'ClientesCreatePage',
}
</script>

<style scoped>
.cliente-form {
  width: min(720px, 100%);
  margin: 0 auto;
  background-color: #fff;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
}

.cliente-form__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.cliente-form__title {
  margin: 0;
  font-size: 1.65rem;
  font-weight: 700;
  color: #1b1b1f;
}

.cliente-form__subtitle {
  margin: 0.35rem 0 0;
  color: #5f6368;
  font-size: 0.95rem;
}

.cliente-form__placeholder {
  display: grid;
  place-items: center;
  height: 180px;
  border: 1px dashed #c7cacf;
  border-radius: 12px;
  background: #f9fafb;
  color: #5f6368;
}
</style>

