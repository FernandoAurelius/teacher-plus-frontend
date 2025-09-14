import { ref } from 'vue'
import { ssePost } from './useSSE'
import { client } from '@/api/client'

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8010'

type Role = 'user' | 'assistant' | 'system'
export type ChatMsg = { role: Role; content: string }

export function useWizardChat(opts?: { simulate?: boolean }) {
  const messages = ref<ChatMsg[]>([])
  const isStreaming = ref(false)
  const partial = ref('')

  // prefixo de simulação (não persistir)
  if (opts?.simulate) {
    messages.value.push({
      role: 'system',
      content:
        'MODO SIMULADO: NÃO chame commit_user_context. Apenas conduza o questionário e demonstre o resumo final.'
    })
  }

  async function send(input: string, stream = true) {
    messages.value.push({ role: 'user', content: input })
    partial.value = ''

    if (stream) {
      isStreaming.value = true
      await ssePost(`${BASE}/api/ai/chat/stream/`, { messages: messages.value, stream: true }, {
        onMessage: (chunk) => {
          if (!chunk.startsWith('[stream-error]')) partial.value += chunk
        },
        onError: () => { isStreaming.value = false }
      })
      isStreaming.value = false
      messages.value.push({ role: 'assistant', content: partial.value })
      partial.value = ''
    } else {
      const response = await client.chatWithAI({ messages: messages.value, stream: false })
      messages.value.push({ role: 'assistant', content: response.reply })
    }
  }

  return { messages, isStreaming, partial, send }
}
