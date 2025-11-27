<script setup lang="ts">
import { computed } from "vue"

import type { QuickQuestion } from "../model/types"
import { Textarea } from "@/shared/ui/textarea"

const props = defineProps<{
  question: QuickQuestion
  value?: string | string[]
  showFeedback?: boolean
}>()

const emit = defineEmits<{
  (e: "select", value: string | string[] | undefined): void
}>()

const isMultiple = computed(() => props.question.kind === "multiple_choice")
const isSelected = (optionId: string) => {
  if (Array.isArray(props.value)) return props.value.includes(optionId)
  return props.value === optionId
}

const options = computed(() => props.question.options ?? [])
const correctIds = computed(() => new Set(props.question.correctOptionIds ?? []))
const hasFeedback = computed(() => props.showFeedback && (!!props.value || Array.isArray(props.value)))

const optionState = (optionId: string) => {
  if (!hasFeedback.value) return "neutral"
  const correct = correctIds.value.has(optionId)
  const selected = isSelected(optionId)
  if (selected && correct) return "correct"
  if (selected && !correct) return "wrong"
  if (!selected && correct && props.question.kind !== "text") return "hint"
  return "neutral"
}

const handleSelect = (optionId: string) => {
  if (isMultiple.value) {
    const next = new Set(Array.isArray(props.value) ? props.value : [])
    if (next.has(optionId)) next.delete(optionId)
    else next.add(optionId)
    emit("select", Array.from(next))
    return
  }
  emit("select", optionId)
}

const handleText = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  emit("select", target.value)
}
</script>

<div class="w-full rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
  <p class="text-sm text-muted-foreground">Questao</p>
  <h3 class="mt-1 text-xl font-semibold text-foreground">{{ question.prompt }}</h3>

  <div v-if="question.kind !== 'text'" class="mt-4 grid gap-2">
    <button
      v-for="option in options"
      :key="option.id"
      class="flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors"
      :class="[
        optionState(option.id) === 'correct' && 'border-emerald-500 bg-emerald-50 text-emerald-700',
        optionState(option.id) === 'wrong' && 'border-red-500 bg-red-50 text-red-700',
        optionState(option.id) === 'hint' && 'border-primary/60 bg-primary/5 text-primary',
        optionState(option.id) === 'neutral' &&
          (isSelected(option.id)
            ? 'border-primary bg-primary/10 text-primary'
            : 'hover:border-primary/50 hover:bg-muted/40'),
      ]"
      type="button"
      @click="handleSelect(option.id)"
    >
      <span class="mt-1 grid h-6 w-6 place-content-center rounded-full border text-xs font-semibold"
        :class="[
          optionState(option.id) === 'correct' && 'border-emerald-500 bg-emerald-500 text-emerald-50',
          optionState(option.id) === 'wrong' && 'border-red-500 bg-red-500 text-white',
          optionState(option.id) === 'hint' && 'border-primary bg-primary text-primary-foreground',
          optionState(option.id) === 'neutral' &&
            (isSelected(option.id)
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-muted text-muted-foreground'),
        ]">
        {{ option.label.slice(0, 2).toUpperCase() }}
      </span>
      <span class="leading-relaxed text-foreground">{{ option.label }}</span>
    </button>
  </div>

  <div v-else class="mt-4">
    <Textarea
      :value="(value as string | undefined) ?? ''"
      placeholder="Digite sua resposta..."
      class="min-h-28"
      @input="handleText"
    />
  </div>

  <p v-if="question.explanation" class="mt-4 text-sm text-muted-foreground">
    Dica: {{ question.explanation }}
  </p>

  <p
    v-if="hasFeedback && question.correctOptionIds?.length"
    class="mt-2 text-sm font-medium text-emerald-700"
  >
    Modo treino: resposta correta {{ question.kind === 'multiple_choice' ? 'inclui' : 'é' }}:
    {{ question.correctOptionIds.join(", ") }}
  </p>
</div>
