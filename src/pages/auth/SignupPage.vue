<template>
  <div class="min-h-screen">
    <div v-if="!started" class="flex items-center justify-center min-h-screen p-4">
      <SignupDialog :open="true" @start="startSignup" />
    </div>
    <div v-else class="fixed inset-0 overflow-hidden">
      <div class="h-full max-w-3xl mx-auto px-4">
        <SignupChat @signup-complete="onSignupComplete" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import SignupDialog from './SignupDialog.vue'
import SignupChat from './SignupChat.vue'

const started = ref(false)
const router = useRouter()

function startSignup() {
  started.value = true
}

function onSignupComplete() {
  // Após cadastro, redirecionar para wizard-simulado (etapa 2)
  router.push('/wizard-simulado')
}
</script>
