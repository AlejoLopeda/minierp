<template>
  <section class="productos">
    <header class="productos__header">
      <div class="productos__headings">
        <h1 class="productos__title">Productos</h1>
        <p class="productos__subtitle">
          Gestiona tu catÃ¡logo base. Actualmente tienes <strong>{{ totalProductos }}</strong> productos.
        </p>
      </div>
      <button type="button" class="productos__primary-button" @click="irACrear">
        Nuevo producto
      </button>
    </header>

    <div v-if="isLoading" class="productos__state">
      <span class="productos__state-text">Cargando productos...</span>
    </div>

    <div v-else-if="errorMessage" class="productos__state productos__state--error">
      <span class="productos__state-text">{{ errorMessage }}</span>
      <button type="button" class="productos__secondary-button" @click="reintentar">
        Reintentar
      </button>
    </div>

    <div v-else-if="productos.length === 0" class="productos__state">
      <span class="productos__state-text">
        No tienes productos en el sistema. Crea el primero con el botÃ³n superior.
      </span>
    </div>

    <div v-else class="productos__table-wrapper">
      <table class="productos__table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>SKU</th>
            <th class="productos__column--numeric">Precio</th>
            <th class="productos__column--numeric">Stock</th>
            <th class="productos__column--actions">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="producto in productosFiltrados" :key="producto.id">
            <td>{{ producto.nombre }}</td>
            <td>{{ producto.sku }}</td>
            <td class="productos__column--numeric">{{ formatCurrency(producto.precio) }}</td>
            <td class="productos__column--numeric">{{ producto.stock }}</td>
            <td class="productos__column--actions">
              <RouterLink
                class="productos__link"
                :to="{ name: 'ProductosEditar', params: { idProducto: producto.id } }"
              >
                Editar
              </RouterLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script>
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useProductos } from '@/composables/useProductos'

export default {
  name: 'ProductosListPage',
  setup() {
    const router = useRouter()
    const { productos, isLoading, errorMessage, totalProductos, cargarProductos } = useProductos()

    const currencyFormatter = new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2,
    })


    const irACrear = () => {
      router.push({ name: 'ProductosCrear' })
    }

    const reintentar = () => {
      cargarProductos({ force: true })
    }

    const formatCurrency = (valor) => {
      const monto = Number(valor)
      if (Number.isNaN(monto)) return currencyFormatter.format(0)
      return currencyFormatter.format(monto)
    }

    onMounted(() => {
      cargarProductos()
    })

    const productosFiltrados = computed(() => productos.value || [])

    return {
      productos,
      isLoading,
      errorMessage,
      totalProductos,
      formatCurrency,
      irACrear,
      reintentar,
      productosFiltrados,
    }
  },
}
</script>

<style scoped>
.productos {
  width: min(960px, 100%);
  margin: 0 auto;
  background-color: #fff;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
}

.productos__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 2rem;
}

.productos__headings {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.productos__title {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: #1b1b1f;
}

.productos__subtitle {
  margin: 0;
  color: #5f6368;
  font-size: 0.95rem;
}

.productos__primary-button,
.productos__secondary-button {
  border-radius: 999px;
  border: none;
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

.productos__primary-button {
  background: linear-gradient(135deg, #004aad, #0d6efd);
  color: #fff;
  box-shadow: 0 10px 18px rgba(13, 110, 253, 0.25);
}

.productos__primary-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 20px rgba(13, 110, 253, 0.35);
}

.productos__secondary-button {
  background-color: #f1f3f4;
  color: #1b1b1f;
}

.productos__secondary-button:hover {
  background-color: #e2e5e8;
}

.productos__state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  border: 1px dashed #c7cacf;
  border-radius: 12px;
  background-color: #f9fafb;
  text-align: center;
  color: #5f6368;
}

.productos__state--error {
  color: #b3261e;
  border-color: rgba(179, 38, 30, 0.35);
  background-color: rgba(179, 38, 30, 0.08);
}

.productos__state-text {
  font-size: 0.95rem;
}

.productos__table-wrapper {
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid #e0e3e7;
}

.productos__table {
  width: 100%;
  border-collapse: collapse;
  min-width: 620px;
}

.productos__table thead {
  background-color: #f1f3f4;
}

.productos__table th,
.productos__table td {
  padding: 0.85rem 1rem;
  text-align: left;
  font-size: 0.95rem;
}

.productos__table tbody tr:nth-child(even) {
  background-color: #fafafa;
}

.productos__column--numeric {
  text-align: right;
}

.productos__column--actions {
  text-align: right;
  white-space: nowrap;
}

.productos__link {
  color: #0d6efd;
  font-weight: 600;
  text-decoration: none;
}

.productos__link:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .productos {
    padding: 1.5rem;
  }

  .productos__header {
    flex-direction: column;
    align-items: stretch;
  }

  .productos__primary-button {
    align-self: flex-start;
  }
}
</style>


