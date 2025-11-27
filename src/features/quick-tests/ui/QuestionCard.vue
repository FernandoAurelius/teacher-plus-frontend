<script setup lang="ts">
import { computed } from "vue"

import type { QuickQuestion } from "../model/types"
import { Textarea } from "@/shared/ui/textarea"

const props = defineProps<{
  question: QuickQuestion
  value?: string | string[]
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
      :class="isSelected(option.id) ? 'border-primary bg-primary/10 text-primary' : 'hover:border-primary/50 hover:bg-muted/40'"
      type="button"
      @click="handleSelect(option.id)"
    >
      <span class="mt-1 grid h-6 w-6 place-content-center rounded-full border text-xs font-semibold"
        :class="isSelected(option.id) ? 'border-primary bg-primary text-primary-foreground' : 'border-muted text-muted-foreground'">
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
</div>
