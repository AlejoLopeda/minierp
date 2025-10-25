<template>
  <div class="ventas-page">
    <div class="card">
      <h2>Ventas</h2>
      <p>Gestiona tus ventas registradas.</p>

      <div class="actions">
        <input
          v-model="busqueda"
          type="text"
          placeholder="Buscar por cliente o fecha"
          class="input-search"
        />
        <button class="btn-primary" @click="$router.push('/ventas/nuevo')">
          Nueva venta
        </button>
      </div>

      <table class="ventas-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Fecha</th>
            <th>Total</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="venta in ventasFiltradas" :key="venta.id">
            <td>{{ venta.id }}</td>
            <td>{{ venta.cliente }}</td>
            <td>{{ venta.fecha }}</td>
            <td>\${{ venta.total.toFixed(2) }}</td>
            <td>
              <button class="link-btn edit" @click="editarVenta(venta.id)">Editar</button>
              <button class="link-btn delete" @click="eliminarVenta(venta.id)">Eliminar</button>
            </td>
          </tr>
          <tr v-if="ventasFiltradas.length === 0">
            <td colspan="5" class="empty">No se encontraron ventas</td>
          </tr>
        </tbody>
      </table>
    </div>

    <footer class="footer">
      © 2025 Mini ERP | Sistema de gestión empresarial
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const ventas = ref([])
const busqueda = ref('')

onMounted(() => {
  // Simulación de datos
  ventas.value = [
    { id: 1, cliente: 'Juan Pérez', fecha: '2025-10-20', total: 250.5 },
    { id: 2, cliente: 'Ana Gómez', fecha: '2025-10-19', total: 125.0 },
    { id: 3, cliente: 'Luis Torres', fecha: '2025-10-18', total: 400.0 },
  ]
})

const ventasFiltradas = computed(() => {
  const term = busqueda.value.toLowerCase()
  return ventas.value.filter(
    (v) =>
      v.cliente.toLowerCase().includes(term) ||
      v.fecha.includes(term)
  )
})

const editarVenta = (id) => router.push(`/ventas/${id}/editar`)

const eliminarVenta = (id) => {
  if (confirm('¿Seguro que deseas eliminar esta venta?')) {
    ventas.value = ventas.value.filter(v => v.id !== id)
  }
}
</script>

<style scoped>
.ventas-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 20px;
  background-color: #f5f6fa;
  min-height: 100vh;
}

.card {
  background: #fff;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 900px;
}

.card h2 {
  margin-bottom: 5px;
  font-size: 1.8rem;
  color: #222;
}

.card p {
  color: #555;
  margin-bottom: 20px;
}

.actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  gap: 10px;
}

.input-search {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ccc;
  outline: none;
}

.btn-primary {
  background-color: #007bff;
  color: #fff;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.ventas-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.ventas-table th,
.ventas-table td {
  padding: 12px 10px;
  border-bottom: 1px solid #ddd;
  text-align: left;
}

.ventas-table th {
  background-color: #f0f0f0;
  font-weight: 600;
}

.link-btn {
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: underline;
  font-size: 0.9rem;
}

.link-btn.edit {
  color: #007bff;
}

.link-btn.delete {
  color: #dc3545;
}

.empty {
  text-align: center;
  color: #777;
  padding: 15px 0;
}

.footer {
  margin-top: 20px;
  font-size: 0.9rem;
  color: #888;
}
</style>
