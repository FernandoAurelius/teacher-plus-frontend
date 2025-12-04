import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { usePomodoroTimer } from './usePomodoroTimer'

describe('usePomodoroTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('inicia em modo foco com tempo padrao', () => {
    const { state } = usePomodoroTimer('day-1')
    expect(state.value.mode).toBe('focus')
    expect(state.value.secondsLeft).toBe(25 * 60)
    expect(state.value.isRunning).toBe(false)
  })

  it('toggle inicia e reduz o tempo', () => {
    const { state, toggle } = usePomodoroTimer('day-2')
    toggle()
    vi.advanceTimersByTime(1000)
    expect(state.value.secondsLeft).toBe(25 * 60 - 1)
  })

  it('vira para modo pausa ao chegar a zero', () => {
    const { state, toggle } = usePomodoroTimer('day-3')
    state.value.secondsLeft = 0
    toggle()
    vi.advanceTimersByTime(1000)
    expect(state.value.mode).toBe('break')
    expect(state.value.secondsLeft).toBe(5 * 60)
  })
})
