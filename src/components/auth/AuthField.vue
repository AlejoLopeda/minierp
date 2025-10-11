<template>
  <label class="field">
    <span>{{ label }}</span>
    <slot />
  </label>
</template>

<script>
export default {
  name: 'AuthField',
  props: {
    label: {
      type: String,
      required: true,
    },
  },
}
</script>
