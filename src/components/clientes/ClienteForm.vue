<template>
  <form class="cliente-form__form" @submit.prevent="onSubmit">
    <div class="cliente-form__grid">
      <label class="cliente-form__field">
        <span class="cliente-form__label">Tipo de cliente</span>
        <select v-model="local.tipoCliente" required>
          <option value="">Seleccione</option>
          <option value="Natural">Natural</option>
          <option value="Juridica">Jurídica</option>
        </select>
        <small v-if="errors.tipoCliente" class="cliente-form__error">{{ errors.tipoCliente }}</small>
      </label>

      <label class="cliente-form__field">
        <span class="cliente-form__label">Nombre / Razón social</span>
        <input v-model.trim="local.nombreRazonSocial" type="text" placeholder="Ej: Juan Pérez o ACME S.A." required>
        <small v-if="errors.nombreRazonSocial" class="cliente-form__error">{{ errors.nombreRazonSocial }}</small>
      </label>

      <label class="cliente-form__field">
        <span class="cliente-form__label">Tipo de documento</span>
        <select v-model="local.tipoDocumento" required>
          <option value="">Seleccione</option>
          <option value="NIT">NIT</option>
          <option value="CC">CC</option>
          <option value="CE">CE</option>
          <option value="RUC">RUC</option>
          <option value="DNI">DNI</option>
        </select>
        <small v-if="errors.tipoDocumento" class="cliente-form__error">{{ errors.tipoDocumento }}</small>
      </label>

      <label class="cliente-form__field">
        <span class="cliente-form__label">Número de documento</span>
        <input v-model.trim="local.numeroDocumento" type="text" placeholder="Ej: 123456789" required>
        <small v-if="errors.numeroDocumento" class="cliente-form__error">{{ errors.numeroDocumento }}</small>
      </label>

      <label class="cliente-form__field cliente-form__field--full">
        <span class="cliente-form__label">Correo electrónico</span>
        <input v-model.trim="local.correoElectronico" type="email" placeholder="cliente@correo.com" required>
        <small v-if="errors.correoElectronico" class="cliente-form__error">{{ errors.correoElectronico }}</small>
      </label>
    </div>

    <div v-if="error" class="cliente-form__alert">{{ error }}</div>

    <div class="cliente-form__actions">
      <button type="button" class="cliente-form__secondary-button" @click="$emit('cancel')">Cancelar</button>
      <button type="submit" class="cliente-form__primary-button" :disabled="loading || !esValido">
        {{ loading ? (mode === 'edit' ? 'Guardando...' : 'Creando...') : (mode === 'edit' ? 'Guardar cambios' : 'Crear cliente') }}
      </button>
    </div>
  </form>
</template>

<script>
import { computed, reactive, watch } from 'vue'
import { validateCliente } from '@/services/clienteService'

export default {
  name: 'ClienteForm',
  props: {
    modelValue: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
    error: { type: String, default: '' },
    mode: { type: String, default: 'create' },
  },
  emits: ['update:modelValue', 'submit', 'cancel'],
  setup(props, { emit }) {
    const local = reactive({
      tipoCliente: props.modelValue.tipoCliente || '',
      nombreRazonSocial: props.modelValue.nombreRazonSocial || '',
      tipoDocumento: props.modelValue.tipoDocumento || '',
      numeroDocumento: props.modelValue.numeroDocumento || '',
      correoElectronico: props.modelValue.correoElectronico || '',
    })

    const errors = reactive({})

    // Keep local state in sync when parent modelValue changes (e.g., after GET)
    watch(
      () => props.modelValue,
      (val = {}) => {
        local.tipoCliente = val.tipoCliente || ''
        local.nombreRazonSocial = val.nombreRazonSocial || ''
        local.tipoDocumento = val.tipoDocumento || ''
        local.numeroDocumento = val.numeroDocumento || ''
        local.correoElectronico = val.correoElectronico || ''
      },
      { deep: true, immediate: true }
    )

    watch(
      () => ({ ...local }),
      (val) => emit('update:modelValue', val),
      { deep: true }
    )

    const esValido = computed(() => Object.keys(validateCliente(local)).length === 0)

    const onSubmit = () => {
      const validation = validateCliente(local)
      Object.keys(errors).forEach((k) => delete errors[k])
      Object.assign(errors, validation)
      if (Object.keys(validation).length) return
      emit('submit', { ...local })
    }

    return { local, errors, esValido, onSubmit }
  },
}
</script>

<style scoped>
.cliente-form__form { display: flex; flex-direction: column; gap: 1.25rem; }
.cliente-form__grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.25rem; }
.cliente-form__field { display: flex; flex-direction: column; gap: 0.5rem; }
.cliente-form__field--full { grid-column: 1 / -1; }
.cliente-form__label { font-weight: 600; color: #3c4043; font-size: 0.9rem; }
.cliente-form__field input, .cliente-form__field select {
  padding: 0.75rem 1rem; border-radius: 12px; border: 1px solid #d0d5dd; font-size: 1rem; outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.cliente-form__field input:focus, .cliente-form__field select:focus { border-color: #0d6efd; box-shadow: 0 0 0 4px rgba(13,110,253,0.12); }
.cliente-form__error { color: #b3261e; font-size: 0.8rem; }
.cliente-form__alert { padding: 1rem; border-radius: 12px; background-color: rgba(179,38,30,0.08); color: #b3261e; border: 1px solid rgba(179,38,30,0.2); font-size: 0.9rem; }
.cliente-form__actions { display: flex; justify-content: flex-end; gap: 0.75rem; }
.cliente-form__primary-button, .cliente-form__secondary-button {
  border-radius: 999px; border: none; padding: 0.75rem 1.5rem; font-size: 0.95rem; font-weight: 600; cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}
.cliente-form__primary-button { background: linear-gradient(135deg, #38b6ff, #004aad); color: #fff; box-shadow: 0 12px 20px rgba(56,182,255,0.25); }
.cliente-form__primary-button:hover:enabled { transform: translateY(-1px); box-shadow: 0 14px 22px rgba(56,182,255,0.35); }
.cliente-form__primary-button:disabled { cursor: not-allowed; opacity: 0.6; box-shadow: none; }
.cliente-form__secondary-button { background-color: #f1f3f4; color: #1b1b1f; }
.cliente-form__secondary-button:hover { background-color: #e2e5e8; }

@media (max-width: 768px) {
  .cliente-form__grid { grid-template-columns: 1fr; }
}
</style>

