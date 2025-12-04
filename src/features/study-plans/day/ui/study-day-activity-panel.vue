<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { StudyDay, StudyTask } from '@/entities/study-plan'
import { parseTaskContent } from '@/entities/study-plan'
import {
  buildFlashcardPayload,
  buildQuickTestPayload,
  mapTaskToFlashcardDeck,
  mapTaskToQuickTest,
  mapTaskToReadingItem,
} from '@/features/study-plans/workspace/lib/mapTaskContent'
import { FlashcardSession } from '@/features/flashcards'
import type { FlashcardSessionSnapshot } from '@/features/flashcards'
import { QuickTestRunner } from '@/features/quick-tests'
import type { QuickTestResult } from '@/features/quick-tests'
import { ReadingBlock } from '@/features/readings'
import { Button } from '@/shared/ui/button'
import { StatusBadge } from '@/shared/ui/status-badge'
import { studyDayTransport } from '@/shared/lib/transport/studyDayTransport'

const props = defineProps<{
  day: StudyDay | null
  tasks: StudyTask[]
  activeTaskId?: string | null
  updatingTaskId?: string | null
}>()

const emit = defineEmits<{
  (e: 'complete', task: StudyTask, payload: any): void
  (e: 'set-active', taskId: string): void
}>()

const taskRefs = ref<Record<string, HTMLElement | null>>({})

const registerTaskRef = (taskId: string) => (el: HTMLElement | null) => {
  if (el) taskRefs.value[taskId] = el
}

const selectedTask = computed<StudyTask | null>(() => {
  if (props.activeTaskId) {
    return props.tasks.find((task) => task.id === props.activeTaskId) ?? props.tasks[0] ?? null
  }
  return props.tasks[0] ?? null
})

const scrollToTask = (taskId: string) => {
  emit('set-active', taskId)
  nextTick(() => {
    const target = taskRefs.value[taskId]
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' })
  })
}

let unsubscribe: (() => void) | null = null

onMounted(() => {
  unsubscribe = studyDayTransport.onFocus(({ taskId }) => scrollToTask(taskId))
})

onBeforeUnmount(() => {
  unsubscribe?.()
})

watch(
  () => props.activeTaskId,
  (taskId) => {
    if (taskId) scrollToTask(taskId)
  },
)

const handleFlashcardsComplete = (task: StudyTask, snapshot: FlashcardSessionSnapshot) => {
  emit('complete', task, buildFlashcardPayload(snapshot))
}

const handleQuickTestSubmit = (task: StudyTask, result: QuickTestResult) => {
  if (!result) {
    console.warn('Quick test retornou resultado vazio', task.id)
    return
  }
  emit('complete', task, buildQuickTestPayload(result))
}

const handleReadingDone = (task: StudyTask) => {
  emit('complete', task, { status: 'completed' })
}

const taskStatusLabel = (task: StudyTask) => (task as any).status ?? 'pending'

const contentFor = (task: StudyTask) => parseTaskContent(task)
</script>

<template>
  <section class="rounded-3xl border border-white/40 bg-white/95 p-4 shadow-lg dark:bg-slate-900/90 min-w-0">
    <div class="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
      <div>
        <p class="text-xs uppercase text-slate-500">Execucao</p>
        <h2 class="text-lg font-semibold text-slate-900 dark:text-white">{{ day?.title ?? 'Atividades' }}</h2>
      </div>
      <StatusBadge :status="(day?.status as any) ?? 'pending'" />
    </div>

    <div v-if="!selectedTask" class="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white/70 p-4 text-sm text-muted-foreground">
      Nenhuma tarefa selecionada.
    </div>

    <div
      v-else
      :ref="registerTaskRef(selectedTask.id)"
      class="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ring-1 ring-transparent transition hover:ring-primary/20 dark:border-slate-800 dark:bg-slate-900"
      :class="selectedTask.id === activeTaskId ? 'ring-primary/40 shadow-md' : ''"
    >
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="min-w-0">
          <p class="text-xs uppercase text-slate-500">{{ selectedTask.task_type }}</p>
          <p class="text-lg font-semibold text-slate-900 dark:text-white">{{ selectedTask.title }}</p>
          <p class="text-sm text-slate-600 dark:text-slate-300">{{ selectedTask.description }}</p>
        </div>
        <div class="flex items-center gap-2">
          <StatusBadge :status="(selectedTask as any).status ?? 'pending'" />
          <Button variant="ghost" size="sm" @click="scrollToTask(selectedTask.id)">Dar foco</Button>
        </div>
      </div>

      <div class="mt-3">
        <FlashcardSession
          v-if="contentFor(selectedTask).kind === 'flashcards'"
          :deck="mapTaskToFlashcardDeck(selectedTask, contentFor(selectedTask))"
          @complete="(snapshot) => handleFlashcardsComplete(selectedTask, snapshot)"
        />

        <QuickTestRunner
          v-else-if="contentFor(selectedTask).kind === 'assessment'"
          :test="mapTaskToQuickTest(selectedTask, contentFor(selectedTask))"
          mode="practice"
          @submit="(result) => handleQuickTestSubmit(selectedTask, result)"
        />

        <ReadingBlock
          v-else-if="contentFor(selectedTask).kind === 'reading'"
          :item="mapTaskToReadingItem(selectedTask, contentFor(selectedTask))"
          :auto-persist="false"
          @mark-done="() => handleReadingDone(selectedTask)"
        />

        <div v-else class="space-y-2 rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/50">
          <p class="font-semibold text-slate-800 dark:text-white">Conteudo generico</p>
          <p>{{ selectedTask.description || 'Sem detalhes adicionais' }}</p>
          <Button
            variant="secondary"
            size="sm"
            class="mt-2"
            :disabled="updatingTaskId === selectedTask.id"
            @click="emit('complete', selectedTask, { status: 'completed' })"
          >
            {{ updatingTaskId === selectedTask.id ? 'Salvando...' : 'Marcar concluido' }}
          </Button>
        </div>
      </div>

      <div class="mt-3 flex items-center justify-between text-xs text-slate-500">
        <span>Status: {{ taskStatusLabel(selectedTask) }}</span>
        <Button
          variant="outline"
          size="xs"
          :disabled="updatingTaskId === selectedTask.id"
          @click="emit('complete', selectedTask, { status: 'completed' })"
        >
          {{ updatingTaskId === selectedTask.id ? 'Salvando...' : 'Concluir' }}
        </Button>
      </div>
    </div>
  </section>
</template>
