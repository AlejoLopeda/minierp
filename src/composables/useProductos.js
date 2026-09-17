import { computed, ref } from 'vue'
import { actualizarProducto, crearProducto, eliminarProducto, obtenerProductoPorId, obtenerProductos } from '@/services/productoService'

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

  async function actualizarProductoExistente(idProducto, payload) {
    if (isSaving.value) return null

    isSaving.value = true
    setError('')

    try {
      const actualizado = await actualizarProducto(idProducto, payload)
      const index = productos.value.findIndex((item) => item.id === String(idProducto))
      if (index !== -1) {
        const copia = [...productos.value]
        copia[index] = actualizado
        productos.value = copia
      }
      return actualizado
    } catch (error) {
      setError(error.message || 'No fue posible actualizar el producto')
      throw error
    } finally {
      isSaving.value = false
    }
  }

  async function eliminarProductoExistente(idProducto) {
    if (!idProducto) return
    setError('')
    try {
      await eliminarProducto(idProducto)
      productos.value = productos.value.filter((item) => item.id !== String(idProducto))
    } catch (error) {
      setError(error.message || 'No fue posible eliminar el producto')
      throw error
    }
  }

  async function cargarProductoPorId(idProducto) {
    setError('')
    try {
      return await obtenerProductoPorId(idProducto)
    } catch (error) {
      setError(error.message || 'No fue posible obtener el producto')
      throw error
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
    actualizarProductoExistente,
    eliminarProductoExistente,
    cargarProductoPorId,
    limpiarError,
  }
}
