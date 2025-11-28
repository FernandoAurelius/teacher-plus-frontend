<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue"
import { ChevronLeft, ChevronRight } from "lucide-vue-next"

import QuestionCard from "./QuestionCard.vue"
import ResultPanel from "./ResultPanel.vue"
import type { QuickTest, QuickTestResult } from "../model/types"
import { useQuickTestSession } from "../model/useQuickTestSession"
import { Button } from "@/shared/ui/button"
import { Progress } from "@/shared/ui/progress"
import { StatusBadge } from "@/shared/ui/status-badge"

const props = withDefaults(
  defineProps<{
    test: QuickTest
    mode?: "practice" | "exam"
  }>(),
  {
    mode: "exam",
  },
)

const emit = defineEmits<{
  (e: "submit", result: QuickTestResult): void
}>()

const session = useQuickTestSession(props.test)
const result = ref<QuickTestResult | null>(null)
const isPracticeMode = computed(() => props.mode === "practice")

const currentValue = computed(() => {
  const questionId = session.currentQuestion.value?.id
  if (!questionId) return undefined
  return session.answers.value[questionId]
})

const canPrev = computed(() => session.currentIndex.value > 0)
const canNext = computed(() => session.currentIndex.value < props.test.questions.length - 1)
const shouldShowFeedback = computed(() => isPracticeMode.value && !!currentValue.value)

const handleSelect = (value: string | string[] | undefined) => {
  const questionId = session.currentQuestion.value?.id
  if (!questionId) return
  if (value === undefined) return
  session.selectAnswer(questionId, value)
}

/**
 * Temporarily stores quick-test attempts locally because backend endpoints for submissions are not ready yet.
 * TODO(tp-backend): replace localStorage fallback with real API persistence once available.
 */
const persistAttempt = (value: QuickTestResult) => {
  if (typeof window === "undefined") return
  const payload = {
    result: value,
    answers: session.answers.value,
    testId: props.test.id,
    savedAt: new Date().toISOString(),
  }
  window.localStorage.setItem(`tp_quicktest_${props.test.id}`, JSON.stringify(payload))
}

const handleSubmit = () => {
  result.value = session.submit()
  if (result.value) persistAttempt(result.value)
  emit("submit", result.value)
}

const handleRetry = () => {
  result.value = null
  session.reset()
}

watch(
  () => session.isFinished.value,
  (finished) => {
    if (finished && !result.value) {
      result.value = session.submit()
      if (result.value) persistAttempt(result.value)
      emit("submit", result.value)
    }
  },
)

const isTypingTarget = (event: KeyboardEvent) => {
  const target = event.target as HTMLElement | null
  if (!target) return false
  const tag = target.tagName
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    target.getAttribute("role") === "textbox" ||
    target.getAttribute("contenteditable") === "true"
  )
}

const handleShortcut = (event: KeyboardEvent) => {
  if (result.value || !session.currentQuestion.value) return
  if (isTypingTarget(event)) return

  const options = session.currentQuestion.value.options ?? []

  if (/^[1-5]$/.test(event.key)) {
    const index = Number(event.key) - 1
    const option = options[index]
    if (option) {
      event.preventDefault()
      handleSelect(option.id)
      if (!session.currentQuestion.value.kind?.includes("multiple")) {
        session.next()
      }
    }
  }

  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault()
    handleSubmit()
  }

  if (event.key === "Enter" && event.shiftKey) {
    event.preventDefault()
    if (canNext.value) session.next()
  }
}

onMounted(() => {
  window.addEventListener("keydown", handleShortcut)
})

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleShortcut)
})
</script>

<template>
  <div class="flex w-full flex-col items-center gap-4">
    <header class="flex w-full max-w-3xl flex-col gap-2">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-muted-foreground">Teste</p>
          <h2 class="text-2xl font-semibold text-foreground">{{ test.title }}</h2>
          <p v-if="test.summary" class="text-sm text-muted-foreground">{{ test.summary }}</p>
        </div>
        <StatusBadge :status="test.status" />
      </div>
      <div class="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Questao {{ session.currentIndex.value + 1 }} / {{ test.questions.length }}
        </span>
        <span v-if="session.timeLeft.value !== null">
          Tempo restante: {{ session.timeLeft.value }}s
        </span>
      </div>
      <Progress :model-value="session.progress.value * 100" />
    </header>

    <QuestionCard
      v-if="session.currentQuestion.value && !result"
      :question="session.currentQuestion.value"
      :value="currentValue"
      :show-feedback="shouldShowFeedback"
      @select="handleSelect"
    />

    <div v-if="!result" class="flex w-full max-w-3xl items-center justify-between gap-2">
      <div class="flex gap-2">
        <Button variant="outline" size="icon" :disabled="!canPrev" @click="session.prev">
          <ChevronLeft class="size-4" />
        </Button>
        <Button variant="outline" size="icon" :disabled="!canNext" @click="session.next">
          <ChevronRight class="size-4" />
        </Button>
      </div>
      <div class="flex gap-2">
        <Button variant="ghost" @click="handleRetry">Reiniciar</Button>
        <Button @click="handleSubmit">Enviar</Button>
      </div>
    </div>

    <ResultPanel v-else-if="result" :result="result" @retry="handleRetry" />
  </div>
</template>
