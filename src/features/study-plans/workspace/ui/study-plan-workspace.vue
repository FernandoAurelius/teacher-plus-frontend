<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStudyPlanWorkspaceStore } from '../model/study-plan-workspace-store'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import Progress from '@/shared/ui/progress/Progress.vue'
import {
  ArrowLeft,
  CalendarDays,
  Sparkles,
  UploadCloud,
  AlertTriangle,
  PlusCircle,
  Clock,
  BookCopy,
} from 'lucide-vue-next'
import type { StudyTask } from '@/entities/study-plan'
import StudyTaskCard from './study-task-card.vue'
import StudyRoadmap from './study-roadmap.vue'

const store = useStudyPlanWorkspaceStore()
const route = useRoute()
const router = useRouter()

const planId = computed(() => route.params.planId as string | undefined)

onMounted(() => {
  if (planId.value) {
    void store.loadPlan(planId.value)
  }
})

watch(
  () => planId.value,
  (id) => {
    if (id) void store.loadPlan(id)
  },
  { immediate: false },
)

const handleUploadMaterial = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return
  const formData = new FormData()
  formData.append('file', input.files[0])
  if (store.plan?.title) {
    formData.append('title', store.plan.title)
  }
  void store.uploadMaterial(formData)
}

const taskIcon = (task: StudyTask) => {
  switch (task.task_type) {
    case 'lesson':
      return BookCopy
    case 'practice':
    case 'assessment':
      return Sparkles
    default:
      return Clock
  }
}

const handleTaskComplete = (task: StudyTask, payload: any) => {
  void store.updateTaskProgress(task.id, payload)
}
</script>

<template>
  <section class="relative min-h-screen pb-20">
    <div class="neo-blob neo-blob-1 animate-float-y" aria-hidden="true"></div>
    <div class="neo-blob neo-blob-3 animate-float-x" aria-hidden="true"></div>

    <div class="relative space-y-8">
      <header class="rounded-3xl border border-white/20 bg-white/80 px-6 py-6 shadow-xl backdrop-blur lg:px-10 dark:bg-slate-900/90">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div class="space-y-2">
            <Button variant="ghost" size="sm" class="-ml-2 text-slate-500" @click="router.push('/portal')">
              <ArrowLeft class="size-4" />
              Voltar
            </Button>
            <div class="flex flex-wrap items-center gap-3">
              <h1 class="font-display text-3xl font-semibold text-slate-900 dark:text-white">
                {{ store.plan?.title || 'Carregando plano...' }}
              </h1>
              <Badge variant="secondary">{{ store.plan?.status }}</Badge>
              <Badge v-if="store.plan?.generation_status" variant="outline">
                {{ store.plan?.generation_status }}
              </Badge>
            </div>
            <p class="max-w-2xl text-slate-600 dark:text-slate-300">{{ store.plan?.summary }}</p>
            <div class="flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <span class="inline-flex items-center gap-2">
                <CalendarDays class="size-4 text-primary" />
                {{ store.plan?.start_date || 'sem data' }} → {{ store.plan?.end_date || 'a definir' }}
              </span>
              <span>{{ store.plan?.total_days }} dias</span>
            </div>
          </div>
          <div class="flex flex-col gap-3 md:flex-row">
            <label class="inline-flex items-center gap-3 rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm">
              <UploadCloud class="size-5 text-primary" />
              <div>
                <p class="font-medium text-slate-700">Enviar material</p>
                <p class="text-xs text-slate-500">PDF, slides, textos</p>
              </div>
              <input type="file" class="hidden" accept=".pdf,.doc,.docx,.txt" @change="handleUploadMaterial" />
            </label>
            <Button class="gap-2" :disabled="!store.jobState.jobId" @click="store.refreshJob">
              <Sparkles class="size-5" />
              Atualizar status
            </Button>
          </div>
        </div>

        <div v-if="store.jobState.status === 'running'" class="mt-6 rounded-2xl border border-primary/30 bg-primary/5 p-4">
          <div class="flex items-center justify-between text-sm text-primary">
            <span>Job em execução</span>
            <span>#{{ store.jobState.jobId?.slice(0, 6) }}</span>
          </div>
          <Progress :model-value="60" class="mt-2 h-1.5" />
          <p class="mt-2 text-xs text-primary/80">{{ store.jobState.message }}</p>
        </div>
        <div
          v-else-if="store.isPlanGenerating"
          class="mt-6 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800"
        >
          <Sparkles class="size-5" />
          <div class="text-sm">
            <p class="font-semibold">Plano em geração</p>
            <p class="text-xs text-amber-700">
              Assim que o job concluir atualizaremos automaticamente. Você pode permanecer nesta tela.
            </p>
          </div>
        </div>

        <div
          v-if="store.errorMessage"
          class="mt-4 flex items-center gap-2 rounded-2xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-destructive"
        >
          <AlertTriangle class="size-5" />
          <p>{{ store.errorMessage }}</p>
        </div>
      </header>

      <div class="space-y-6">
        <div class="rounded-3xl border border-white/40 bg-white/70 p-5 shadow-lg dark:bg-slate-900/70">
          <p class="text-xs uppercase text-slate-500">Roadmap</p>
          <p class="text-sm text-muted-foreground">Arraste e clique nos dias para abrir as tarefas.</p>
        </div>

        <StudyRoadmap
          :weeks="store.weeks"
          :active-day-id="store.activeDayId"
          @select="store.selectDay"
        />

        <div class="rounded-3xl border border-white/50 bg-white/90 p-6 shadow-lg dark:bg-slate-900/80">
          <div class="flex flex-wrap items-center gap-3 border-b border-dashed border-slate-200 pb-4">
            <div class="flex flex-col">
              <p class="text-xs uppercase text-slate-500">Dia selecionado</p>
              <h3 class="text-xl font-semibold">{{ store.activeDay?.title ?? 'Escolha um dia' }}</h3>
              <p class="text-sm text-muted-foreground">{{ store.activeDay?.focus }}</p>
            </div>
            <div class="ml-auto flex flex-wrap items-center gap-2 text-xs">
              <Badge variant="secondary">{{ store.activeDay?.status ?? 'pending' }}</Badge>
              <span v-if="store.activeDay" class="rounded-full bg-slate-100 px-3 py-1 text-slate-500">
                {{ store.activeDay.target_minutes }} min
              </span>
              <Button
                v-if="store.activeDay"
                size="sm"
                variant="outline"
                :disabled="store.extendingDayId === store.activeDay.id"
                @click="store.extendDay(store.activeDay)"
              >
                <PlusCircle class="size-4" />
                {{ store.extendingDayId === store.activeDay.id ? 'Solicitando...' : 'Expandir dia' }}
              </Button>
              <Button
                v-if="store.activeDay"
                size="sm"
                variant="ghost"
                :disabled="store.generatingDayId === store.activeDay.id"
                @click="store.generateDay(store.activeDay.id)"
              >
                {{ store.generatingDayId === store.activeDay.id ? 'Gerando...' : 'Gerar dia' }}
              </Button>
            </div>
          </div>

          <div v-if="store.activeDay" class="mt-4 space-y-3">
            <StudyTaskCard
              v-for="task in store.activeDay.tasks"
              :key="task.id"
              :task="task"
              :content="store.taskContent(task)"
              :updating="store.updatingTaskId === task.id"
              @complete="(payload) => handleTaskComplete(task, payload)"
            />
          </div>
          <p v-else class="mt-4 text-sm text-muted-foreground">Selecione um dia para ver as atividades.</p>
        </div>
      </div>
    </div>
  </section>
</template>
