/** Handles SSE POST streaming for chat endpoints. */
export type SSEEvent<TData = Record<string, unknown>> = {
  type: string
  data: TData
  id?: string
  retry?: number
}

export type SSEOptions = {
  signal?: AbortSignal
  onEvent?: (event: SSEEvent) => void
  onError?: (err: unknown) => void
  headers?: Record<string, string>
  delayMs?: number
}

export async function ssePost(url: string, body: unknown, opts: SSEOptions = {}) {
  const { signal, onEvent, onError, headers, delayMs = 0 } = opts

  let res: Response
  try {
    res = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(headers || {}) },
      body: JSON.stringify(body),
      signal
    })
  } catch (fetchError) {
    onError?.(fetchError)
    throw fetchError
  }

  if (!res.ok || !res.body) {
    const httpError = new Error(`SSE HTTP ${res.status}`)
    onError?.(httpError)
    throw httpError
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()

  let buffer = ''
  let eventLines: string[] = []

  try {
    let doneReading = false
    while (!doneReading) {
      const { value, done } = await reader.read()
      if (done) {
        doneReading = true
        continue
      }
      buffer += decoder.decode(value, { stream: true })

      let idx: number
      while ((idx = buffer.indexOf('\n')) !== -1) {
        let line = buffer.slice(0, idx)
        buffer = buffer.slice(idx + 1)
        if (line.endsWith('\r')) line = line.slice(0, -1)

        if (line === '') {
          if (eventLines.length === 0) continue

          let eventType = 'message'
          let eventId: string | undefined
          let retry: number | undefined
          const dataLines: string[] = []

          for (const currentLine of eventLines) {
            if (currentLine.startsWith('event:')) {
              const value = currentLine.slice(6).trim()
              if (value) eventType = value
            } else if (currentLine.startsWith('data:')) {
              dataLines.push(currentLine.slice(5).replace(/^\s/, ''))
            } else if (currentLine.startsWith('id:')) {
              const value = currentLine.slice(3).trim()
              if (value) eventId = value
            } else if (currentLine.startsWith('retry:')) {
              const parsedRetry = Number(currentLine.slice(6).trim())
              if (!Number.isNaN(parsedRetry)) retry = parsedRetry
            }
          }

          const dataPayload = dataLines.join('\n')

          if (!dataPayload.startsWith('[stream-error]')) {
            try {
              const parsedData = dataPayload
                ? JSON.parse(dataPayload)
                : ({} as Record<string, unknown>)
              onEvent?.({ type: eventType, data: parsedData, id: eventId, retry })
              if (delayMs) await new Promise(resolve => setTimeout(resolve, delayMs))
            } catch (parseError) {
              onError?.(parseError)
            }
          }

          eventLines = []
        } else if (!line.startsWith(':')) {
          eventLines.push(line)
        }
      }
    }
  } catch (streamError) {
    onError?.(streamError)
  } finally {
    reader.releaseLock()
  }
}
