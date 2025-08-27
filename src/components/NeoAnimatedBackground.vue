<script setup lang="ts">
// Nenhuma prop. Só o background animado.
</script>

<template>
  <!-- Camada de fundo ocupa o viewport -->
  <div
    class="absolute inset-0 -z-10 pointer-events-none bg-background"
    style="background: radial-gradient(circle at top left, var(--muted) 0%, transparent 50%), radial-gradient(circle at bottom right, var(--muted) 0%, transparent 50%);"
  >
    <!-- Blob 1 -->
    <span
      class="absolute rounded-full mix-blend-screen opacity-55 blur-[48px] bg-primary/20"
      style="
        left:-12%; top:-8%;
        width:clamp(28rem,40vw,46rem); height:clamp(28rem,40vw,46rem);
        animation: float-x 18s cubic-bezier(0.22,1,0.36,1) infinite;
      "
    />
    <!-- Blob 2 -->
    <span
      class="absolute rounded-full mix-blend-multiply opacity-55 blur-[48px] bg-secondary/20"
      style="
        right:-16%; bottom:-14%;
        width:clamp(28rem,40vw,46rem); height:clamp(28rem,40vw,46rem);
        animation: float-y 22s cubic-bezier(0.22,1,0.36,1) infinite;
      "
    />
    <!-- Blob 3 (lenta/rotacionando) -->
    <span
      class="absolute rounded-full mix-blend-screen opacity-55 blur-[48px] bg-primary/20"
      style="
        left:30%; top:40%;
        width:clamp(28rem,40vw,46rem); height:clamp(28rem,40vw,46rem);
        animation: spin-slow 60s linear infinite;
      "
    />
  </div>
</template>

<style>
/* Keyframes globais (não usar scoped aqui) */
@keyframes float-x {
  0%   { transform: translateX(-8%) translateY(0) scale(1); }
  50%  { transform: translateX(8%) translateY(-2%) scale(1.05); }
  100% { transform: translateX(-8%) translateY(0) scale(1); }
}
@keyframes float-y {
  0%   { transform: translateY(-6%) translateX(0) rotate(0deg); }
  50%  { transform: translateY(6%)  translateX(2%) rotate(15deg); }
  100% { transform: translateY(-6%) translateX(0) rotate(0deg); }
}
@keyframes spin-slow {
  to { transform: rotate(360deg); }
}

/* Acessibilidade: reduz animações */
@media (prefers-reduced-motion: reduce) {
  .fixed.inset-0 > span { animation: none !important; }
}
</style>
