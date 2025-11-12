<template>
  <table class="tbl">
    <thead>
      <tr><th colspan="4">{{ title }}</th></tr>
    </thead>
    <tbody>
      <tr v-for="row in rows" :key="row.id">
        <td>{{ row.fecha }}</td>
        <td>{{ row.nombre }}</td>
        <td class="tbl__muted">{{ row.items }}</td>
        <td class="tbl__num">{{ row.total }}</td>
      </tr>
      <tr v-if="rows.length === 0">
        <td colspan="4" class="tbl__muted">Sin datos</td>
      </tr>
    </tbody>
  </table>
</template>

<script>
export default {
  name: 'ReportTable',
  props: {
    title: { type: String, required: true },
    rows: { type: Array, default: () => [] },
  },
}
</script>

<style scoped>
/* estilos base provienen de theme/ReportesStyles.css */
</style>

