export type SSEEvent = {
  type: string
  data: Record<string, unknown>
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
  const res = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(headers || {}) },
    body: JSON.stringify(body),
    signal
  })
  if (!res.ok || !res.body) throw new Error(`SSE HTTP ${res.status}`)

  const reader = res.body.getReader()
  const decoder = new TextDecoder()

  let buffer = ''
  let eventLines: string[] = []

  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      // consome linha a linha
      let idx: number
      while ((idx = buffer.indexOf('\n')) !== -1) {
        const line = buffer.slice(0, idx)
        buffer = buffer.slice(idx + 1)

        if (line === '') {
          // fim de um evento
          if (eventLines.length) {
            const eventType = eventLines
              .find(l => l.startsWith('event:'))
              ?.slice(6)
              .trim()

            const dataPayload = eventLines
              .filter(l => l.startsWith('data:'))
              .map(l => l.slice(5).replace(/^\s/, '')) // remove 1 espaço após "data:"
              .join('\n') // preserva quebras

            if (eventType && dataPayload && !dataPayload.startsWith('[stream-error]')) {
              try {
                const parsedData = JSON.parse(dataPayload)
                onEvent?.({ type: eventType, data: parsedData })
                if (delayMs) await new Promise(r => setTimeout(r, delayMs))
              } catch (parseError) {
                onError?.(parseError)
              }
            }
            eventLines = []
          }
        } else if (line.startsWith(':')) {
          // comentário SSE — ignore
        } else {
          eventLines.push(line)
        }
      }
    }
  } catch (e) {
    onError?.(e)
  } finally {
    reader.releaseLock()
  }
}
