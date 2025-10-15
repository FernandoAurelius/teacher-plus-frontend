<script setup lang="ts">
import WizardChat from '@/components/WizardChat.vue'
</script>

<template>
  <section class="min-h-[70vh] py-10">
    <div class="max-w-3xl mx-auto px-4">
      <div class="mb-4">
        <h1 class="text-3xl font-bold">Cadastro (Simulado)</h1>
        <p class="text-muted-foreground">
          Conversa de onboarding com o agente — sem persistir dados (apenas para avaliar animações).
        </p>
      </div>
      <WizardChat :simulate="true" />
    </div>
  </section>
</template>
