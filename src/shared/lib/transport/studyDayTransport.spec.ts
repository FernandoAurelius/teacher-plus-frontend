import { describe, it, expect, vi } from 'vitest'
import { studyDayTransport } from './studyDayTransport'

describe('studyDayTransport', () => {
  it('notifica listeners de foco e permite descadastrar', () => {
    const handler = vi.fn()
    const off = studyDayTransport.onFocus(handler)

    studyDayTransport.focusTask('task-1')
    expect(handler).toHaveBeenCalledWith({ taskId: 'task-1' })

    off()
    studyDayTransport.focusTask('task-2')
    expect(handler).toHaveBeenCalledTimes(1)
  })
})
