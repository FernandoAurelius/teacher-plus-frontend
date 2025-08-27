<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useWizardChat } from '@/composables/useWizardChat'
import IAThinking from './IAThinking.vue'

const props = defineProps<{ simulate?: boolean }>()
const { messages, isStreaming, partial, send } = useWizardChat({ simulate: props.simulate })
const input = ref('')

async function onSend() {
  if (!input.value.trim()) return
  await send(input.value, true)
  input.value = ''
  await nextTick()
  document.getElementById('chat-end')?.scrollIntoView({ behavior: 'smooth' })
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
  </div>
</template>
