<template>
  <section class="compra-form">
    <header class="compra-form__header">
      <div>
        <h1 class="compra-form__title">Registrar venta</h1>
        <p class="compra-form__subtitle">
          Selecciona el cliente y los productos vendidos. Al registrar la venta se descontará el stock.
        </p>
      </div>
      <button type="button" class="compra-form__secondary-button" @click="volverAlListado">
        Volver al listado
      </button>
    </header>

    <form class="compra-form__form" @submit.prevent="handleSubmit">
      <div class="compra-form__grid">
        <label class="compra-form__field compra-form__field--full">
          <span class="compra-form__label">Cliente</span>
          <select v-model="clienteId" class="compra-form__input" :disabled="isGuardando">
            <option value="">Selecciona un cliente</option>
            <option v-for="cliente in clientesOrdenados" :key="cliente.id" :value="cliente.id">
              {{ cliente.nombreRazonSocial || cliente.nombre || 'Cliente sin nombre' }}
            </option>
          </select>
        </label>

        <label class="compra-form__field compra-form__field--full">
          <span class="compra-form__label">Notas (opcional)</span>
          <textarea v-model.trim="notas" rows="3" class="compra-form__textarea" placeholder="Observaciones" :disabled="isGuardando" />
        </label>
      </div>

      <section class="compra-form__detalle">
        <header class="compra-form__detalle-header">
          <h2 class="compra-form__detalle-title">Detalle de productos</h2>
          <button type="button" class="compra-form__ghost-button" @click="agregarLinea" :disabled="isGuardando || productosDisponibles.length === 0">
            Agregar producto
          </button>
        </header>

        <div v-if="productosCargando" class="compra-form__hint compra-form__hint--inline">Cargando productos disponibles...</div>
        <div v-else-if="productosDisponibles.length === 0" class="compra-form__hint compra-form__hint--inline compra-form__hint--warning">
          No hay productos disponibles.
        </div>

        <div v-for="linea in lineas" :key="linea.id" class="compra-form__linea">
          <div class="compra-form__linea-grid">
            <label class="compra-form__field">
              <span class="compra-form__label">Producto</span>
              <select v-model="linea.productoId" class="compra-form__input" @change="handleProductoChange(linea)" :disabled="isGuardando">
                <option value="">Selecciona un producto</option>
                <option v-for="producto in productosDisponibles" :key="producto.id" :value="producto.id">
                  {{ producto.nombre }} (Stock: {{ producto.stock }})
                </option>
              </select>
            </label>

            <label class="compra-form__field compra-form__field--compact">
              <span class="compra-form__label">Cantidad</span>
              <input v-model.number="linea.cantidad" type="number" min="1" step="1" class="compra-form__input" :disabled="isGuardando">
            </label>

            <label class="compra-form__field compra-form__field--compact">
              <span class="compra-form__label">Precio unitario</span>
              <input v-model.number="linea.precioUnitario" type="number" min="0" step="0.01" class="compra-form__input" :disabled="isGuardando">
            </label>

            <div class="compra-form__resumen">
              <span class="compra-form__resumen-label">Subtotal</span>
              <strong class="compra-form__resumen-value">{{ formatCurrency(calcularSubtotal(linea)) }}</strong>
            </div>
          </div>
          <button type="button" class="compra-form__link-button" @click="quitarLinea(linea.id)" :disabled="isGuardando || lineas.length === 1">Quitar</button>
        </div>
      </section>

  <div v-if="formError" class="compra-form__alert compra-form__alert--warning">{{ formError }}</div>
  <div v-if="clientesError" class="compra-form__alert">{{ clientesError }}</div>
  <div v-if="productosError" class="compra-form__alert">{{ productosError }}</div>
  <div v-if="ventasError" class="compra-form__alert">{{ ventasError }}</div>

      <div class="compra-form__resumen-final">
        <div>
          <span class="compra-form__resumen-label">Productos distintos</span>
          <strong class="compra-form__resumen-value">{{ productosSeleccionados }}</strong>
        </div>
        <div>
          <span class="compra-form__resumen-label">Artículos totales</span>
          <strong class="compra-form__resumen-value">{{ totalArticulos }}</strong>
        </div>
        <div>
          <span class="compra-form__resumen-label">Total de la venta</span>
          <strong class="compra-form__resumen-value compra-form__resumen-value--total">{{ formatCurrency(totalVenta) }}</strong>
        </div>
      </div>

      <div class="compra-form__actions">
        <button type="submit" class="compra-form__primary-button" :disabled="!esValido || isGuardando">{{ isGuardando ? 'Guardando...' : 'Registrar venta' }}</button>
      </div>
    </form>
  </section>
</template>

<script>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useVentas } from '@/composables/useVentas'
import { useClientes } from '@/composables/useClientes'
import { useProductos } from '@/composables/useProductos'

let lineaCounter = 0
function crearLinea() {
  lineaCounter += 1
  return reactive({ id: `linea-${lineaCounter}`, productoId: '', cantidad: 1, precioUnitario: 0 })
}

