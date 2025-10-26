import { computed, ref } from 'vue'
import {
  listarTerceros,
  obtenerTercero,
  crearTercero,
  actualizarTercero,
  eliminarTercero,
  validateTercero,
} from '@/services/terceroService'

const clientes = ref([])
const current = ref(null)
const isLoaded = ref(false)
const isLoading = ref(false)
const isSaving = ref(false)
const isDeleting = ref(false)
const errorMessage = ref('')
const searchQuery = ref('')

function setError(message) {
  errorMessage.value = message || ''
}

export function useTerceros() {
  async function cargarClientes({ force = false } = {}) {
    if (isLoading.value) return
    if (isLoaded.value && !force) return

    isLoading.value = true
    setError('')

    try {
      const items = await listarTerceros()
      clientes.value = items
      isLoaded.value = true
    } catch (error) {
      setError(error.message || 'No fue posible cargar los clientes')
    } finally {
      isLoading.value = false
    }
  }

  async function cargarClientePorId(id) {
    if (!id) return null
    isLoading.value = true
    setError('')
    try {
      const item = await obtenerTercero(id)
      current.value = item
      return item
    } catch (error) {
      setError(error.message || 'No fue posible cargar el cliente')
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function registrarCliente(payload) {
    if (isSaving.value) return null
    const validation = validateTercero(payload)
    if (Object.keys(validation).length) {
      const first = Object.values(validation)[0]
      setError(first)
      const err = new Error(first)
      err.validation = validation
      throw err
    }

    isSaving.value = true
    setError('')
    try {
      const nuevo = await crearTercero(payload)
      clientes.value = [...clientes.value, nuevo]
      return nuevo
    } catch (error) {
      setError(error.message || 'No fue posible crear el cliente')
      throw error
    } finally {
      isSaving.value = false
    }
  }

  async function guardarCambios(id, payload) {
    if (isSaving.value) return null
    const validation = validateTercero(payload)
    if (Object.keys(validation).length) {
      const first = Object.values(validation)[0]
      setError(first)
      const err = new Error(first)
      err.validation = validation
      throw err
    }

    isSaving.value = true
    setError('')
    try {
      const actualizado = await actualizarTercero(id, payload)
      clientes.value = clientes.value.map((c) => (c.id === id ? actualizado : c))
      current.value = actualizado
      return actualizado
    } catch (error) {
      setError(error.message || 'No fue posible actualizar el cliente')
      throw error
    } finally {
      isSaving.value = false
    }
  }

  async function eliminar(id) {
    if (isDeleting.value) return false
    isDeleting.value = true
    setError('')
    try {
      await eliminarTercero(id)
      clientes.value = clientes.value.filter((c) => c.id !== id)
      if (current.value?.id === id) current.value = null
      return true
    } catch (error) {
      setError(error.message || 'No fue posible eliminar el cliente')
      throw error
    } finally {
      isDeleting.value = false
    }
  }

  function limpiarError() {
    setError('')
  }

  const totalClientes = computed(() => clientes.value.length)
  const clientesFiltrados = computed(() => {
    const q = (searchQuery.value || '').toLowerCase().trim()
    if (!q) return clientes.value
    return clientes.value.filter((c) =>
      (c.nombreRazonSocial || '').toLowerCase().includes(q)
    )
  })

  return {
    clientes,
    current,
    isLoading,
    isSaving,
    isDeleting,
    errorMessage,
    searchQuery,
    totalClientes,
    clientesFiltrados,
    cargarClientes,
    cargarClientePorId,
    registrarCliente,
    guardarCambios,
    eliminar,
    limpiarError,
  }
}

