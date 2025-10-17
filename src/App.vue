<template>
  <router-view v-if="$route.meta.noLayout" />
  <MainLayout v-else>
    <router-view />
  </MainLayout>
</template>

<script>
import MainLayout from './layaouts/MainLayout.vue'

export default {
  name: 'App',
  components: {
    MainLayout,
  },
}
</script>

<style>
body {
  margin: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f5f6fa;
}

* {
  box-sizing: border-box;
}
</style>
