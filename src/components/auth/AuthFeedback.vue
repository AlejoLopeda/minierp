<template>
  <div class="auth__feedback">
    <p v-if="error" class="alert alert--error">{{ error }}</p>
    <p v-if="info" class="alert alert--info">{{ info }}</p>
  </div>
</template>

<script>
export default {
  name: 'AuthFeedback',
  props: {
    error: {
      type: String,
      default: '',
    },
    info: {
      type: String,
      default: '',
    },
  },
}
</script>
