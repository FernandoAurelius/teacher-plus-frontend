import { ref } from 'vue'
import { ssePost, type SSEEvent } from './useSSE'
import { client } from '@/shared/api/client'

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8010'

type Role = 'user' | 'assistant' | 'system'
export type ChatMsg = { role: Role; content: string }

export function useWizardChat(opts?: { simulate?: boolean }) {
  const messages = ref<ChatMsg[]>([])
  const isStreaming = ref(false)
  const partial = ref('')
  const chunkKey = ref(0)
  let abortCtrl: AbortController | null = null
  let pending = ''
  let flushTimer: number | null = null
  let currentAssistantMessage = ''

  if (opts?.simulate) {
    messages.value.push({
      role: 'system',
      content: 'MODO SIMULADO: NÃO chame commit_user_context. Apenas conduza o questionário e demonstre o resumo final.'
    })
  }

  async function send(input: string, stream = true) {
    if (input.trim()) {
      messages.value.push({ role: 'user', content: input })
    }
    partial.value = ''
    pending = ''
    currentAssistantMessage = ''

    if (stream) {
      isStreaming.value = true
      abortCtrl?.abort()
      abortCtrl = new AbortController()

      try {
        await ssePost(
          `${BASE}/api/ai/chat/stream/`,
          { messages: messages.value, stream: true },
          {
            signal: abortCtrl.signal,
            onEvent: (event: SSEEvent) => {
              if (event.type === 'token') {
                const tokenData = event.data as { text: string; stage: string; index: number }
                if (tokenData.stage === 'assistant_response' || tokenData.stage === 'study_plan') {
                  pending += tokenData.text
                  if (!flushTimer) {
                    flushTimer = window.setTimeout(() => {
                      partial.value += pending
                      currentAssistantMessage += pending
                      pending = ''
                      chunkKey.value++
                      if (flushTimer) window.clearTimeout(flushTimer)
                      flushTimer = null
                    }, 80)
                  }
                }
              } else if (event.type === 'meta') {
                const metaData = event.data as { type: string }
                if (metaData.type === 'session_finished') {
                  // flush final
                  if (pending) {
                    partial.value += pending
                    currentAssistantMessage += pending
                    pending = ''
                    chunkKey.value++
                  }
                }
              }
            },
            onError: () => { /* cai no finally */ }
          }
        )
        // flush final
        if (pending) {
          partial.value += pending
          currentAssistantMessage += pending
          pending = ''
          chunkKey.value++
        }
      } finally {
        isStreaming.value = false
        if (currentAssistantMessage.trim()) {
          messages.value.push({ role: 'assistant', content: currentAssistantMessage })
        }
        partial.value = ''
        currentAssistantMessage = ''
      }
    } else {
      const response = await client.chatWithAI({ messages: messages.value })
      messages.value.push({ role: 'assistant', content: response.reply })
    }
  }

  return { messages, isStreaming, partial, send, chunkKey }
}