export default {
  name: 'VentasCreatePage',
  setup() {
    const router = useRouter()
    const { registrarVenta, isSaving: isGuardandoRef, errorMessage: ventasErrorRef, limpiarError: limpiarErrorVentas } = useVentas()
    const { clientes, isLoading: clientesCargandoRef, errorMessage: clientesErrorRef, cargarClientes } = useClientes()
    const { productos, isLoading: productosCargandoRef, errorMessage: productosErrorRef, cargarProductos } = useProductos()

    const clienteId = ref('')
    const notas = ref('')
    const lineas = ref([crearLinea()])
    const formError = ref('')

    const currencyFormatter = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 2 })

    const productosDisponibles = computed(() => productos.value || [])

    const clientesOrdenados = computed(() => {
      return [...clientes.value].sort((a, b) => {
        const nombreA = (a?.nombreRazonSocial || a?.nombre || '').toLowerCase()
        const nombreB = (b?.nombreRazonSocial || b?.nombre || '').toLowerCase()
        return nombreA.localeCompare(nombreB)
      })
    })

    const calcularSubtotal = (linea) => {
      const cantidad = Number(linea?.cantidad || 0)
      const precio = Number(linea?.precioUnitario || 0)
      const subtotal = cantidad * precio
      return Number.isFinite(subtotal) ? subtotal : 0
    }

    const totalVenta = computed(() => lineas.value.reduce((total, linea) => total + calcularSubtotal(linea), 0))

    const productosSeleccionados = computed(() => {
      const ids = new Set()
      lineas.value.forEach((linea) => {
        const productoId = String(linea.productoId || '').trim()
        if (productoId) ids.add(productoId)
      })
      return ids.size
    })

    const totalArticulos = computed(() => lineas.value.reduce((total, linea) => total + Number(linea.cantidad || 0), 0))

    const esValido = computed(() => {
      if (!clienteId.value) return false
      if (lineas.value.length === 0) return false

      const lineasValidas = lineas.value.every((linea) => {
        const productoId = String(linea.productoId || '').trim()
        const cantidad = Number(linea.cantidad)
        const precio = Number(linea.precioUnitario)

        return (
          productoId && Number.isInteger(cantidad) && cantidad > 0 && Number.isFinite(precio) && precio >= 0
        )
      })

      return lineasValidas
    })

    const handleProductoChange = (linea) => {
      if (!linea) return
      const producto = productosDisponibles.value.find((item) => item.id === linea.productoId)
      if (producto) {
        linea.precioUnitario = Number(producto.precio ?? 0)
      } else {
        linea.precioUnitario = 0
      }
    }

    const agregarLinea = () => { lineas.value.push(crearLinea()) }
    const quitarLinea = (id) => { if (lineas.value.length === 1) return; lineas.value = lineas.value.filter((l) => l.id !== id) }

    const resetFormulario = () => { clienteId.value = ''; notas.value = ''; lineaCounter = 0; lineas.value = [crearLinea()]; formError.value = '' }

    const handleSubmit = async () => {
      formError.value = ''
      limpiarErrorVentas()

      if (!esValido.value) { formError.value = 'Revisa que el cliente y los productos tengan datos válidos.'; return }

      const cliente = clientesOrdenados.value.find((item) => item.id === clienteId.value)
      if (!cliente) { formError.value = 'El cliente seleccionado ya no está disponible.'; return }

      const payload = {
        clienteId: cliente.id,
        clienteNombre: cliente.nombreRazonSocial || cliente.nombre || '',
        clienteDocumento: cliente.numeroDocumento || cliente.numero_documento || '',
        notas: notas.value,
        items: lineas.value.map((linea) => ({ productoId: linea.productoId, cantidad: Number.parseInt(linea.cantidad, 10), precioUnitario: Number(linea.precioUnitario) })),
      }

      try {
        await registrarVenta(payload)
        resetFormulario()
        router.push({ name: 'VentasList' })
      } catch (error) {
        if (!ventasErrorRef.value) {
          formError.value = error.message || 'No fue posible crear la venta.'
        }
      }
    }

    const volverAlListado = () => { router.push({ name: 'VentasList' }) }

    const formatCurrency = (valor) => {
      const monto = Number(valor)
      if (!Number.isFinite(monto)) return currencyFormatter.format(0)
      return currencyFormatter.format(monto)
    }

    onMounted(() => {
      limpiarErrorVentas()
      cargarClientes({ force: true }).catch(() => {})
      cargarProductos({ force: true }).catch(() => {})
    })

    const isGuardando = computed(() => isGuardandoRef.value)
    const clientesCargando = computed(() => clientesCargandoRef.value)
    const productosCargando = computed(() => productosCargandoRef.value)
    const clientesError = computed(() => clientesErrorRef.value)
    const productosError = computed(() => productosErrorRef.value)
    const ventasError = computed(() => ventasErrorRef.value)

    return {
      clienteId,
      notas,
      lineas,
      agregarLinea,
      quitarLinea,
      handleProductoChange,
      handleSubmit,
      volverAlListado,
      formatCurrency,
      calcularSubtotal,
      totalVenta,
      productosSeleccionados,
      totalArticulos,
      esValido,
      productosDisponibles,
      clientesOrdenados,
      isGuardando,
      clientesCargando,
      productosCargando,
      clientesError,
      productosError,
      ventasError,
      formError,
    }
  },
}
</script>

