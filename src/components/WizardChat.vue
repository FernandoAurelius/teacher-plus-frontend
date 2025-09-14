<script setup lang="ts">
import { ref, nextTick, computed, watch } from 'vue'
import { useWizardChat } from '@/composables/useWizardChat'
import IAThinking from './IAThinking.vue'
import { client } from '@/api/client'

const props = defineProps<{ simulate?: boolean }>()
const { messages, isStreaming, partial, send } = useWizardChat({ simulate: props.simulate })
const input = ref('')
const showConfirmationModal = ref(false)
const isSaving = ref(false)

const collectedContext = computed(() => {
  // Extrair informações do contexto das mensagens do assistente
  const context: Record<string, string> = {}
  messages.value.forEach(msg => {
    if (msg.role === 'assistant') {
      // Procurar por padrões como "Nome: valor", "Objetivo: valor", etc.
      const lines = msg.content.split('\n')
      lines.forEach(line => {
        const match = line.match(/^(.+?):\s*(.+)$/)
        if (match) {
          context[match[1].trim()] = match[2].trim()
        }
      })
    }
  })
  return context
})

const shouldShowConfirmation = computed(() => {
  if (messages.value.length === 0) return false
  const lastMessage = messages.value[messages.value.length - 1]
  if (lastMessage.role !== 'assistant') return false

  // Mostrar modal quando detectar palavras-chave indicando fim do wizard
  const content = lastMessage.content.toLowerCase()
  return content.includes('resumo') ||
         content.includes('final') ||
         content.includes('confirmar') ||
         content.includes('contexto completo')
})

watch(shouldShowConfirmation, (newVal) => {
  if (newVal && !props.simulate) {
    showConfirmationModal.value = true
  }
})

async function onSend() {
  if (!input.value.trim()) return
  await send(input.value, true)
  input.value = ''
  await nextTick()
  document.getElementById('chat-end')?.scrollIntoView({ behavior: 'smooth' })
}

async function confirmAndSave() {
  if (props.simulate) return

  isSaving.value = true
  try {
    // Mapear contexto coletado para o formato esperado pela API
    const userContext = {
      persona: collectedContext.value['Persona'] || collectedContext.value['Perfil'] || '',
      goal: collectedContext.value['Objetivo'] || collectedContext.value['Meta'] || '',
      deadline: collectedContext.value['Prazo'] || collectedContext.value['Deadline'] || '',
      weekly_time_hours: parseInt(collectedContext.value['Horas semanais'] || '0') || 0,
      study_routine: collectedContext.value['Rotina de estudo'] || '',
      background_level: collectedContext.value['Nível'] || collectedContext.value['Background'] || '',
      background_institution_type: collectedContext.value['Tipo de instituição'] || '',
      preferences_language: collectedContext.value['Idioma preferido'] || 'pt-BR',
      tech_device: collectedContext.value['Dispositivo'] || '',
      tech_connectivity: collectedContext.value['Conectividade'] || '',
      notifications: collectedContext.value['Notificações'] || '',
      diagnostic_status: 'completed'
    }

    await client.updateUserContext(userContext)
    showConfirmationModal.value = false
    // TODO: adicionar toast de sucesso aqui
  } catch (error) {
    console.error('Erro ao salvar contexto:', error)
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="space-y-3">
    <div
      class="rounded-xl border border-border bg-card p-4 shadow-md animate-in fade-in slide-in-from-bottom-2"
      v-for="(m, i) in messages" :key="i"
      :class="m.role === 'assistant' ? 'bg-muted/30' : ''"
    >
      <div class="overflow-hidden [mask-image:linear-gradient(90deg,#000_60%,transparent)]">
        <p class="leading-relaxed whitespace-pre-wrap">{{ m.content }}</p>
      </div>
    </div>

    <div v-if="isStreaming || partial"
         class="rounded-xl border border-border bg-muted/30 p-4 shadow-md animate-in fade-in">
      <IAThinking />
      <div class="mt-2 whitespace-pre-wrap">{{ partial }}</div>
    </div>

    <div id="chat-end"></div>

    <div class="flex gap-2 pt-2">
      <input v-model="input" type="text" placeholder="Digite sua resposta…"
             class="flex-1 px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
      <button @click="onSend"
              class="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[.98] transition">
        Enviar
      </button>
    </div>

    <!-- Modal de Confirmação -->
    <div v-if="showConfirmationModal"
         class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-card rounded-xl border border-border shadow-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div class="p-6">
          <h3 class="text-lg font-semibold mb-4">Confirmar Contexto Coletado</h3>

          <div class="space-y-3 mb-6">
            <p class="text-sm text-muted-foreground">
              Revise as informações coletadas durante o chat e confirme para salvar seu perfil:
            </p>

            <div class="bg-muted/30 rounded-lg p-4 space-y-2">
              <div v-for="(value, key) in collectedContext" :key="key"
                   class="flex justify-between text-sm">
                <span class="font-medium">{{ key }}:</span>
                <span class="text-right">{{ value }}</span>
              </div>
            </div>
          </div>

          <div class="flex gap-3">
            <button @click="showConfirmationModal = false"
                    class="flex-1 px-4 py-2 rounded-lg border border-border hover:bg-muted/50 transition">
              Revisar
            </button>
            <button @click="confirmAndSave"
                    :disabled="isSaving"
                    class="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition">
              {{ isSaving ? 'Salvando...' : 'Confirmar e Salvar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
