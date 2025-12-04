<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import StudyDayHero from './study-day-hero.vue'
import StudyDayTimeline from './study-day-timeline.vue'
import StudyDayActivityPanel from './study-day-activity-panel.vue'
import { useStudyPlanWorkspaceStore } from '@/features/study-plans/workspace/model/study-plan-workspace-store'
import { usePomodoroTimer } from '../lib/usePomodoroTimer'
import { Loader2, AlertTriangle, ArrowLeft } from 'lucide-vue-next'
import { Button } from '@/shared/ui/button'
import { StatusBadge } from '@/shared/ui/status-badge'
import { toast } from 'vue-sonner'

const store = useStudyPlanWorkspaceStore()
const route = useRoute()
const router = useRouter()

const planId = computed(() => route.params.planId as string | undefined)
const dayId = computed(() => route.params.dayId as string | undefined)

const { state: pomodoro, displayTime, toggle, reset } = usePomodoroTimer(dayId)

const progressPercent = computed(() => {
  const tasks = store.activeTasks
  if (!tasks.length) return 0
  const completed = tasks.filter((task: any) => task.status === 'completed').length
  return Math.round((completed / tasks.length) * 100)
})

const loadData = async () => {
  if (!planId.value || !dayId.value) {
    router.push('/portal')
    return
  }
  await store.loadDay(planId.value, dayId.value)
}

onMounted(() => {
  void loadData()
})

watch(
  () => [planId.value, dayId.value],
  () => {
    void loadData()
  },
)

const handleFocusTask = (taskId: string) => {
  store.setActiveTask(taskId)
}

const handleCompleteTask = (task: any, payload: any) => {
  if (!payload?.status) {
    console.warn('Payload sem status ao completar tarefa', payload)
    toast.error('N�o foi poss�vel salvar: status ausente.')
    return
  }
  void store.updateTaskProgress(task.id, payload)
}

const goBack = () => router.push(`/portal/${planId.value ?? ''}`)
</script>

<template>
  <section class="relative min-h-screen overflow-x-hidden pb-16">
    <div class="neo-blob neo-blob-1 animate-float-y" aria-hidden="true"></div>
    <div class="neo-blob neo-blob-3 animate-float-x" aria-hidden="true"></div>

    <div class="relative mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
      <div class="flex items-center justify-between">
        <Button variant="ghost" size="sm" class="-ml-2" @click="goBack">
          <ArrowLeft class="size-4" />
          Voltar
        </Button>
        <div class="flex items-center gap-2 text-sm text-slate-500">
          <StatusBadge :status="(store.activeDay?.status as any) ?? 'pending'" />
          <span>Progresso: {{ progressPercent }}%</span>
        </div>
      </div>

      <StudyDayHero
        :plan="store.plan"
        :day="store.activeDay"
        :pomodoro="pomodoro"
        :display-time="displayTime"
        @toggle-timer="toggle"
        @reset-timer="() => reset()"
      />

      <div v-if="store.loading" class="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm text-slate-600">
        <Loader2 class="size-4 animate-spin" />
        Carregando dia...
      </div>

      <div v-else-if="!store.activeDay" class="rounded-2xl border border-dashed border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        <div class="flex items-center gap-2">
          <AlertTriangle class="size-4" />
          Dia nao encontrado para este plano. Volte ao portal e selecione outro dia.
        </div>
      </div>

      <div v-else class="flex flex-col gap-6">
        <StudyDayTimeline
          :tasks="store.activeTasks"
          :active-task-id="store.activeTaskId"
          class="min-w-0"
          @focus="handleFocusTask"
        />
        <StudyDayActivityPanel
          :day="store.activeDay"
          :tasks="store.activeTasks"
          :active-task-id="store.activeTaskId"
          :updating-task-id="store.updatingTaskId"
          class="min-w-0"
          @set-active="handleFocusTask"
          @complete="(task, payload) => handleCompleteTask(task, payload)"
        />
      </div>
    </div>
  </section>
</template>
