<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { ChevronLeft, ChevronRight } from "lucide-vue-next"

import QuestionCard from "./QuestionCard.vue"
import ResultPanel from "./ResultPanel.vue"
import type { QuickTest, QuickTestResult } from "../model/types"
import { useQuickTestSession } from "../model/useQuickTestSession"
import { Button } from "@/shared/ui/button"
import { Progress } from "@/shared/ui/progress"
import { StatusBadge } from "@/shared/ui/status-badge"

const props = defineProps<{
  test: QuickTest
}>()

const emit = defineEmits<{
  (e: "submit", result: QuickTestResult): void
}>()

const session = useQuickTestSession(props.test)
const result = ref<QuickTestResult | null>(null)

const currentValue = computed(() => {
  const questionId = session.currentQuestion.value?.id
  if (!questionId) return undefined
  return session.answers.value[questionId]
})

const canPrev = computed(() => session.currentIndex.value > 0)
const canNext = computed(() => session.currentIndex.value < props.test.questions.length - 1)

const handleSelect = (value: string | string[] | undefined) => {
  const questionId = session.currentQuestion.value?.id
  if (!questionId) return
  if (value === undefined) return
  session.selectAnswer(questionId, value)
}

const handleSubmit = () => {
  result.value = session.submit()
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
      emit("submit", result.value)
    }
  },
)
</script>

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
