import { reactive, ref } from 'vue'
import { toast } from 'vue-sonner'
import { ssePost, type SSEEvent } from './useSSE'
import { client } from '@/shared/api/client'

/** Orchestrates the wizard chat SSE stream and user-facing feedback. */
const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8010'
const FLUSH_DELAY_MS = 80

type Role = 'user' | 'assistant' | 'system'
type TokenStage = 'assistant_response' | 'study_plan' | string

type MetaEventPayload = {
  type?: string
  session_id?: string
  user_context_id?: string
  committed?: boolean
  tokens_streamed?: number
  total_tokens?: number
  error?: unknown
}

type TokenEventPayload = {
  index?: number
  stage?: TokenStage
  text?: string
}

type HeartbeatPayload = {
  stage?: string
  tool?: string
}

type ErrorEventPayload = {
  stage?: string
  tool?: string
  message?: string
  detail?: unknown
}

export type ChatMsg = { role: Role; content: string }

function isAbortError(err: unknown): boolean {
  return (
    err instanceof DOMException && err.name === 'AbortError'
  ) || (
    typeof err === 'object' &&
    err !== null &&
    'name' in err &&
    (err as { name?: string }).name === 'AbortError'
  )
}

function toMessage(err: unknown, fallback = 'Ocorreu um erro inesperado.'): string {
  if (err instanceof Error) return err.message || fallback
  if (typeof err === 'string') return err || fallback
  try {
    const serialized = JSON.stringify(err)
    return serialized === '{}' ? fallback : serialized
  } catch {
    return fallback
  }
}

function dismissToast(id: string | number | null) {
  if (id !== null) {
    toast.dismiss(id)
  }
  return null
}

