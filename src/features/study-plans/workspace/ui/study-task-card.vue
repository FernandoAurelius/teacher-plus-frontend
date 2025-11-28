<script setup lang="ts">
import { computed, ref } from 'vue'

import { mapTaskToFlashcardDeck, mapTaskToQuickTest, mapTaskToReadingItem, buildFlashcardPayload, buildQuickTestPayload } from '../lib/mapTaskContent'
import type { StudyTask } from '@/entities/study-plan'
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
