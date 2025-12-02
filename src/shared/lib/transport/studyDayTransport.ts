/**
 * Adapter simples de Transport para focar atividades no StudyDayPage.
 * Permite emitir eventos de foco e assinar/descadastrar sem dependencias externas.
 */
type StudyDayFocusPayload = { taskId: string }

type TransportEventMap = {
  focus: StudyDayFocusPayload
}

type Listener<T> = (payload: T) => void

function createEmitter<TEvents extends Record<string, unknown>>() {
  const listeners = new Map<keyof TEvents, Set<Listener<any>>>()

  const on = <TKey extends keyof TEvents>(event: TKey, listener: Listener<TEvents[TKey]>) => {
    const current = listeners.get(event) ?? new Set()
    current.add(listener)
    listeners.set(event, current)
    return () => {
      current.delete(listener)
    }
  }

  const emit = <TKey extends keyof TEvents>(event: TKey, payload: TEvents[TKey]) => {
    listeners.get(event)?.forEach((listener) => listener(payload))
  }

  return { on, emit }
}

const emitter = createEmitter<TransportEventMap>()

export const studyDayTransport = {
  focusTask(taskId: string) {
    emitter.emit('focus', { taskId })
  },
  onFocus(listener: Listener<StudyDayFocusPayload>) {
    return emitter.on('focus', listener)
  },
}
