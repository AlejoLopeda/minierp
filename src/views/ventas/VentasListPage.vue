<template>
  <section class="compras">
    <header class="compras__header">
      <div class="compras__headings">
        <h1 class="compras__title">Ventas</h1>
        <p class="compras__subtitle">
          Registro de ventas. Tienes
          <strong>{{ totalVentas }}</strong>
          ventas registradas con un total acumulado de
          <strong>{{ formatCurrency(totalRecaudado) }}</strong>.
        </p>
      </div>
      <button type="button" class="compras__primary-button" @click="irACrear">
        Nueva venta
      </button>
    </header>

    <div v-if="isLoading" class="compras__state">
      <span class="compras__state-text">Cargando ventas...</span>
    </div>

    <div v-else-if="errorMessage" class="compras__state compras__state--error">
      <span class="compras__state-text">{{ errorMessage }}</span>
      <button type="button" class="compras__secondary-button" @click="reintentar">
        Reintentar
      </button>
    </div>

    <div v-else-if="ventasOrdenadas.length === 0" class="compras__state">
      <span class="compras__state-text">
        Aún no registras ventas. Usa el botón superior para añadir la primera.
      </span>
    </div>

    <div v-else class="compras__table-wrapper">
      <table class="compras__table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Cliente</th>
            <th>Productos</th>
            <th class="ventas__column--numeric">Artículos</th>
            <th class="ventas__column--numeric">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="venta in ventasOrdenadas" :key="venta.id">
            <td>
              <div>{{ formatDate(venta.fecha) }}</div>
              <small class="ventas__small-text">{{ renderHora(venta.fecha) }}</small>
            </td>
            <td>
              <div class="compras__cliente-nombre">
                {{ obtenerNombreCliente(venta.cliente) }}
              </div>
              <small v-if="obtenerDocumentoCliente(venta.cliente)" class="compras__small-text">
                Documento: {{ obtenerDocumentoCliente(venta.cliente) }}
              </small>
            </td>
            <td>
              <div class="compras__productos">{{ describirProductos(venta.items) }}</div>
            </td>
            <td class="compras__column--numeric">{{ contarArticulos(venta.items) }}</td>
            <td class="compras__column--numeric">{{ formatCurrency(venta.total) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useVentas } from '@/composables/useVentas'

export default {
  name: 'VentasListPage',
  setup() {
    const router = useRouter()
    const { ventas, isLoading, errorMessage, totalVentas, totalRecaudado, cargarVentas } = useVentas()

    const currencyFormatter = new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2,
    })

    const dateFormatter = new Intl.DateTimeFormat('es-PE', {
      dateStyle: 'medium',
    })

    const timeFormatter = new Intl.DateTimeFormat('es-PE', {
      timeStyle: 'short',
    })

    const ventasOrdenadas = computed(() => {
      return [...ventas.value].sort((a, b) => {
        const fechaA = new Date(a?.fecha || 0).getTime()
        const fechaB = new Date(b?.fecha || 0).getTime()
        return fechaB - fechaA
      })
    })

    const formatCurrency = (valor) => {
      const monto = Number(valor)
      if (!Number.isFinite(monto)) return currencyFormatter.format(0)
      return currencyFormatter.format(monto)
    }

    const formatDate = (valor) => {
      const fecha = valor ? new Date(valor) : null
      if (!fecha || Number.isNaN(fecha.getTime())) return 'Sin fecha'
      return dateFormatter.format(fecha)
    }

    const renderHora = (valor) => {
      const fecha = valor ? new Date(valor) : null
      if (!fecha || Number.isNaN(fecha.getTime())) return ''
      return timeFormatter.format(fecha)
    }

    const obtenerNombreCliente = (cliente) => {
      if (!cliente) return 'Cliente no especificado'
      return (
        cliente.nombre ||
        cliente.nombreRazonSocial ||
        cliente.razonSocial ||
        cliente.nombre_razon_social ||
        cliente.nombreCliente ||
        cliente.nombre_cliente ||
        'Cliente no especificado'
      )
    }

    const obtenerDocumentoCliente = (cliente) => {
      if (!cliente) return ''
      return (
        cliente.numeroDocumento ||
        cliente.numero_documento ||
        cliente.documento ||
        cliente.nro_documento ||
        ''
      )
    }

    const describirProductos = (items = []) => {
      if (!Array.isArray(items) || items.length === 0) return 'Sin productos'
      return items
        .map((item) => {
          const nombre =
            item?.nombre ||
            item?.productoNombre ||
            (typeof item?.producto === 'string' ? item.producto : item?.producto?.nombre) ||
            item?.descripcion ||
            'Producto'
          const cantidad = Number(item?.cantidad || 0)
          return `${nombre} x${cantidad}`
        })
        .join(', ')
    }

    const contarArticulos = (items = []) => {
      if (!Array.isArray(items)) return 0
      return items.reduce((total, item) => total + Number(item?.cantidad || 0), 0)
    }

    const irACrear = () => {
      router.push({ name: 'VentasCrear' })
    }

    const reintentar = () => {
      cargarVentas({ force: true })
    }

    onMounted(() => {
      cargarVentas()
    })

    return {
      ventasOrdenadas,
      totalVentas,
      totalRecaudado,
      isLoading,
      errorMessage,
      formatCurrency,
      formatDate,
      renderHora,
      describirProductos,
      contarArticulos,
      irACrear,
      reintentar,
      obtenerNombreCliente,
      obtenerDocumentoCliente,
    }
  },
}
</script>

<style scoped>
/* Copiado de ComprasListPage.vue para mantener estilos idénticos */
.compras {
  width: min(1040px, 100%);
  margin: 0 auto;
  background-color: #fff;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
}

.compras__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 2rem;
}

.compras__headings {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.compras__title {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: #1b1b1f;
}

.compras__subtitle {
  margin: 0;
  color: #5f6368;
  font-size: 0.95rem;
}

.compras__primary-button,
.compras__secondary-button {
  border-radius: 999px;
  border: none;
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

.compras__primary-button {
  background: linear-gradient(135deg, #004aad, #0d6efd);
  color: #fff;
  box-shadow: 0 10px 18px rgba(13, 110, 253, 0.25);
}

.compras__primary-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 20px rgba(13, 110, 253, 0.35);
}

.compras__secondary-button {
  background-color: #f1f3f4;
  color: #1b1b1f;
}

.compras__secondary-button:hover {
  background-color: #e2e5e8;
}

.compras__state {
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

.compras__state--error {
  color: #b3261e;
  border-color: rgba(179, 38, 30, 0.35);
  background-color: rgba(179, 38, 30, 0.08);
}

.compras__state-text {
  font-size: 0.95rem;
}

.compras__table-wrapper {
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid #e0e3e7;
}

.compras__table {
  width: 100%;
  border-collapse: collapse;
  min-width: 720px;
}

.compras__table thead {
  background-color: #f1f3f4;
}

.compras__table th,
.compras__table td {
  padding: 0.85rem 1rem;
  text-align: left;
  font-size: 0.95rem;
  vertical-align: top;
}

.compras__column--numeric {
  text-align: right;
}

.compras__productos {
  color: #3c4043;
}

.compras__cliente-nombre {
  font-weight: 600;
  color: #1b1b1f;
}

.compras__small-text {
  color: #5f6368;
}

@media (max-width: 768px) {
  .compras {
    padding: 1.5rem;
  }

  .compras__header {
    flex-direction: column;
    align-items: stretch;
  }

  .compras__primary-button {
    align-self: flex-start;
  }
}
</style>
