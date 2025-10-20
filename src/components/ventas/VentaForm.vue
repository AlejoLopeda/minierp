<template>
  <form class="venta-form" @submit.prevent="guardar">
    <label>Cliente:</label>
    <input v-model="form.cliente" type="text" required />

    <label>Fecha:</label>
    <input v-model="form.fecha" type="date" required />

    <label>Total:</label>
    <input v-model.number="form.total" type="number" step="0.01" required />

    <button type="submit" class="btn">Guardar</button>
  </form>
</template>

<script>
import { reactive, watchEffect } from 'vue'

export default {
  name: 'VentaForm',
  props: {
    ventaExistente: {
      type: Object,
      default: null,
    },
  },
  emits: ['guardar'],
  setup(props, { emit }) {
    const form = reactive({
      cliente: '',
      fecha: '',
      total: 0,
    })

    watchEffect(() => {
      if (props.ventaExistente) {
        Object.assign(form, props.ventaExistente)
      }
    })

    const guardar = () => {
      emit('guardar', { ...form })
    }

    return { form, guardar }
  },
}
</script>

<style scoped>
.venta-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 300px;
}
.btn {
  background-color: #28a745;
  color: white;
  padding: 8px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
</style>
