<script setup lang="ts">
import { computed, ref } from 'vue'

import { mapTaskToFlashcardDeck, mapTaskToQuickTest, mapTaskToReadingItem, buildFlashcardPayload, buildQuickTestPayload } from '../lib/mapTaskContent'
import type { LessonContent, StudyTask } from '@/entities/study-plan'
import { parseTaskContent } from '@/entities/study-plan'
import { FlashcardSession } from '@/features/flashcards'
import type { FlashcardSessionSnapshot } from '@/features/flashcards'
import { QuickTestRunner } from '@/features/quick-tests'
import type { QuickTestResult } from '@/features/quick-tests'
import { ReadingBlock } from '@/features/readings'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { StatusBadge } from '@/shared/ui/status-badge'

const props = defineProps<{
  task: StudyTask
  content: ReturnType<typeof parseTaskContent>
  updating?: boolean
}>()

const emit = defineEmits<{
  (e: 'complete', payload: { status: 'pending' | 'ready' | 'in_progress' | 'completed'; minutes_spent?: number; notes?: string; payload?: Record<string, unknown> }): void
}>()

const kind = computed(() => props.content.kind)
const flashcardsOpen = ref(false)

const flashcardDeck = computed(() => mapTaskToFlashcardDeck(props.task, props.content))
const quickTest = computed(() => mapTaskToQuickTest(props.task, props.content))
const readingItem = computed(() => mapTaskToReadingItem(props.task, props.content))
const lessonContent = computed<LessonContent | null>(() => (props.content.kind === 'lesson' ? props.content.data : null))
const lessonMeta = computed(() => {
  const metadata = (props.task.metadata ?? {}) as Record<string, any>
  return {
    difficulty: props.task.difficulty ?? metadata.difficulty ?? null,
    researchNeeded: props.task.research_needed ?? metadata.research_needed ?? null,
    assessmentTarget: metadata.assessment_target as string | undefined,
  }
})

const handleFlashcardsComplete = (snapshot: FlashcardSessionSnapshot) => {
  emit('complete', buildFlashcardPayload(snapshot))
}

const handleQuickTestSubmit = (result: QuickTestResult) => {
  emit('complete', buildQuickTestPayload(result))
}

const handleReadingDone = () => {
  emit('complete', { status: 'completed', minutes_spent: readingItem.value.estimateMinutes ?? 5 })
}
</script>

<template>
  <article class="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-inner dark:bg-slate-900/60">
    <header class="flex items-center gap-3">
      <div>
        <p class="text-sm font-semibold">{{ task.title }}</p>
        <p class="text-xs text-muted-foreground">{{ task.task_type }}</p>
      </div>
      <span class="ml-auto rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">{{
        task.duration_minutes
      }}min</span>
      <StatusBadge :status="(task.status as any) ?? 'pending'" />
    </header>

    <p v-if="task.description" class="text-sm text-muted-foreground">{{ task.description }}</p>

    <div v-if="kind === 'flashcards'" class="space-y-3">
      <p class="text-sm text-muted-foreground">
        Treine este deck de {{ flashcardDeck.items.length }} cartas em tela cheia.
      </p>
      <Button variant="secondary" @click="flashcardsOpen = true">Abrir flashcards</Button>

      <Dialog v-model:open="flashcardsOpen">
        <DialogContent class="w-[96vw] max-w-5xl space-y-4">
          <DialogHeader>
            <DialogTitle>{{ flashcardDeck.title }}</DialogTitle>
            <DialogDescription class="sr-only">
              Sessao de flashcards em tela cheia
            </DialogDescription>
          </DialogHeader>
          <FlashcardSession
            :deck="flashcardDeck"
            @complete="handleFlashcardsComplete"
          />
        </DialogContent>
      </Dialog>
    </div>

    <QuickTestRunner
      v-else-if="kind === 'assessment'"
      :test="quickTest"
      @submit="handleQuickTestSubmit"
    />

    <ReadingBlock
      v-else-if="kind === 'reading'"
      :item="readingItem"
      @mark-done="handleReadingDone"
    />

    <div
      v-else-if="kind === 'lesson'"
      class="space-y-3 rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 text-sm leading-relaxed text-slate-800 shadow-inner dark:border-slate-800/80 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800"
    >
      <div class="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
        <span class="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-100 dark:ring-emerald-800">
          Licao
        </span>
        <span v-if="lessonMeta.difficulty" class="rounded-full bg-indigo-50 px-3 py-1 text-indigo-700 ring-1 ring-indigo-100 dark:bg-indigo-900/40 dark:text-indigo-100 dark:ring-indigo-800">
          Dificuldade {{ lessonMeta.difficulty }}
        </span>
        <span v-if="lessonMeta.researchNeeded" class="rounded-full bg-amber-50 px-3 py-1 text-amber-700 ring-1 ring-amber-100 dark:bg-amber-900/40 dark:text-amber-100 dark:ring-amber-800">
          Requer pesquisa
        </span>
        <span v-if="lessonMeta.assessmentTarget" class="rounded-full bg-sky-50 px-3 py-1 text-sky-700 ring-1 ring-sky-100 dark:bg-sky-900/40 dark:text-sky-100 dark:ring-sky-800">
          Foco: {{ lessonMeta.assessmentTarget }}
        </span>
      </div>

      <p v-if="lessonContent?.summary" class="text-sm text-slate-700 dark:text-slate-200">
        {{ lessonContent.summary }}
      </p>

      <div class="rounded-xl border border-slate-200 bg-white/90 p-4 text-slate-800 shadow-inner ring-1 ring-white/70 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100 dark:ring-slate-800">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">Corpo da licao</p>
        <p class="mt-2 whitespace-pre-line text-sm leading-relaxed">
          {{ lessonContent?.body || task.description }}
        </p>
      </div>

      <div v-if="lessonContent?.key_points?.length" class="space-y-1">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">Pontos-chave</p>
        <ul class="list-disc space-y-1 pl-4 text-sm text-slate-700 dark:text-slate-200">
          <li v-for="(point, index) in lessonContent.key_points" :key="index">{{ point }}</li>
        </ul>
      </div>

      <div v-if="lessonContent?.source_refs?.length" class="space-y-2">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">Referencias</p>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="(ref, idx) in lessonContent.source_refs"
            :key="idx"
            class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700"
          >
            {{ ref }}
          </span>
        </div>
      </div>
    </div>

    <div v-else class="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-3 text-sm text-slate-600">
      <p class="font-semibold text-slate-700">Conteudo generico</p>
      <p class="text-xs text-slate-500">Este tipo de tarefa ainda nao tem visualizacao dedicada.</p>
    </div>

    <div class="flex justify-end">
      <Button size="sm" :disabled="props.updating" @click="emit('complete', { status: 'completed' })">
        Marcar concluido
      </Button>
    </div>
  </article>
</template>
