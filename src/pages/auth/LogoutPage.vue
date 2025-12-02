<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuth } from '@/features/auth/lib/useAuth'

/**
 * Página dedicada a disparar o fluxo de logout e redirecionar o usuário.
 */
const { logout, loading } = useAuth()

onMounted(async () => {
  await logout()
})
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-white">
    <div
      class="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white/90 px-6 py-8 shadow-sm"
    >
      <p class="text-base font-semibold text-foreground">Saindo da sua conta</p>
      <p class="text-sm text-muted-foreground">Encerrando sessão com segurança e redirecionando...</p>
      <div class="flex items-center gap-2 text-sm text-slate-600">
        <span class="h-2 w-2 animate-pulse rounded-full bg-primary" />
        <span>{{ loading ? 'Processando logout' : 'Redirecionando' }}</span>
      </div>
    </div>
  </div>
</template>
