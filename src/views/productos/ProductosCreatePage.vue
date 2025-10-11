<template>
  <section class="producto-form">
    <header class="producto-form__header">
      <div>
        <h1 class="producto-form__title">Nuevo producto</h1>
        <p class="producto-form__subtitle">
          Registra un producto para disponerlo en tu catálogo interno.
        </p>
      </div>
      <button type="button" class="producto-form__secondary-button" @click="volverAlListado">
        Volver al listado
      </button>
    </header>

    <form class="producto-form__form" @submit.prevent="handleSubmit">
      <div class="producto-form__grid">
        <label class="producto-form__field">
          <span class="producto-form__label">Nombre</span>
          <input
            v-model.trim="form.nombre"
            type="text"
            placeholder="Ej: Monitor 24'' Full HD"
            required
          >
        </label>

        <label class="producto-form__field">
          <span class="producto-form__label">SKU</span>
          <input
            v-model.trim="form.sku"
            type="text"
            placeholder="Ej: MON24-FHD"
            required
            maxlength="20"
          >
        </label>

        <label class="producto-form__field">
          <span class="producto-form__label">Precio</span>
          <input
            v-model.number="form.precio"
            type="number"
            min="0"
            step="0.01"
            placeholder="Ej: 1199.90"
            required
          >
        </label>

        <label class="producto-form__field">
          <span class="producto-form__label">Stock</span>
          <input
            v-model.number="form.stock"
            type="number"
            min="0"
            step="1"
            placeholder="Ej: 15"
            required
          >
        </label>
      </div>

      <div v-if="errorMessage" class="producto-form__alert">
        {{ errorMessage }}
      </div>

      <div class="producto-form__actions">
        <button
          type="submit"
          class="producto-form__primary-button"
          :disabled="isSaving || !esValido"
        >
          {{ isSaving ? 'Guardando...' : 'Crear producto' }}
        </button>
      </div>
    </form>
  </section>
</template>

<script>
import { computed, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useProductos } from '@/composables/useProductos'

export default {
  name: 'ProductosCreatePage',
  setup() {
    const router = useRouter()
    const { registrarProducto, isSaving, errorMessage, limpiarError } = useProductos()

    const form = reactive({
      nombre: '',
      sku: '',
      precio: null,
      stock: null,
    })

    const esValido = computed(() => {
      const nombreValido = typeof form.nombre === 'string' && form.nombre.trim().length > 0
      const skuValido = typeof form.sku === 'string' && form.sku.trim().length > 0
      const precioValido = typeof form.precio === 'number' && !Number.isNaN(form.precio) && form.precio >= 0
      const stockValido = Number.isInteger(form.stock) && form.stock >= 0

      return nombreValido && skuValido && precioValido && stockValido
    })

    const handleSubmit = async () => {
      if (!esValido.value) return

      try {
        await registrarProducto({
          nombre: form.nombre,
          sku: form.sku,
          precio: form.precio,
          stock: form.stock,
        })
        router.push({ name: 'ProductosList' })
      } catch (error) {
        // el mensaje ya se gestiona en el composable
      }
    }

    const volverAlListado = () => {
      router.push({ name: 'ProductosList' })
    }

    watch(
      () => [form.nombre, form.sku, form.precio, form.stock],
      () => {
        if (errorMessage.value) {
          limpiarError()
        }
      }
    )

    return {
      form,
      esValido,
      isSaving,
      errorMessage,
      handleSubmit,
      volverAlListado,
    }
  },
}
</script>

<style scoped>
.producto-form {
  width: min(720px, 100%);
  margin: 0 auto;
  background-color: #fff;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
}

.producto-form__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.producto-form__title {
  margin: 0;
  font-size: 1.65rem;
  font-weight: 700;
  color: #1b1b1f;
}

.producto-form__subtitle {
  margin: 0.35rem 0 0;
  color: #5f6368;
  font-size: 0.95rem;
}

.producto-form__form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.producto-form__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.25rem;
}

.producto-form__field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.producto-form__label {
  font-weight: 600;
  color: #3c4043;
  font-size: 0.9rem;
}

.producto-form__field input {
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 1px solid #d0d5dd;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.producto-form__field input:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 4px rgba(13, 110, 253, 0.12);
}

.producto-form__alert {
  padding: 1rem;
  border-radius: 12px;
  background-color: rgba(179, 38, 30, 0.08);
  color: #b3261e;
  border: 1px solid rgba(179, 38, 30, 0.2);
  font-size: 0.9rem;
}

.producto-form__actions {
  display: flex;
  justify-content: flex-end;
}

.producto-form__primary-button,
.producto-form__secondary-button {
  border-radius: 999px;
  border: none;
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

.producto-form__primary-button {
  background: linear-gradient(135deg, #38b6ff, #004aad);
  color: #fff;
  box-shadow: 0 12px 20px rgba(56, 182, 255, 0.25);
}

.producto-form__primary-button:hover:enabled {
  transform: translateY(-1px);
  box-shadow: 0 14px 22px rgba(56, 182, 255, 0.35);
}

.producto-form__primary-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
  box-shadow: none;
}

.producto-form__secondary-button {
  background-color: #f1f3f4;
  color: #1b1b1f;
}

.producto-form__secondary-button:hover {
  background-color: #e2e5e8;
}

@media (max-width: 768px) {
  .producto-form {
    padding: 1.5rem;
  }

  .producto-form__header {
    flex-direction: column;
    align-items: stretch;
  }

  .producto-form__grid {
    grid-template-columns: 1fr;
  }

  .producto-form__actions {
    justify-content: stretch;
  }

  .producto-form__primary-button {
    width: 100%;
  }
}
</style>