export function useWizardChat() {
  const messages = ref<ChatMsg[]>([])
  const isStreaming = ref(false)
  const partial = ref('')
  const chunkKey = ref(0)
  const stageBuffers = reactive<Record<string, string>>({
    assistant_response: '',
    study_plan: ''
  })
  const sessionId = ref<string | null>(null)

  let abortCtrl: AbortController | null = null
  let pendingAssistant = ''
  let flushTimer: number | null = null
  let currentAssistantMessage = ''
  let toolToastId: string | number | null = null
  let planToastId: string | number | null = null
  let hasStreamError = false

  function resetAssistantStream() {
    if (flushTimer) {
      window.clearTimeout(flushTimer)
      flushTimer = null
    }
    pendingAssistant = ''
    partial.value = ''
    currentAssistantMessage = ''
    stageBuffers.assistant_response = ''
  }

  function flushPendingAssistant() {
    if (flushTimer) {
      window.clearTimeout(flushTimer)
      flushTimer = null
    }
    if (!pendingAssistant) return
    partial.value += pendingAssistant
    currentAssistantMessage += pendingAssistant
    pendingAssistant = ''
    chunkKey.value++
  }

  function appendAssistantChunk(chunk: string) {
    if (!chunk) return
    stageBuffers.assistant_response = (stageBuffers.assistant_response || '') + chunk
    pendingAssistant += chunk
    if (!flushTimer) {
      flushTimer = window.setTimeout(() => {
        partial.value += pendingAssistant
        currentAssistantMessage += pendingAssistant
        pendingAssistant = ''
        chunkKey.value++
        if (flushTimer) {
          window.clearTimeout(flushTimer)
          flushTimer = null
        }
      }, FLUSH_DELAY_MS)
    }
  }

  function handleTokenEvent(event: SSEEvent<TokenEventPayload>) {
    const data = event.data
    if (!data || typeof data.text !== 'string') return

    const stage: TokenStage = typeof data.stage === 'string' ? data.stage : 'assistant_response'
    stageBuffers[stage] = (stageBuffers[stage] || '') + data.text

    if (stage === 'assistant_response') {
      appendAssistantChunk(data.text)
    }
  }

  function handleMetaEvent(event: SSEEvent<MetaEventPayload>) {
    const data = event.data
    const metaType = typeof data.type === 'string' ? data.type : ''

    switch (metaType) {
      case 'session_started': {
        sessionId.value = typeof data.session_id === 'string' ? data.session_id : null
        hasStreamError = false
        resetAssistantStream()
        planToastId = dismissToast(planToastId)
        toolToastId = dismissToast(toolToastId)
        break
      }

      case 'context_committed': {
        toolToastId = dismissToast(toolToastId)
        toast.success('Contexto salvo', {
          description: 'Vamos gerar seu plano personalizado.'
        })
        break
      }

      case 'plan_generation_started': {
        stageBuffers.study_plan = ''
        planToastId = dismissToast(planToastId)
        planToastId = toast.loading('Gerando plano de estudos...')
        break
      }

      case 'plan_generation_completed': {
        planToastId = dismissToast(planToastId)
        toast.success('Plano de estudos pronto!', {
          description: 'Revise as recomendacoes do assistente.'
        })
        break
      }

      case 'session_finished': {
        flushPendingAssistant()
        planToastId = dismissToast(planToastId)
        toolToastId = dismissToast(toolToastId)

        const errorMessage = data.error ? toMessage(data.error, '') : ''
        if (errorMessage && !hasStreamError) {
          toast.error('Sessao encerrada com erro', {
            description: errorMessage
          })
        }
        hasStreamError = false
        break
      }

      default:
        break
    }
  }

  function handleHeartbeatEvent(event: SSEEvent<HeartbeatPayload>) {
    const data = event.data
    if (data.stage === 'tool_call') {
      const toolName = typeof data.tool === 'string' ? data.tool : 'ferramenta'
      if (toolName === 'commit_user_context' && !toolToastId) {
        toolToastId = toast.loading('Salvando contexto do usuario...')
      }
    }
  }

  function handleErrorEvent(event: SSEEvent<ErrorEventPayload>) {
    const data = event.data
    const message =
      typeof data.message === 'string'
        ? data.message
        : toMessage(data.detail ?? data, 'Falha no assistente.')
    planToastId = dismissToast(planToastId)
    toolToastId = dismissToast(toolToastId)
    hasStreamError = true
    toast.error('Erro durante o atendimento', {
      description: message
    })
  }

  const handleStreamError = (err: unknown) => {
    if (isAbortError(err)) return
    planToastId = dismissToast(planToastId)
    toolToastId = dismissToast(toolToastId)
    hasStreamError = true
    toast.error('Erro na conexao com o assistente', {
      description: toMessage(err)
    })
  }

  function handleEvent(event: SSEEvent) {
    switch (event.type) {
      case 'token':
        handleTokenEvent(event as SSEEvent<TokenEventPayload>)
        break
      case 'meta':
        handleMetaEvent(event as SSEEvent<MetaEventPayload>)
        break
      case 'heartbeat':
        handleHeartbeatEvent(event as SSEEvent<HeartbeatPayload>)
        break
      case 'error':
        handleErrorEvent(event as SSEEvent<ErrorEventPayload>)
        break
      default:
        break
    }
  }

  async function send(input: string, stream = true) {
    if (input.trim()) {
      messages.value.push({ role: 'user', content: input })
    }

    resetAssistantStream()
    hasStreamError = false

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
            onEvent: handleEvent,
            onError: handleStreamError
          }
        )
        flushPendingAssistant()
      } catch (err) {
        if (!isAbortError(err)) {
          console.error('SSE stream failed', err)
        }
      } finally {
        isStreaming.value = false
        flushPendingAssistant()
        if (currentAssistantMessage.trim()) {
          messages.value.push({ role: 'assistant', content: currentAssistantMessage })
        }
        pendingAssistant = ''
        currentAssistantMessage = ''
        partial.value = ''
        stageBuffers.assistant_response = ''
        abortCtrl = null
      }
    } else {
      const response = await client.chatWithAI({ messages: messages.value })
      messages.value.push({ role: 'assistant', content: response.reply })
    }
  }

  return {
    messages,
    isStreaming,
    partial,
    send,
    chunkKey,
    sessionId,
    stageBuffers
  }
}
