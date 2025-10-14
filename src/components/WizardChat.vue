<script setup lang="ts">
import { ref, nextTick, computed, watch, onMounted } from 'vue'
import { useWizardChat } from '@/composables/useWizardChat'
import IAThinking from './IAThinking.vue'
import ChatMarkdown from './ChatMarkdown.vue'
import { Bot, User } from 'lucide-vue-next'
import { client } from '@/api/client'

const props = defineProps<{ simulate?: boolean }>()
const { messages, isStreaming, partial, send, chunkKey } = useWizardChat({ simulate: props.simulate })
const input = ref('')
const showConfirmationModal = ref(false)
const isSaving = ref(false)

onMounted(async () => {
  // Adicionar prompt do sistema
  messages.value.push({
    role: 'system',
    content: `Você é um assistente de IA especializado em ajudar estudantes a prepararem-se para o ENEM. Sua tarefa é coletar informações sobre o perfil do usuário, suas metas de estudo, rotina, e preferências para criar um plano personalizado. Comece se apresentando de forma amigável e faça perguntas iniciais para entender o perfil do estudante.`
  })
  // Iniciar stream automaticamente
  await send('')
})

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
  const trimmed = input.value.trim()
  if (!trimmed) return
  input.value = ''
  await send(trimmed, true)
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
  <div class="relative h-full max-h-dvh overflow-hidden flex flex-col">

    <!-- Área rolável apenas do chat -->
    <div class="flex-1 overflow-y-auto overscroll-contain scroll-smooth">
      <div class="min-h-full flex flex-col justify-end space-y-3 px-4 pt-4 pb-28">
        <div class="chat-message-fade" v-for="(m, i) in messages.filter(m => m.role !== 'system')" :key="i">
      <div v-if="m.role === 'assistant'" class="flex items-start gap-3">
        <Bot class="h-5 w-5 text-primary mt-1 flex-shrink-0" />
        <div
          class="rounded-2xl border border-border bg-muted/70 backdrop-blur px-4 py-3 shadow-sm
                  w-fit max-w-[min(75ch,calc(100%-4rem))] break-words"
        >
          <ChatMarkdown :source="m.content" />
        </div>
      </div>
      <div v-else class="flex items-start justify-end gap-3">
        <div
          class="rounded-2xl border border-border bg-card/90 backdrop-blur px-4 py-3 shadow-sm
                  w-fit max-w-[min(75ch,calc(100%-4rem))] break-words text-right"
        >
          <p class="leading-relaxed whitespace-pre-wrap">{{ m.content }}</p>
        </div>
        <User class="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
      </div>
    </div>

    <div v-if="isStreaming || partial"
         class="chat-message-fade">
      <div class="flex items-start gap-3">
        <Bot class="h-5 w-5 text-primary mt-1 flex-shrink-0" />
        <div
          class="rounded-2xl border border-border bg-muted/70 backdrop-blur px-4 py-3 shadow-sm
                  w-fit max-w-[min(75ch,calc(100%-4rem))] break-words"
        >
          <IAThinking />
          <div class="mt-2 typing-mask" :key="chunkKey">
            <div class="typing-caret">
              <ChatMarkdown :source="partial" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div id="chat-end"></div>
      </div>
    </div>

    <!-- Barra fixa do input (dentro do componente, não da página) -->
    <div class="absolute bottom-0 left-0 right-0 flex gap-2 p-4 bg-background border-t">
      <input v-model="input" @keydown.enter.prevent="onSend" type="text" placeholder="Digite sua resposta…"
             class="flex-1 px-3 py-2 rounded-lg border border-input bg-background hover:border-input hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50" />
      <button @click="onSend"
              class="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[.98] transition disabled:opacity-50">
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

<style scoped>
.typing-mask {
  /* wipe por máscara, sem flashes */
  -webkit-mask-image: linear-gradient(90deg, #000 65%, transparent 85%);
          mask-image: linear-gradient(90deg, #000 65%, transparent 85%);
  -webkit-mask-size: 200% 100%;
          mask-size: 200% 100%;
  -webkit-mask-position: 0 0;
          mask-position: 0 0;
  animation: mask-wipe .28s ease-out;
  will-change: -webkit-mask-position, mask-position;
}

@keyframes mask-wipe {
  to {
    -webkit-mask-position: 100% 0;
            mask-position: 100% 0;
  }
}

.typing-caret {
  position: relative;
}
.typing-caret::after {
  content: "";
  position: absolute;
  width: 1px;
  height: 1em;
  right: -2px;
  top: 0.1em;
  border-right: 1px solid currentColor;
  animation: caret-blink .9s steps(1) infinite;
}

@keyframes caret-blink {
  50% { border-right-color: transparent; }
}

.chat-message-fade {
  animation: chatFadeIn 0.6s ease-out;
}

@keyframes chatFadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Floating icons animation */
@keyframes float {

  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }

  50% {
    transform: translateY(-10px) rotate(5deg);
  }
}

</style>
