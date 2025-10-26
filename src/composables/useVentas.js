import { computed, ref } from 'vue'
import { crearVenta, obtenerVentas } from '@/services/ventaService'

const ventas = ref([])
const isLoaded = ref(false)
const isLoading = ref(false)
const isSaving = ref(false)
const errorMessage = ref('')

function setError(message) {
  errorMessage.value = message || ''
}

export function useVentas() {
  async function cargarVentas({ force = false } = {}) {
    if (isLoading.value) return
    if (isLoaded.value && !force) return

    isLoading.value = true
    setError('')

    try {
      const items = await obtenerVentas()
      ventas.value = items
      isLoaded.value = true
    } catch (error) {
      setError(error.message || 'No fue posible cargar las ventas')
    } finally {
      isLoading.value = false
    }
  }

  async function registrarVenta(payload) {
    if (isSaving.value) return null

    isSaving.value = true
    setError('')

    try {
      const nueva = await crearVenta(payload)
      ventas.value = [...ventas.value, nueva]
      return nueva
    } catch (error) {
      setError(error.message || 'No fue posible registrar la venta')
      throw error
    } finally {
      isSaving.value = false
    }
  }

  function limpiarError() {
    setError('')
  }

  const totalVentas = computed(() => ventas.value.length)
  const totalRecaudado = computed(() =>
    ventas.value.reduce((sum, venta) => sum + Number(venta.total || 0), 0)
  )

  return {
    ventas,
    isLoading,
    isSaving,
    errorMessage,
    totalVentas,
    totalRecaudado,
    cargarVentas,
    registrarVenta,
    limpiarError,
  }
}
