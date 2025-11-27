<template>
  <button
    :class="[
      'btn',
      `btn-${variant}`,
      `btn-${size}`,
      { 'btn-loading': loading }
    ]"
    :disabled="disabled || loading"
    v-bind="$attrs"
  >
    <slot v-if="!loading" />
    <div v-else class="loading-spinner"></div>
  </button>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  loading: false,
  disabled: false
})
</script>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  transition: all var(--dur-fast) var(--ease-standard);
  text-decoration: none;
  outline: none;
}

.btn:focus-visible {
  box-shadow: 0 0 0 2px var(--ring);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

/* Sizes */
.btn-sm {
  height: 36px;
  padding: 0 16px;
  font-size: 14px;
}

.btn-md {
  height: 44px;
  padding: 0 24px;
  font-size: 16px;
}

.btn-lg {
  height: 52px;
  padding: 0 32px;
  font-size: 18px;
}

/* Variants */
.btn-primary {
  background: var(--primary);
  color: var(--fg-base);
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-600);
  transform: scale(1.03);
  box-shadow: var(--shadow-sm);
}

.btn-primary:active:not(:disabled) {
  transform: scale(0.98);
}

.btn-secondary {
  background: var(--secondary);
  color: var(--fg-base);
}

.btn-secondary:hover:not(:disabled) {
  background: #0f9488;
  transform: scale(1.03);
}

.btn-outline {
  background: transparent;
  color: var(--primary);
  border: 1px solid var(--primary);
}

.btn-outline:hover:not(:disabled) {
  background: var(--primary);
  color: var(--fg-base);
}

.btn-ghost {
  background: transparent;
  color: var(--fg-base);
}

.btn-ghost:hover:not(:disabled) {
  background: var(--bg-elev1);
}

/* Loading state */
.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
