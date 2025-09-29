<template>
  <div id="app-shell" class="relative min-h-dvh">
    <!-- BG global atrás de tudo -->
    <NeoAnimatedBackground :icons="showBgIcons" />

    <!-- Conteúdo das rotas -->
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import NeoAnimatedBackground from '@/components/NeoAnimatedBackground.vue'

const route = useRoute()
const authStore = useAuthStore()

/** Use meta pra desligar ícones onde quiser: meta: { bgIcons: false } */
const showBgIcons = computed(() => route.meta.bgIcons !== false)

onMounted(async () => {
  await authStore.checkAuth()
})
</script>

<style>
html, body, #app, #app-shell { height: 100%; }
</style>
