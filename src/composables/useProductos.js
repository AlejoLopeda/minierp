import { computed, ref } from 'vue'
import { crearProducto, obtenerProductos, onProductoActualizado } from '@/services/productoService'

const productos = ref([])
const isLoaded = ref(false)
const isLoading = ref(false)
const isSaving = ref(false)
const errorMessage = ref('')
let unsubscribeActualizado = null
let eventosVinculados = false

function setError(message) {
  errorMessage.value = message || ''
}

export function useProductos() {
  if (!eventosVinculados) {
    eventosVinculados = true
    unsubscribeActualizado = onProductoActualizado((productoActualizado) => {
      if (!productoActualizado?.id) return
      const index = productos.value.findIndex((item) => item.id === productoActualizado.id)
      if (index === -1) return
      const actualizado = { ...productos.value[index], ...productoActualizado }
      const copia = [...productos.value]
      copia[index] = actualizado
      productos.value = copia
    })
  }

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

export function disposeProductosListener() {
  if (typeof unsubscribeActualizado === 'function') {
    unsubscribeActualizado()
  }
  eventosVinculados = false
}
