<template>
  <div class="ventas-edit-container">
    <div class="card">
      <h2 class="title">Editar Venta</h2>

      <form @submit.prevent="actualizarVenta" class="form">
        <div class="form-group">
          <label for="cliente">Cliente:</label>
          <input
            type="text"
            id="cliente"
            v-model="venta.cliente"
            required
            placeholder="Nombre del cliente"
          />
        </div>

        <div class="form-group">
          <label for="fecha">Fecha:</label>
          <input
            type="date"
            id="fecha"
            v-model="venta.fecha"
            required
          />
        </div>

        <div class="form-group">
          <label for="total">Total:</label>
          <input
            type="number"
            id="total"
            step="0.01"
            v-model="venta.total"
            required
          />
        </div>

        <div class="form-actions">
          <router-link to="/ventas" class="btn-cancelar">Cancelar</router-link>
          <button type="submit" class="btn-guardar">Guardar cambios</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const venta = ref({
  id: null,
  cliente: '',
  fecha: '',
  total: 0
})

onMounted(() => {
  // Simula carga de datos de una venta existente
  venta.value = {
    id: route.params.id,
    cliente: 'Cliente ejemplo',
    fecha: '2025-10-20',
    total: 300.0
  }
})

const actualizarVenta = () => {
  alert('✅ Venta actualizada correctamente')
  router.push('/ventas')
}
</script>

<style scoped>
.ventas-edit-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 120px);
  background-color: #f5f6fa;
}

.card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  padding: 2rem 3rem;
  width: 100%;
  max-width: 500px;
  transition: transform 0.2s ease;
}

.card:hover {
  transform: translateY(-3px);
}

.title {
  text-align: center;
  color: #1f2937;
  font-weight: 700;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

label {
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.3rem;
}

input {
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

input:focus {
  border-color: #2563eb;
  outline: none;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}

.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 1.5rem;
}

.btn-cancelar {
  background-color: #e5e7eb;
  color: #1f2937;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.btn-cancelar:hover {
  background-color: #d1d5db;
}

.btn-guardar {
  background-color: #16a34a;
  color: white;
  padding: 0.5rem 1.2rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s ease;
}

.btn-guardar:hover {
  background-color: #15803d;
}
</style>