<style scoped>
.compra-form {
  width: min(1040px, 100%);
  margin: 0 auto;
  background-color: #fff;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.compra-form__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.compra-form__title {
  margin: 0;
  font-size: 1.65rem;
  font-weight: 700;
  color: #1b1b1f;
}

.compra-form__subtitle {
  margin: 0.35rem 0 0;
  color: #5f6368;
  font-size: 0.95rem;
}

.compra-form__form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.compra-form__grid {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.compra-form__field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.compra-form__field--full {
  width: 100%;
}

.compra-form__field--compact {
  max-width: 180px;
}

.compra-form__label {
  font-weight: 600;
  color: #3c4043;
  font-size: 0.9rem;
}

.compra-form__input,
.compra-form__textarea {
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 1px solid #d0d5dd;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.compra-form__input:focus,
.compra-form__textarea:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 4px rgba(13, 110, 253, 0.12);
}

.compra-form__textarea {
  resize: vertical;
  min-height: 104px;
}

.compra-form__detalle {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
  border-radius: 16px;
  background-color: #f9fafb;
  border: 1px solid #e0e3e7;
}

.compra-form__detalle-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.compra-form__detalle-title {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #1b1b1f;
}

.compra-form__linea {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 12px;
  background-color: #fff;
  border: 1px solid #e0e3e7;
}

.compra-form__linea-grid {
  display: grid;
  grid-template-columns: minmax(0, 2fr) repeat(2, minmax(0, 1fr)) minmax(0, 1fr);
  gap: 1rem;
  align-items: end;
}

.compra-form__resumen {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  align-items: flex-end;
}

.compra-form__resumen-label {
  font-size: 0.85rem;
  color: #5f6368;
}

.compra-form__resumen-value {
  font-size: 1.1rem;
  color: #1b1b1f;
}

.compra-form__resumen-value--total {
  font-size: 1.4rem;
  color: #004aad;
}

.compra-form__resumen-final {
  display: flex;
  justify-content: flex-end;
  gap: 2rem;
  background-color: #f1f3f4;
  padding: 1rem 1.5rem;
  border-radius: 12px;
}

.compra-form__primary-button,
.compra-form__secondary-button,
.compra-form__ghost-button,
.compra-form__link-button {
  border-radius: 999px;
  border: none;
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

.compra-form__primary-button {
  background: linear-gradient(135deg, #38b6ff, #004aad);
  color: #fff;
  box-shadow: 0 12px 20px rgba(56, 182, 255, 0.25);
}

.compra-form__primary-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
  box-shadow: none;
}

.compra-form__primary-button:hover:enabled {
  transform: translateY(-1px);
  box-shadow: 0 14px 22px rgba(56, 182, 255, 0.35);
}

.compra-form__secondary-button {
  background-color: #f1f3f4;
  color: #1b1b1f;
}

.compra-form__secondary-button:hover {
  background-color: #e2e5e8;
}

.compra-form__ghost-button {
  background-color: transparent;
  border: 1px dashed #0d6efd;
  color: #0d6efd;
}

.compra-form__ghost-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.compra-form__ghost-button:hover:not(:disabled) {
  background-color: rgba(13, 110, 253, 0.1);
}

.compra-form__link-button {
  align-self: flex-start;
  padding: 0.25rem 0.75rem;
  font-size: 0.85rem;
  color: #b3261e;
  background-color: transparent;
}

.compra-form__link-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.compra-form__link-button:hover:not(:disabled) {
  background-color: rgba(179, 38, 30, 0.1);
}

.compra-form__alert {
  padding: 1rem;
  border-radius: 12px;
  background-color: rgba(179, 38, 30, 0.08);
  color: #b3261e;
  border: 1px solid rgba(179, 38, 30, 0.2);
  font-size: 0.9rem;
}

.compra-form__alert--warning {
  background-color: rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.4);
  color: #b45309;
}

.compra-form__hint {
  font-size: 0.85rem;
  color: #5f6368;
}

.compra-form__hint--inline {
  margin-bottom: 0.5rem;
}

.compra-form__hint--warning {
  color: #b3261e;
}

.compra-form__actions {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .compra-form {
    padding: 1.5rem;
  }

  .compra-form__header {
    flex-direction: column;
    align-items: stretch;
  }

  .compra-form__linea-grid {
    grid-template-columns: 1fr 1fr;
  }

  .compra-form__field--compact {
    max-width: none;
  }

  .compra-form__resumen-final {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .compra-form__actions {
    justify-content: stretch;
  }

  .compra-form__primary-button {
    width: 100%;
  }
}
</style>
