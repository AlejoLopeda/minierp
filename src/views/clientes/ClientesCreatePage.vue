<template>
  <section class="cliente-form">
    <header class="cliente-form__header">
      <div>
        <h1 class="cliente-form__title">Nuevo cliente</h1>
        <p class="cliente-form__subtitle">
          Registra un cliente para empezar a gestionar tus ventas.
        </p>
      </div>
      <button type="button" class="cliente-form__secondary-button" @click="volverAlListado">
        Volver al listado
      </button>
    </header>

    <ClienteForm
      v-model="form"
      :loading="isSaving"
      :error="errorMessage"
      mode="create"
      @submit="handleSubmit"
      @cancel="volverAlListado"
    />
  </section>
</template>

<script>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useClientes } from '@/composables/useClientes'
import ClienteForm from '@/components/clientes/ClienteForm.vue'

export default {
  name: 'ClientesCreatePage',
  components: { ClienteForm },
  setup() {
    const router = useRouter()
    const { registrarCliente, isSaving, errorMessage, limpiarError } = useClientes()

    const form = reactive({
      tipoCliente: '',
      nombreRazonSocial: '',
      tipoDocumento: '',
      numeroDocumento: '',
      correoElectronico: '',
    })

    const handleSubmit = async (payload) => {
      try {
        await registrarCliente(payload)
        router.push({ name: 'ClientesList' })
      } catch (error) {
        // mensaje manejado en composable
      }
    }

    const volverAlListado = () => {
      limpiarError()
      router.push({ name: 'ClientesList' })
    }

    return { form, isSaving, errorMessage, handleSubmit, volverAlListado }
  },
}
</script>

<style scoped>
.cliente-form {
  width: min(720px, 100%);
  margin: 0 auto;
  background-color: #fff;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
}

.cliente-form__header { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: 1.5rem; }
.cliente-form__title { margin: 0; font-size: 1.65rem; font-weight: 700; color: #1b1b1f; }
.cliente-form__subtitle { margin: 0.35rem 0 0; color: #5f6368; font-size: 0.95rem; }
.cliente-form__secondary-button { background-color: #f1f3f4; color: #1b1b1f; border: none; border-radius: 999px; padding: 0.75rem 1.5rem; font-weight: 600; }
.cliente-form__secondary-button:hover { background-color: #e2e5e8; }
</style>
