<template>
  <section class="auth">
    <form class="card" autocomplete="off" @submit.prevent="$emit('submit')">
      <h2>{{ title }}</h2>
      <slot />
      <button class="button" type="submit" :disabled="loading">
        {{ loading ? loadingText : submitText }}
      </button>
    </form>

    <AuthFeedback :error="error" :info="info" />

    <p class="auth__switch">
      <slot name="switch" />
    </p>
  </section>
</template>

<script>
import AuthFeedback from './AuthFeedback.vue'

export default {
  name: 'AuthFormLayout',
  components: {
    AuthFeedback,
  },
  emits: ['submit'],
  props: {
    title: {
      type: String,
      required: true,
    },
    submitText: {
      type: String,
      required: true,
    },
    loadingText: {
      type: String,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
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
