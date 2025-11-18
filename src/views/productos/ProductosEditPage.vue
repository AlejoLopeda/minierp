<template>
  <section class="producto-form">
    <header class="producto-form__header">
      <div>
        <h1 class="producto-form__title">Editar producto</h1>
        <p class="producto-form__subtitle">
          Actualiza la información del producto para mantener tu catálogo sincronizado.
        </p>
      </div>
      <RouterLink class="producto-form__secondary-button" :to="{ name: 'ProductosList' }">
        Volver al listado
      </RouterLink>
    </header>

    <div v-if="isLoading" class="producto-form__placeholder">Cargando producto...</div>

    <form v-else class="producto-form__form" @submit.prevent="handleSubmit">
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
            maxlength="20"
            required
          >
        </label>

        <label class="producto-form__field">
          <span class="producto-form__label">Categoría</span>
          <select v-model="form.categoria" required>
            <option disabled value="">Selecciona una categoría</option>
            <option
              v-for="cat in categorias"
              :key="cat"
              :value="cat"
            >{{ cat }}</option>
          </select>
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

      <div v-if="formError" class="producto-form__alert">
        {{ formError }}
      </div>

      <div class="producto-form__actions">
        <RouterLink class="producto-form__secondary-button" :to="{ name: 'ProductosList' }">
          Cancelar
        </RouterLink>
        <button
          type="submit"
          class="producto-form__primary-button"
          :disabled="isSaving || !esValido"
        >
          {{ isSaving ? 'Guardando...' : 'Guardar cambios' }}
        </button>
      </div>
    </form>
  </section>
</template>

<script>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { obtenerProducto, actualizarProducto } from '@/services/productoService'

const CATEGORIAS = ['Hardware', 'Software', 'Servicios', 'Accesorios']

export default {
  name: 'ProductosEditPage',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const idProducto = route.params.idProducto

    const form = reactive({
      nombre: '',
      sku: '',
      categoria: '',
      precio: null,
      stock: null,
    })

    const categorias = ref([...CATEGORIAS])
    const isLoading = ref(true)
    const isSaving = ref(false)
    const formError = ref('')

    const esValido = computed(() => {
      const nombreValido = typeof form.nombre === 'string' && form.nombre.trim().length > 0
      const skuValido = typeof form.sku === 'string' && form.sku.trim().length > 0
      const categoriaValida = typeof form.categoria === 'string' && form.categoria.trim().length > 0
      const precioValido = typeof form.precio === 'number' && !Number.isNaN(form.precio) && form.precio >= 0
      const stockValido = Number.isInteger(form.stock) && form.stock >= 0
      return nombreValido && skuValido && categoriaValida && precioValido && stockValido
    })

    const cargarProducto = async () => {
      isLoading.value = true
      formError.value = ''
      try {
        const producto = await obtenerProducto(idProducto)
        form.nombre = producto?.nombre || ''
        form.sku = producto?.sku || ''
        form.categoria = producto?.categoria || ''
        if (form.categoria && !categorias.value.includes(form.categoria)) {
          categorias.value = [...categorias.value, form.categoria]
        }
        form.precio = Number(producto?.precio ?? 0)
        form.stock = Number(producto?.stock ?? 0)
      } catch (error) {
        formError.value = error.message || 'No fue posible cargar el producto'
      } finally {
        isLoading.value = false
      }
    }

    onMounted(() => {
      if (!idProducto) {
        formError.value = 'El identificador del producto es requerido'
        isLoading.value = false
        return
      }
      void cargarProducto()
    })

    const handleSubmit = async () => {
      if (!esValido.value || !idProducto) {
        formError.value = 'Revisa los campos obligatorios antes de continuar.'
        return
      }
      formError.value = ''
      isSaving.value = true
      try {
        await actualizarProducto(idProducto, {
          nombre: form.nombre,
          sku: form.sku,
          categoria: form.categoria,
          precio: form.precio,
          stock: form.stock,
        })
        router.push({ name: 'ProductosList' })
      } catch (error) {
        formError.value = error.message || 'No fue posible actualizar el producto'
      } finally {
        isSaving.value = false
      }
    }

    watch(
      () => [form.nombre, form.sku, form.categoria, form.precio, form.stock],
      () => {
        if (formError.value) {
          formError.value = ''
        }
      }
    )

    return {
      form,
      categorias,
      isLoading,
      isSaving,
      formError,
      esValido,
      handleSubmit,
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

.producto-form__secondary-button {
  background-color: #f1f3f4;
  color: #1b1b1f;
  border: none;
  border-radius: 999px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.producto-form__secondary-button:hover {
  background-color: #e2e5e8;
}

.producto-form__placeholder {
  display: grid;
  place-items: center;
  height: 160px;
  border: 1px dashed #c7cacf;
  border-radius: 12px;
  background: #f9fafb;
  color: #5f6368;
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

.producto-form__field input,
.producto-form__field select {
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 1px solid #d0d5dd;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  background-color: #fff;
}

.producto-form__field input:focus,
.producto-form__field select:focus {
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
  gap: 0.75rem;
  flex-wrap: wrap;
}

.producto-form__primary-button {
  border-radius: 999px;
  border: none;
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
  background: linear-gradient(135deg, #38b6ff, #004aad);
  color: #fff;
  box-shadow: 0 12px 20px rgba(56, 182, 255, 0.25);
}

.producto-form__primary-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
}

.producto-form__primary-button:hover:enabled {
  transform: translateY(-1px);
  box-shadow: 0 14px 22px rgba(56, 182, 255, 0.35);
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

  .producto-form__primary-button,
  .producto-form__secondary-button {
    width: 100%;
    justify-content: center;
  }
}
</style>
