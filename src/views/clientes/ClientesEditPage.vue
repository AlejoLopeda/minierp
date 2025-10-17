<template>
  <section class="cliente-form">
    <header class="cliente-form__header">
      <div>
        <h1 class="cliente-form__title">Editar cliente</h1>
        <p class="cliente-form__subtitle">Actualiza los datos del cliente.</p>
      </div>
      <button type="button" class="cliente-form__secondary-button" @click="volverAlListado">
        Volver al listado
      </button>
    </header>

    <div v-if="isLoading" class="cliente-form__placeholder">Cargando cliente...</div>
    <div v-else-if="errorMessage" class="cliente-form__alert">{{ errorMessage }}</div>
    <ClienteForm
      v-else
      v-model="form"
      :loading="isSaving"
      :error="errorMessage"
      mode="edit"
      @submit="handleSubmit"
      @cancel="volverAlListado"
    />
  </section>
</template>

<script>
import { reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useClientes } from '@/composables/useClientes'
import ClienteForm from '@/components/clientes/ClienteForm.vue'

export default {
  name: 'ClientesEditPage',
  components: { ClienteForm },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const { cargarClientePorId, guardarCambios, isLoading, isSaving, errorMessage, current, limpiarError } = useClientes()

    const form = reactive({
      tipoCliente: '',
      nombreRazonSocial: '',
      tipoDocumento: '',
      numeroDocumento: '',
      correoElectronico: '',
    })

    onMounted(async () => {
      try {
        const data = await cargarClientePorId(route.params.id)
        Object.assign(form, data)
      } catch (error) {
        // mensaje ya manejado
      }
    })

    const handleSubmit = async (payload) => {
      try {
        await guardarCambios(current.value.id, payload)
        router.push({ name: 'ClientesList' })
      } catch (error) {
        // mensaje manejado por composable
      }
    }

    const volverAlListado = () => {
      limpiarError()
      router.push({ name: 'ClientesList' })
    }

    return { form, isLoading, isSaving, errorMessage, handleSubmit, volverAlListado }
  },
}
</script>

<style scoped>
.cliente-form { width: min(720px, 100%); margin: 0 auto; background: #fff; border-radius: 16px; padding: 2rem; box-shadow: 0 12px 24px rgba(0,0,0,0.08); }
.cliente-form__header { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: 1.5rem; }
.cliente-form__title { margin: 0; font-size: 1.65rem; font-weight: 700; color: #1b1b1f; }
.cliente-form__subtitle { margin: 0.35rem 0 0; color: #5f6368; font-size: 0.95rem; }
.cliente-form__secondary-button { background-color: #f1f3f4; color: #1b1b1f; border: none; border-radius: 999px; padding: 0.75rem 1.5rem; font-weight: 600; }
.cliente-form__secondary-button:hover { background-color: #e2e5e8; }
.cliente-form__placeholder { display: grid; place-items: center; height: 120px; border: 1px dashed #c7cacf; border-radius: 12px; background: #f9fafb; color: #5f6368; }
.cliente-form__alert { padding: 1rem; border-radius: 12px; background-color: rgba(179,38,30,0.08); color: #b3261e; border: 1px solid rgba(179,38,30,0.2); font-size: 0.9rem; }
</style>

