<script setup lang="ts">
import type { StudyDay, StudyPlan } from '@/entities/study-plan'
import { StatusBadge } from '@/shared/ui/status-badge'
import { Button } from '@/shared/ui/button'
import { Clock3, RotateCcw, TimerReset } from 'lucide-vue-next'
import type { PomodoroState } from '../lib/usePomodoroTimer'

const props = defineProps<{
  plan: StudyPlan | null
  day: StudyDay | null
  pomodoro: PomodoroState
  displayTime: string
}>()

const emit = defineEmits<{
  (e: 'toggle-timer'): void
  (e: 'reset-timer'): void
}>()
</script>

<template>
  <header class="relative overflow-hidden rounded-3xl border border-white/30 bg-white/90 p-6 shadow-lg backdrop-blur-lg dark:bg-slate-900/90">
    <div class="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent"></div>
    <div class="relative flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div class="space-y-3">
        <p class="text-xs uppercase text-slate-500">Dia de estudo</p>
        <div class="flex flex-wrap items-center gap-3">
          <h1 class="font-display text-3xl font-semibold text-slate-900 dark:text-white">
            {{ props.day?.title || 'Dia selecionado' }}
          </h1>
          <StatusBadge :status="(props.day?.status as any) ?? 'pending'" />
        </div>
        <p class="max-w-3xl text-base text-slate-600 dark:text-slate-300">
          {{ props.day?.focus || 'Revise as atividades do dia antes de iniciar.' }}
        </p>
        <div class="flex flex-wrap gap-4 text-sm text-slate-500">
          <span class="inline-flex items-center gap-2 rounded-full border border-slate-200/70 px-3 py-1 dark:border-slate-700/70">
            <Clock3 class="size-4 text-primary" />
            Plano: {{ props.plan?.title ?? 'sem plano' }}
          </span>
          <span class="inline-flex items-center gap-2 rounded-full border border-slate-200/70 px-3 py-1 dark:border-slate-700/70">
            Atividades: {{ props.day?.tasks?.length ?? 0 }}
          </span>
        </div>
      </div>

      <div class="flex items-center gap-3 rounded-2xl border border-slate-200/60 bg-white/90 px-4 py-3 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/80">
        <div class="flex flex-col text-right">
          <span class="text-xs font-semibold uppercase text-slate-500">Pomodoro</span>
          <span class="font-mono text-2xl font-semibold text-slate-900 dark:text-white">{{ displayTime }}</span>
          <span class="text-xs text-slate-500">{{ pomodoro.mode === 'focus' ? 'Foco' : 'Pausa' }}</span>
        </div>
        <div class="flex flex-col gap-2">
          <Button size="sm" variant="ghost" class="justify-start" @click="emit('toggle-timer')">
            <TimerReset class="size-4" />
            {{ pomodoro.isRunning ? 'Pausar' : 'Iniciar' }}
          </Button>
          <Button size="sm" variant="outline" class="justify-start" @click="emit('reset-timer')">
            <RotateCcw class="size-4" />
            Resetar
          </Button>
        </div>
      </div>
    </div>
  </header>
</template>
