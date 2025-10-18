<template>
  <div>
    <h1>Bienvenido a <span>Mini ERP</span></h1>
    <p>
      Gestiona tus <b>ventas</b>, <b>compras</b> y <b>reportes</b> desde un mismo lugar.
    </p>
    <p>Optimiza tus procesos con un sistema rápido, intuitivo y moderno.</p>

    <div class="home__cta">
      <button type="button" class="home__primary-button" @click="irACrearCliente">
        Empezar creando un cliente
      </button>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'

export default {
  name: 'HomePage',
  setup() {
    const router = useRouter()
    const irACrearCliente = () => {
      router.push({ name: 'ClientesCrear' })
    }
    return { irACrearCliente }
  },
}
</script>

<style scoped>
.home__cta {
  margin-top: 1.75rem;
}

/* Botón con el mismo estilo que el módulo de productos */
.home__primary-button {
  border-radius: 999px;
  border: none;
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
  background: linear-gradient(135deg, #004aad, #0d6efd);
  color: #fff;
  box-shadow: 0 10px 18px rgba(13, 110, 253, 0.25);
}

.home__primary-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 20px rgba(13, 110, 253, 0.35);
}
</style>

