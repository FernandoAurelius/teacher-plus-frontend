<template>
  <div :class="['card', className]">
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  className?: string
}

withDefaults(defineProps<Props>(), {
  className: ''
})
</script>

<style scoped>
.card {
  background: linear-gradient(180deg, rgba(20,24,46,0.9), rgba(12,16,30,0.9));
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  backdrop-filter: blur(12px);
  padding: 24px;
}
</style>
