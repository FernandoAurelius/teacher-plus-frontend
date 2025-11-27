import { computed, ref, watch } from "vue"
import { useIntervalFn } from "@vueuse/core"

import type { QuickQuestion, QuickTest, QuickTestResult } from "./types"

interface QuickTestSessionOptions {
  autoStartTimer?: boolean
}

export const useQuickTestSession = (
  test: QuickTest,
  options: QuickTestSessionOptions = {},
) => {
  const currentIndex = ref(0)
  const answers = ref<Record<string, string | string[]>>({})
  const isFinished = ref(false)
  const elapsedSeconds = ref(0)
  const timeLeft = ref<number | null>(
    typeof test.durationSeconds === "number" ? test.durationSeconds : null,
  )

  const shouldRunTimer = typeof test.durationSeconds === "number" && options.autoStartTimer !== false

  const { pause, resume } = useIntervalFn(
    () => {
      elapsedSeconds.value += 1
      if (timeLeft.value === null) return
      timeLeft.value = Math.max(0, timeLeft.value - 1)
      if (timeLeft.value === 0) {
        isFinished.value = true
        pause()
      }
    },
    1000,
    { immediate: shouldRunTimer },
  )

  const currentQuestion = computed<QuickQuestion | undefined>(
    () => test.questions[currentIndex.value],
  )

  const progress = computed(() =>
    test.questions.length === 0 ? 0 : Math.min(1, (currentIndex.value + 1) / test.questions.length),
  )

  const selectAnswer = (questionId: string, value: string | string[]) => {
    answers.value = { ...answers.value, [questionId]: value }
  }

  const toggleOption = (questionId: string, optionId: string) => {
    const current = answers.value[questionId]
    const next = new Set(Array.isArray(current) ? current : [])
    if (next.has(optionId)) {
      next.delete(optionId)
    } else {
      next.add(optionId)
    }
    selectAnswer(questionId, Array.from(next))
  }

  const next = () => {
    currentIndex.value = clampIndex(currentIndex.value + 1, test.questions.length)
  }

  const prev = () => {
    currentIndex.value = clampIndex(currentIndex.value - 1, test.questions.length)
  }

  const reset = () => {
    currentIndex.value = 0
    answers.value = {}
    isFinished.value = false
    elapsedSeconds.value = 0
    timeLeft.value = typeof test.durationSeconds === "number" ? test.durationSeconds : null
    if (shouldRunTimer) resume()
  }

  const finish = (): QuickTestResult => {
    isFinished.value = true
    pause()
    return computeResult(test, answers.value, elapsedSeconds.value, timeLeft.value)
  }

  const submit = () => finish()

  watch(
    () => timeLeft.value,
    (value) => {
      if (value === 0 && !isFinished.value) {
        finish()
      }
    },
  )

  return {
    currentIndex,
    currentQuestion,
    answers,
    isFinished,
    elapsedSeconds,
    timeLeft,
    progress,
    selectAnswer,
    toggleOption,
    next,
    prev,
    submit,
    reset,
  }
}

const clampIndex = (value: number, length: number) => {
  if (length <= 0) return 0
  return Math.max(0, Math.min(value, length - 1))
}

const computeResult = (
  test: QuickTest,
  answers: Record<string, string | string[]>,
  elapsedSeconds: number,
  timeLeft: number | null,
): QuickTestResult => {
  let correct = 0
  let totalGradable = 0

  test.questions.forEach((question) => {
    if (!question.correctOptionIds || question.correctOptionIds.length === 0) return
    totalGradable += 1
    const userAnswer = answers[question.id]
    if (question.kind === "single_choice" && typeof userAnswer === "string") {
      if (question.correctOptionIds.includes(userAnswer)) correct += 1
    }
    if (question.kind === "multiple_choice" && Array.isArray(userAnswer)) {
      const expected = new Set(question.correctOptionIds)
      const selected = new Set(userAnswer)
      if (setsEqual(expected, selected)) correct += 1
    }
  })

  const total = test.questions.length
  const gradable = totalGradable || total || 1
  const score = Math.round((correct / gradable) * 100)

  return {
    total,
    correct,
    wrong: Math.max(0, gradable - correct),
    score,
    durationSeconds: test.durationSeconds,
    elapsedSeconds,
  }
}

const setsEqual = (a: Set<string>, b: Set<string>) => {
  if (a.size !== b.size) return false
  for (const value of a) {
    if (!b.has(value)) return false
  }
  return true
}
