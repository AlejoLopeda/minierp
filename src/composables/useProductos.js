import { computed, ref } from 'vue'
import { crearProducto, obtenerProductos } from '@/services/productoService'

const productos = ref([])
const isLoaded = ref(false)
const isLoading = ref(false)
const isSaving = ref(false)
const errorMessage = ref('')

function setError(message) {
  errorMessage.value = message || ''
}

export function useProductos() {
  async function cargarProductos({ force = false } = {}) {
    if (isLoading.value) return
    if (isLoaded.value && !force) return

    isLoading.value = true
    setError('')

    try {
      const items = await obtenerProductos()
      productos.value = items
      isLoaded.value = true
    } catch (error) {
      setError(error.message || 'No fue posible cargar los productos')
    } finally {
      isLoading.value = false
    }
  }

  async function registrarProducto(payload) {
    if (isSaving.value) return null

    isSaving.value = true
    setError('')

    try {
      const nuevo = await crearProducto(payload)
      productos.value = [...productos.value, nuevo]
      return nuevo
    } catch (error) {
      setError(error.message || 'No fue posible crear el producto')
      throw error
    } finally {
      isSaving.value = false
    }
  }

  function limpiarError() {
    setError('')
  }

  const totalProductos = computed(() => productos.value.length)

  return {
    productos,
    isLoading,
    isSaving,
    errorMessage,
    totalProductos,
    cargarProductos,
    registrarProducto,
    limpiarError,
  }
}
