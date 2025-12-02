/**
 * Gerencia um pomodoro por dia de estudos com persistencia simples.
 * Mantem modo, segundos restantes e estado de execucao sem depender do componente.
 */
import { computed, unref, watch } from 'vue'
import { useIntervalFn, useStorage } from '@vueuse/core'

type PomodoroMode = 'focus' | 'break'

export type PomodoroState = {
  mode: PomodoroMode
  secondsLeft: number
  isRunning: boolean
}

const FOCUS_SECONDS = 25 * 60
const BREAK_SECONDS = 5 * 60

const buildState = (mode: PomodoroMode = 'focus'): PomodoroState => ({
  mode,
  secondsLeft: mode === 'focus' ? FOCUS_SECONDS : BREAK_SECONDS,
  isRunning: false,
})

export function usePomodoroTimer(dayId: string | null | undefined) {
  const storageKey = computed(() => `tp_pomodoro_${unref(dayId) ?? 'unknown'}`)
  const state = useStorage<PomodoroState>(storageKey, () => buildState(), undefined, {
    mergeDefaults: true,
  })

  const { pause, resume } = useIntervalFn(
    () => {
      if (!state.value.isRunning) return
      if (state.value.secondsLeft <= 0) {
        const nextMode: PomodoroMode = state.value.mode === 'focus' ? 'break' : 'focus'
        state.value = { ...buildState(nextMode), isRunning: state.value.isRunning }
        return
      }
      state.value.secondsLeft -= 1
    },
    1000,
    { immediate: false },
  )

  const start = () => {
    state.value.isRunning = true
    resume()
  }

  const pauseTimer = () => {
    state.value.isRunning = false
    pause()
  }

  const reset = (mode: PomodoroMode = 'focus') => {
    pause()
    state.value = buildState(mode)
  }

  const toggle = () => {
    if (state.value.isRunning) {
      pauseTimer()
    } else {
      start()
    }
  }

  const setMode = (mode: PomodoroMode) => {
    state.value = { ...buildState(mode), isRunning: false }
  }

  const displayTime = computed(() => {
    const minutes = Math.floor(state.value.secondsLeft / 60)
    const seconds = state.value.secondsLeft % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  })

  watch(
    () => state.value.isRunning,
    (running) => {
      if (running) resume()
      else pause()
    },
    { immediate: true },
  )

  watch(
    storageKey,
    () => {
      pause()
      state.value.isRunning = false
    },
    { immediate: false },
  )

  return {
    state,
    displayTime,
    toggle,
    start,
    pause: pauseTimer,
    reset,
    setMode,
  }
}
