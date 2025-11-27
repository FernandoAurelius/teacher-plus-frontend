import { ref, shallowRef } from 'vue'
import { client, apiBaseUrl } from '@/shared/api/client'

type JobStatus = 'idle' | 'running' | 'succeeded' | 'failed'

export type JobMonitorState = {
  jobId: string | null
  status: JobStatus
  message?: string
  error?: string
  result?: unknown
}

type Strategy = 'auto' | 'sse' | 'polling'

export type JobMonitorOptions = {
  strategy?: Strategy
  intervalMs?: number
  onSuccess?: (payload?: unknown) => void
  onError?: (message?: string) => void
  onUpdate?: (state: JobMonitorState) => void
}

const defaultState: JobMonitorState = {
  jobId: null,
  status: 'idle',
  message: '',
}

export function useJobMonitor(baseOptions: JobMonitorOptions = {}) {
  const state = ref<JobMonitorState>({ ...defaultState })
  const streamAbort = shallowRef<AbortController | null>(null)
  let pollTimer: number | null = null

  const stop = () => {
    if (streamAbort.value) {
      streamAbort.value.abort()
      streamAbort.value = null
    }
    if (pollTimer) {
      window.clearInterval(pollTimer)
      pollTimer = null
    }
  }

  const setState = (next: Partial<JobMonitorState>) => {
    state.value = { ...state.value, ...next }
    baseOptions.onUpdate?.(state.value)
  }

  const handleSuccess = async (payload?: unknown) => {
    setState({ status: 'succeeded', message: 'Job concluído', result: payload })
    baseOptions.onSuccess?.(payload)
    stop()
  }

  const handleError = (message?: string) => {
    setState({ status: 'failed', error: message, message: message ?? 'Falha no job' })
    baseOptions.onError?.(message)
    stop()
  }

  const refresh = async () => {
    if (!state.value.jobId) return
    await pollJob(state.value.jobId)
  }

  const pollJob = async (jobId: string) => {
    try {
      const response = await client.jobStatus({ params: { job_id: jobId } })
      if (response.status === 'succeeded') {
        await handleSuccess(response.result)
        return 'succeeded'
      }
      if (response.status === 'failed') {
        handleError(response.error)
        return 'failed'
      }
      setState({ status: 'running', jobId, message: response.error ?? 'Processando...' })
      return 'running'
    } catch (error) {
      console.error('Erro ao monitorar job', error)
      handleError('Não conseguimos checar o job agora.')
      return 'failed'
    }
  }

  const startPolling = (jobId: string, options: JobMonitorOptions) => {
    stop()
    setState({ jobId, status: 'running', message: 'Monitorando job...' })

    const runPoll = async () => {
      const status = await pollJob(jobId)
      if (status === 'succeeded' || status === 'failed') {
        stop()
      }
    }

    void runPoll()
    pollTimer = window.setInterval(runPoll, options.intervalMs ?? 4000)
  }

  const startStream = (jobId: string, options: JobMonitorOptions) => {
    stop()
    setState({ jobId, status: 'running', message: 'Gerando com IA...' })
    const url = `${apiBaseUrl}/api/ai/jobs/stream/?job_id=${jobId}`

    if (typeof fetch === 'undefined' || typeof ReadableStream === 'undefined') {
      startPolling(jobId, options)
      return
    }

    const abortController = new AbortController()
    streamAbort.value = abortController
    const decoder = new TextDecoder()

    const processPayload = (data: string) => {
      if (!data) return
      try {
        const payload = JSON.parse(data) as { status?: string; error?: string; result?: unknown }
        if (payload.status === 'succeeded') {
          void handleSuccess(payload.result)
        } else if (payload.status === 'failed') {
          handleError(payload.error)
        } else if (payload.status) {
          setState({
            status: 'running',
            jobId,
            message: payload.error ?? 'Processando...',
          })
        }
      } catch (error) {
        console.warn('Falha ao interpretar evento SSE', error)
      }
    }

    fetch(url, {
      credentials: 'include',
      headers: { Accept: 'text/event-stream' },
      signal: abortController.signal,
    })
      .then(async (response) => {
        if (!response.ok || !response.body) {
          throw new Error(`SSE status ${response.status}`)
        }
        const reader = response.body.getReader()
        let buffer = ''
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const segments = buffer.split('\n\n')
          buffer = segments.pop() ?? ''
          for (const segment of segments) {
            const lines = segment.split('\n')
            let data = ''
            for (const line of lines) {
              if (line.startsWith('data:')) {
                data += line.slice(5).trim()
              }
            }
            processPayload(data)
          }
        }
        if (!abortController.signal.aborted) {
          startPolling(jobId, options)
        }
      })
      .catch((error) => {
        if (abortController.signal.aborted) return
        console.warn('SSE encerrado, migrando para polling', error)
        startPolling(jobId, options)
      })
      .finally(() => {
        if (streamAbort.value === abortController) {
          streamAbort.value = null
        }
      })
  }

  const start = (jobId?: string | null, overrideOptions: JobMonitorOptions = {}) => {
    if (!jobId) return
    const merged = { ...baseOptions, ...overrideOptions }
    const strategy = merged.strategy ?? 'auto'

    if (strategy === 'polling') {
      startPolling(jobId, merged)
      return
    }

    const canUseSse = typeof window !== 'undefined' && typeof fetch !== 'undefined'
    if (strategy === 'sse' || (strategy === 'auto' && canUseSse)) {
      startStream(jobId, merged)
      return
    }

    startPolling(jobId, merged)
  }

  return {
    state,
    start,
    stop,
    refresh,
  }
}
