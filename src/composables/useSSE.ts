export type SSEOptions = {
  signal?: AbortSignal
  onMessage?: (data: string) => void
  onError?: (err: unknown) => void
  headers?: Record<string, string>
}

export async function ssePost(url: string, body: unknown, opts: SSEOptions = {}) {
  const { signal, onMessage, onError, headers } = opts
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

  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''
      for (const line of lines) {
        if (line.startsWith('data:')) onMessage?.(line.slice(5).trim())
      }
    }
  } catch (e) {
    onError?.(e)
  } finally {
    reader.releaseLock()
  }
}
