<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue"
import { ChevronLeft, ChevronRight, X } from "lucide-vue-next"

import {
  buildFlashcardPayload,
  buildQuickTestPayload,
  mapTaskToFlashcardDeck,
  mapTaskToQuickTest,
  mapTaskToReadingItem,
} from "../lib/mapTaskContent"
import type { StudyDay, StudyTask } from "@/entities/study-plan"
import { parseTaskContent } from "@/entities/study-plan"
import { FlashcardSession } from "@/features/flashcards"
import type { FlashcardSessionSnapshot } from "@/features/flashcards"
import { QuickTestRunner } from "@/features/quick-tests"
import type { QuickTestResult } from "@/features/quick-tests"
import { ReadingBlock } from "@/features/readings"
import { Button } from "@/shared/ui/button"
import { Progress } from "@/shared/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog"
import { StatusBadge } from "@/shared/ui/status-badge"
import EditorNotes from "@/features/notes/ui/EditorNotes.vue"

const props = defineProps<{
  open: boolean
  day: StudyDay | null
}>()

const emit = defineEmits<{
  (e: "update:open", value: boolean): void
  (e: "complete", task: StudyTask, payload: any): void
}>()

const index = ref(0)
const isTimerRunning = ref(false)
const timerMode = ref<"focus" | "break">("focus")
const secondsLeft = ref(25 * 60)
let timerId: number | null = null

const tasks = computed(() => props.day?.tasks ?? [])
const total = computed(() => tasks.value.length)
const currentTask = computed(() => tasks.value[index.value])
const content = computed(() => (currentTask.value ? parseTaskContent(currentTask.value) : null))
const progressValue = computed(() =>
  total.value === 0 ? 0 : Math.round(((index.value + 1) / total.value) * 100),
)

const resetTimer = () => {
  timerMode.value = "focus"
  secondsLeft.value = 25 * 60
  isTimerRunning.value = false
  stopTimer()
}

const stopTimer = () => {
  if (timerId) {
    window.clearInterval(timerId)
    timerId = null
  }
}

const tick = () => {
  if (secondsLeft.value <= 0) {
    if (timerMode.value === "focus") {
      timerMode.value = "break"
      secondsLeft.value = 5 * 60
    } else {
      timerMode.value = "focus"
      secondsLeft.value = 25 * 60
    }
    return
  }
  secondsLeft.value -= 1
}

const toggleTimer = () => {
  if (isTimerRunning.value) {
    isTimerRunning.value = false
    stopTimer()
  } else {
    isTimerRunning.value = true
    stopTimer()
    timerId = window.setInterval(tick, 1000)
  }
}

watch(
  () => props.open,
  (open) => {
    if (!open) {
      stopTimer()
      isTimerRunning.value = false
      index.value = 0
      return
    }
    resetTimer()
  },
)

onBeforeUnmount(() => stopTimer())

const goPrev = () => {
  index.value = Math.max(0, index.value - 1)
}

const goNext = () => {
  index.value = Math.min(total.value - 1, index.value + 1)
}

const handleClose = () => emit("update:open", false)

const handleFlashcardsComplete = (snapshot: FlashcardSessionSnapshot) => {
  if (currentTask.value) emit("complete", currentTask.value, buildFlashcardPayload(snapshot))
}

const handleQuickTestSubmit = (result: QuickTestResult) => {
  if (currentTask.value) emit("complete", currentTask.value, buildQuickTestPayload(result))
}

const handleReadingDone = () => {
  if (currentTask.value) emit("complete", currentTask.value, { status: "completed" })
}

const formatTime = (value: number) => {
  const m = Math.floor(value / 60)
  const s = value % 60
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
}

watch(
  () => props.day?.id,
  () => {
    index.value = 0
  },
)

