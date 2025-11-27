<script setup lang="ts">
import { computed } from "vue"
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-vue-next"

import type { FlashcardDifficulty } from "../model/types"
import { Button } from "@/shared/ui/button"
import { Progress } from "@/shared/ui/progress"

const props = defineProps<{
  canPrev: boolean
  canNext: boolean
  progress: number
}>()

const emit = defineEmits<{
  (e: "prev"): void
  (e: "next"): void
  (e: "flip"): void
  (e: "answer", value: FlashcardDifficulty): void
  (e: "reset"): void
}>()

const progressValue = computed(() => Math.round(props.progress * 100))
</script>

<div class="w-full max-w-2xl rounded-xl border bg-card p-4 text-card-foreground shadow-sm">
  <div class="flex items-center justify-between gap-3">
    <div class="flex items-center gap-2">
      <Button variant="outline" size="icon" :disabled="!props.canPrev" @click="emit('prev')">
        <ChevronLeft class="size-4" />
      </Button>
      <Button variant="outline" size="icon" :disabled="!props.canNext" @click="emit('next')">
        <ChevronRight class="size-4" />
      </Button>
      <Button variant="ghost" size="sm" @click="emit('flip')">Virar carta</Button>
    </div>
    <div class="flex items-center gap-2 text-sm text-muted-foreground">
      <span class="font-semibold text-foreground">{{ progressValue }}%</span>
      <span>progresso</span>
    </div>
  </div>

  <div class="mt-3">
    <Progress :model-value="progressValue" />
  </div>

  <div class="mt-4 flex flex-wrap gap-2">
    <Button variant="secondary" @click="emit('answer', 'easy')">Lembrar</Button>
    <Button variant="outline" @click="emit('answer', 'medium')">Quase</Button>
    <Button variant="outline" @click="emit('answer', 'hard')">Dificil</Button>
    <Button variant="ghost" @click="emit('answer', 'skipped')">Pular</Button>
    <Button variant="ghost" size="sm" class="ml-auto" @click="emit('reset')">
      <RotateCcw class="size-4" />
      Reiniciar sessao
    </Button>
  </div>
</div>
