<template>
  <div class="typing-dots">
    <div class="dot"></div>
    <div class="dot"></div>
    <div class="dot"></div>
  </div>
</template>

<script setup lang="ts">
// Three dots with typing animation
</script>

<style scoped>
.typing-dots {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 12px 16px;
}

.dot {
  width: 8px;
  height: 8px;
  background: var(--fg-muted);
  border-radius: 50%;
  animation: typing 1.4s ease-in-out infinite;
}

.dot:nth-child(1) {
  animation-delay: 0s;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .dot {
    animation: none;
    opacity: 0.6;
  }
}
</style>
