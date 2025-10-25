<template>
  <section class="clientes">
    <header class="clientes__header">
      <div class="clientes__headings">
        <h1 class="clientes__title">Terceros</h1>
        <p class="clientes__subtitle">Gestiona tus terceros. Total: <strong>{{ totalClientes }}</strong></p>
      </div>
      <button type="button" class="clientes__primary-button" @click="irACrear">Nuevo tercero</button>
    </header>

    <div class="clientes__toolbar">
      <input v-model.trim="searchQuery" class="clientes__search" type="text" placeholder="Buscar por nombre o razón social">
    </div>

    <div v-if="isLoading" class="clientes__state">
      <span class="clientes__state-text">Cargando terceros...</span>
    </div>
    <div v-else-if="errorMessage" class="clientes__state clientes__state--error">
      <span class="clientes__state-text">{{ errorMessage }}</span>
      <button type="button" class="clientes__secondary-button" @click="reintentar">Reintentar</button>
    </div>
    <div v-else-if="clientesFiltrados.length === 0" class="clientes__state">
      <span class="clientes__state-text">No se encontraron terceros.</span>
    </div>

    <div v-else class="clientes__table-wrapper">
      <table class="clientes__table">
        <thead>
          <tr>
            <th>Nombre/Razón social</th>
            <th>Tipo</th>
            <th>Documento</th>
            <th>Correo</th>
            <th class="clientes__column--actions">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in clientesFiltrados" :key="c.id">
            <td>{{ c.nombreRazonSocial }}</td>
            <td>{{ c.tipoTercero }}</td>
            <td>{{ c.tipoDocumento }} {{ c.numeroDocumento }}</td>
            <td>{{ c.correoElectronico }}</td>
            <td class="clientes__column--actions">
              <button class="clientes__link" @click="irAEditar(c.id)">Editar</button>
              <button class="clientes__link clientes__link--danger" @click="confirmarEliminar(c)">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTerceros } from '@/composables/useTerceros'

export default {
  name: 'TercerosListPage',
  setup() {
    const router = useRouter()
    const { clientesFiltrados, isLoading, errorMessage, totalClientes, cargarClientes, searchQuery, eliminar } = useTerceros()

    const irACrear = () => router.push({ name: 'TercerosCrear' })
    const irAEditar = (id) => router.push({ name: 'TercerosEditar', params: { id } })
    const reintentar = () => cargarClientes({ force: true })
    const confirmarEliminar = async (tercero) => {
      const ok = window.confirm(`¿Eliminar tercero "${tercero.nombreRazonSocial}"?`)
      if (!ok) return
      try { await eliminar(tercero.id) } catch (error) { void error }
    }

    onMounted(() => cargarClientes())

    return { clientesFiltrados, isLoading, errorMessage, totalClientes, searchQuery, irACrear, irAEditar, reintentar, confirmarEliminar }
  },
}
</script>

<style scoped>
/* Se reutilizan las mismas clases de estilos que clientes */
.clientes { width: min(960px, 100%); margin: 0 auto; background: #fff; border-radius: 16px; padding: 2rem; box-shadow: 0 12px 24px rgba(0,0,0,0.08); }
.clientes__header { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: 1.25rem; }
.clientes__headings { display: flex; flex-direction: column; gap: 0.35rem; }
.clientes__title { margin: 0; font-size: 1.75rem; font-weight: 700; color: #1b1b1f; }
.clientes__subtitle { margin: 0; color: #5f6368; font-size: 0.95rem; }
.clientes__primary-button, .clientes__secondary-button { border-radius: 999px; border: none; padding: 0.75rem 1.5rem; font-size: 0.95rem; font-weight: 600; cursor: pointer; transition: transform .2s, box-shadow .2s, background-color .2s; }
.clientes__primary-button { background: linear-gradient(135deg,#004aad,#0d6efd); color:#fff; box-shadow: 0 10px 18px rgba(13,110,253,.25); }
.clientes__primary-button:hover { transform: translateY(-1px); box-shadow: 0 12px 20px rgba(13,110,253,.35); }
.clientes__secondary-button { background: #f1f3f4; color:#1b1b1f; }
.clientes__secondary-button:hover { background: #e2e5e8; }
.clientes__toolbar { margin: 0 0 1rem; }
.clientes__search { width: 100%; padding: 0.75rem 1rem; border-radius: 12px; border: 1px solid #d0d5dd; font-size: 1rem; }
.clientes__table-wrapper { overflow-x: auto; border-radius: 12px; border: 1px solid #e0e3e7; }
.clientes__table { width: 100%; border-collapse: collapse; }
.clientes__table th, .clientes__table td { padding: 12px 14px; border-bottom: 1px solid #eceff3; text-align: left; }
.clientes__column--actions { text-align: right; white-space: nowrap; }
.clientes__link { background: none; border: none; color: #0d6efd; font-weight: 600; cursor: pointer; margin-left: 6px; }
.clientes__link--danger { color: #b3261e; }
.clientes__state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; padding: 2rem; border: 1px dashed #c7cacf; border-radius: 12px; background: #f9fafb; text-align: center; color: #5f6368; }
.clientes__state--error { color: #b3261e; border-color: rgba(179,38,30,.35); background: rgba(179,38,30,.08); }
.clientes__state-text { font-size: 0.95rem; }
</style>
