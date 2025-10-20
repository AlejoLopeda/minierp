import { computed, ref } from 'vue'
import { crearCompra, obtenerCompras } from '@/services/compraService'

const compras = ref([])
const isLoaded = ref(false)
const isLoading = ref(false)
const isSaving = ref(false)
const errorMessage = ref('')

function setError(message) {
  errorMessage.value = message || ''
}

export function useCompras() {
  async function cargarCompras({ force = false } = {}) {
    if (isLoading.value) return
    if (isLoaded.value && !force) return

    isLoading.value = true
    setError('')

    try {
      const items = await obtenerCompras()
      compras.value = items
      isLoaded.value = true
    } catch (error) {
      setError(error.message || 'No fue posible cargar las compras')
    } finally {
      isLoading.value = false
    }
  }

  async function registrarCompra(payload) {
    if (isSaving.value) return null

    isSaving.value = true
    setError('')

    try {
      const nueva = await crearCompra(payload)
      compras.value = [...compras.value, nueva]
      return nueva
    } catch (error) {
      setError(error.message || 'No fue posible registrar la compra')
      throw error
    } finally {
      isSaving.value = false
    }
  }

  function limpiarError() {
    setError('')
  }

  const totalCompras = computed(() => compras.value.length)
  const totalInvertido = computed(() =>
    compras.value.reduce((sum, compra) => sum + Number(compra.total || 0), 0)
  )

  return {
    compras,
    isLoading,
    isSaving,
    errorMessage,
    totalCompras,
    totalInvertido,
    cargarCompras,
    registrarCompra,
    limpiarError,
  }
}
