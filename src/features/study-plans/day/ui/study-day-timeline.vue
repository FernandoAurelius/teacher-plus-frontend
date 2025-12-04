<script setup lang="ts">
import type { StudyTask } from '@/entities/study-plan'
import { studyDayTransport } from '@/shared/lib/transport/studyDayTransport'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { CheckCircle2, Circle, Clock3, Sparkles, BookOpen } from 'lucide-vue-next'

const props = defineProps<{
  tasks: StudyTask[]
  activeTaskId?: string | null
}>()

const emit = defineEmits<{
  (e: 'focus', taskId: string): void
}>()

const taskTone = (task: StudyTask) => {
  const status = (task as any).status ?? 'pending'
  if (status === 'completed') return 'text-emerald-700 bg-emerald-50 border-emerald-200'
  if (status === 'in_progress') return 'text-primary bg-primary/10 border-primary/20'
  return 'text-slate-700 bg-white border-slate-200'
}

const taskIcon = (task: StudyTask) => {
  if (task.task_type === 'assessment' || task.task_type === 'practice') return Sparkles
  if (task.task_type === 'reading' || task.task_type === 'lesson') return BookOpen
  return Clock3
}

const handleFocus = (taskId: string) => {
  emit('focus', taskId)
  studyDayTransport.focusTask(taskId)
}
</script>

<template>
  <section class="rounded-3xl border border-white/40 bg-white/90 p-4 shadow-md dark:bg-slate-900/85 min-w-0">
    <div class="mb-3 flex items-center justify-between">
      <div>
        <p class="text-xs uppercase text-slate-500">Atividades do dia</p>
        <h2 class="text-lg font-semibold text-slate-900 dark:text-white">Revise antes de iniciar</h2>
      </div>
      <Badge variant="outline">{{ tasks.length }} itens</Badge>
    </div>

    <div v-if="!tasks.length" class="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-4 text-sm text-muted-foreground">
      Nenhuma atividade gerada para este dia.
    </div>

    <div v-else class="relative overflow-x-auto pb-4">
      <div class="flex min-w-full items-stretch gap-4 pr-6 snap-x snap-mandatory">
        <div
          v-for="(task, index) in tasks"
          :key="task.id"
          class="relative flex min-w-[260px] max-w-xs flex-col rounded-2xl border bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          :class="[
            taskTone(task),
            task.id === activeTaskId && 'ring-2 ring-primary/50 shadow-lg',
          ]"
          :style="{ scrollSnapAlign: 'start' }"
        >
          <div v-if="index < tasks.length - 1" class="absolute inset-y-1/2 -right-8 hidden h-px w-14 bg-gradient-to-r from-slate-200 via-primary/30 to-primary/50 md:block"></div>
          <div class="flex items-center gap-2">
            <component :is="taskIcon(task)" class="size-5" />
            <span class="text-xs uppercase text-slate-500">{{ task.task_type }}</span>
          </div>
          <h3 class="mt-2 line-clamp-2 text-base font-semibold text-slate-900 dark:text-white">
            {{ task.title }}
          </h3>
          <p class="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
            {{ task.description || 'Sem descricao' }}
          </p>
          <div class="mt-3 flex items-center gap-2 text-sm text-slate-500">
            <CheckCircle2 v-if="(task as any).status === 'completed'" class="size-4 text-emerald-600" />
            <Circle v-else class="size-4 text-slate-300" />
            <span>{{ (task as any).status ?? 'pending' }}</span>
          </div>
          <Button variant="secondary" size="sm" class="mt-4 w-full justify-center" @click="handleFocus(task.id)">
            Ver atividade
          </Button>
        </div>
      </div>
    </div>
  </section>
</template>