const lessonContent = computed(() => {
  if (content.value?.kind === "lesson") return content.value.data
  return null
})
const lessonDialogOpen = ref(false)
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent
      class="!w-[99vw] !max-w-[1700px] sm:!w-[94vw] md:!w-[92vw] min-h-[85vh] sm:min-h-[75vh] p-0 overflow-hidden">
      <div class="flex h-full flex-col bg-white">
        <div
          class="sticky top-0 z-10 flex flex-col gap-3 border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur md:px-6">
          <div class="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div class="space-y-1">
              <p class="text-xs uppercase text-muted-foreground">Dia</p>
              <DialogTitle class="text-2xl md:text-3xl">{{ day?.title ?? 'Dia selecionado' }}</DialogTitle>
              <DialogDescription class="text-sm md:text-base">{{ day?.focus }}</DialogDescription>
            </div>
            <div class="flex flex-col items-end gap-2 text-right">
              <StatusBadge :status="(day?.status as any) ?? 'pending'" />
              <div
                class="flex flex-wrap items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold md:text-sm">
                <span>{{ timerMode === 'focus' ? 'Foco' : 'Pausa' }}</span>
                <span class="font-mono">{{ formatTime(secondsLeft) }}</span>
                <Button size="sm" variant="ghost" @click="toggleTimer">
                  {{ isTimerRunning ? 'Pausar' : 'Iniciar' }}
                </Button>
              </div>
              <Button size="icon" variant="ghost" class="rounded-full" @click="handleClose">
                <X class="size-4" />
              </Button>
            </div>
          </div>
          <div class="flex items-center gap-3 text-sm text-muted-foreground">
            <span>{{ index + 1 }} / {{ total || 1 }}</span>
            <Progress :model-value="progressValue" class="flex-1" />
          </div>
        </div>

        <div class="relative flex-1 px-4 pb-6 pt-3 md:px-6">
          <div class="grid h-full grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-4
           md:grid-cols-[minmax(0,2.1fr)_minmax(0,1fr)] md:gap-6 md:p-6">
            <!-- Coluna esquerda: tarefa / conteúdo -->
            <div v-if="currentTask" class="flex w-full flex-col gap-4 md:gap-6">
              <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div class="space-y-1">
                  <p class="text-xs uppercase text-muted-foreground">{{ currentTask.task_type }}</p>
                  <p class="text-xl font-semibold text-foreground md:text-2xl">
                    {{ currentTask.title }}
                  </p>
                </div>
              </div>

              <div v-if="content?.kind === 'flashcards'" class="w-full">
                <FlashcardSession :deck="mapTaskToFlashcardDeck(currentTask, content)"
                  @complete="handleFlashcardsComplete" />
              </div>

              <QuickTestRunner v-else-if="content?.kind === 'assessment'"
                :test="mapTaskToQuickTest(currentTask, content)" mode="practice" @submit="handleQuickTestSubmit" />

              <ReadingBlock v-else-if="content?.kind === 'reading'" :item="mapTaskToReadingItem(currentTask, content)"
                :auto-persist="false" @mark-done="handleReadingDone" />

              <div v-else class="space-y-3">
                <div class="rounded-xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-600">
                  <p class="font-semibold text-slate-700">Conteúdo genérico</p>
                  <p>{{ currentTask.description }}</p>
                </div>
                <Button v-if="lessonContent" variant="outline" size="sm" @click="lessonDialogOpen = true">
                  Abrir leitura ampliada
                </Button>
              </div>
            </div>

            <p v-else class="text-sm text-muted-foreground">Nenhuma tarefa para este dia.</p>

            <!-- Coluna direita: anotações sempre presentes -->
            <div class="rounded-2xl border border-slate-200 bg-white p-3 md:p-4">
              <EditorNotes :storage-key="`tp_notes_${day?.id ?? 'unknown'}`" />
            </div>
          </div>

          <div class="pointer-events-none sticky bottom-4 left-0 right-0 flex justify-end pr-1 sm:pr-4">
            <div
              class="pointer-events-auto flex gap-2 rounded-full border border-slate-300 bg-white/95 px-2 py-1 shadow-sm">
              <Button variant="ghost" size="icon" :disabled="index === 0" @click="goPrev">
                <ChevronLeft class="size-4" />
              </Button>
              <Button variant="ghost" size="icon" :disabled="index >= total - 1" @click="goNext">
                <ChevronRight class="size-4" />
              </Button>
            </div>
          </div>
        </div>
        </div>

        <Dialog v-model:open="lessonDialogOpen">
          <DialogContent
            class="!w-[96vw] !max-w-[1100px] sm:!w-[94vw] sm:!max-w-[1360px] md:!w-[92vw] md:!max-w-[1480px] lg:!w-[90vw] lg:!max-w-[1680px] !max-h-[88vh] space-y-4 overflow-hidden"
          >
            <DialogHeader class="space-y-2">
              <DialogTitle>{{ currentTask?.title ?? 'Leitura' }}</DialogTitle>
              <DialogDescription>{{ currentTask?.description }}</DialogDescription>
            </DialogHeader>
            <div class="max-h-[calc(88vh-180px)] overflow-y-auto pr-1 sm:pr-2">
              <article class="prose prose-slate max-w-none text-base leading-relaxed">
                <p v-if="lessonContent?.summary">{{ lessonContent.summary }}</p>
                <p v-if="lessonContent?.body">{{ lessonContent.body }}</p>
                <ul v-if="lessonContent?.key_points?.length" class="mt-3 list-disc pl-5">
                  <li v-for="point in lessonContent.key_points" :key="point">{{ point }}</li>
                </ul>
                <div v-if="lessonContent?.source_refs?.length" class="mt-3 space-y-1 text-sm">
                  <p class="font-semibold">Referências</p>
                  <a
                    v-for="ref in lessonContent.source_refs"
                    :key="ref"
                    class="block text-primary underline"
                    :href="ref"
                    target="_blank"
                    rel="noreferrer"
                  >{{ ref }}</a>
                </div>
              </article>
            </div>
          </DialogContent>
        </Dialog>
    </DialogContent>
  </Dialog>
</template>
