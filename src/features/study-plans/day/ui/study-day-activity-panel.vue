<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { LessonContent, StudyDay, StudyTask } from '@/entities/study-plan'
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
const selectedContent = computed<ReturnType<typeof parseTaskContent> | null>(() =>
  selectedTask.value ? contentFor(selectedTask.value) : null,
)
const selectedLessonContent = computed<LessonContent | null>(() =>
  selectedContent.value?.kind === 'lesson' ? selectedContent.value.data : null,
)
const selectedLessonMeta = computed(() => {
  const task = selectedTask.value
  const metadata = (task?.metadata ?? {}) as Record<string, any>
  return {
    difficulty: task?.difficulty ?? metadata.difficulty ?? null,
    researchNeeded: task?.research_needed ?? metadata.research_needed ?? null,
    assessmentTarget: metadata.assessment_target as string | undefined,
  }
})
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
          v-if="selectedTask && selectedContent?.kind === 'flashcards'"
          :deck="mapTaskToFlashcardDeck(selectedTask, selectedContent)"
          @complete="(snapshot) => handleFlashcardsComplete(selectedTask, snapshot)"
        />

        <QuickTestRunner
          v-else-if="selectedTask && selectedContent?.kind === 'assessment'"
          :test="mapTaskToQuickTest(selectedTask, selectedContent)"
          mode="practice"
          @submit="(result) => handleQuickTestSubmit(selectedTask, result)"
        />

        <ReadingBlock
          v-else-if="selectedTask && selectedContent?.kind === 'reading'"
          :item="mapTaskToReadingItem(selectedTask, selectedContent)"
          :auto-persist="false"
          @mark-done="() => handleReadingDone(selectedTask)"
        />

        <div
          v-else-if="selectedLessonContent"
          class="space-y-3 rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 text-sm leading-relaxed text-slate-800 shadow-inner dark:border-slate-800/80 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 dark:text-slate-100"
        >
          <div class="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <span class="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-100 dark:ring-emerald-800">
              Lição
            </span>
            <span v-if="selectedLessonMeta.difficulty" class="rounded-full bg-indigo-50 px-3 py-1 text-indigo-700 ring-1 ring-indigo-100 dark:bg-indigo-900/40 dark:text-indigo-100 dark:ring-indigo-800">
              Dificuldade {{ selectedLessonMeta.difficulty }}
            </span>
            <span v-if="selectedLessonMeta.researchNeeded" class="rounded-full bg-amber-50 px-3 py-1 text-amber-700 ring-1 ring-amber-100 dark:bg-amber-900/40 dark:text-amber-100 dark:ring-amber-800">
              Requer pesquisa
            </span>
            <span v-if="selectedLessonMeta.assessmentTarget" class="rounded-full bg-sky-50 px-3 py-1 text-sky-700 ring-1 ring-sky-100 dark:bg-sky-900/40 dark:text-sky-100 dark:ring-sky-800">
              Foco: {{ selectedLessonMeta.assessmentTarget }}
            </span>
          </div>

          <p v-if="selectedLessonContent.summary" class="text-sm text-slate-700 dark:text-slate-200">
            {{ selectedLessonContent.summary }}
          </p>

          <div class="rounded-xl border border-slate-200 bg-white/90 p-4 text-slate-800 shadow-inner ring-1 ring-white/70 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100 dark:ring-slate-800">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">Corpo da lição</p>
            <p class="mt-2 whitespace-pre-line text-sm leading-relaxed">
              {{ selectedLessonContent.body || selectedTask.description }}
            </p>
          </div>

          <div v-if="selectedLessonContent.key_points?.length" class="space-y-1">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">Pontos-chave</p>
            <ul class="list-disc space-y-1 pl-4 text-sm text-slate-700 dark:text-slate-200">
              <li v-for="(point, index) in selectedLessonContent.key_points" :key="index">{{ point }}</li>
            </ul>
          </div>

          <div v-if="selectedLessonContent.source_refs?.length" class="space-y-2">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">Referencias</p>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="(ref, idx) in selectedLessonContent.source_refs"
                :key="idx"
                class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700"
              >
                {{ ref }}
              </span>
            </div>
          </div>
        </div>

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
          size="lg"
          :disabled="updatingTaskId === selectedTask.id"
          @click="emit('complete', selectedTask, { status: 'completed' })"
        >
          {{ updatingTaskId === selectedTask.id ? 'Salvando...' : 'Concluir' }}
        </Button>
      </div>
    </div>
  </section>
</template>
