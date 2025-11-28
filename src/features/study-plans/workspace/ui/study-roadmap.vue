<script setup lang="ts">
import type { StudyDay, StudyWeek } from "@/entities/study-plan"
import { StatusBadge } from "@/shared/ui/status-badge"

const props = defineProps<{
  weeks: StudyWeek[]
  activeDayId?: string | null
}>()

const emit = defineEmits<{
  (e: "select", dayId: string): void
}>()

const dayStateTone = (status: StudyDay["status"]) => {
  if (status === "completed") return "success"
  if (status === "in_progress") return "info"
  if (status === "ready") return "info"
  if (status === "blocked") return "danger"
  return "muted"
}
</script>

<template>
  <div class="space-y-12">
    <div
      v-for="week in weeks"
      :key="week.weekIndex"
      class="rounded-3xl border border-white/50 bg-white/90 p-6 shadow-lg dark:bg-slate-900/80"
    >
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs uppercase text-slate-500">Semana {{ week.weekIndex }}</p>
          <h3 class="text-lg font-semibold text-slate-900">{{ week.title || `Semana ${week.weekIndex}` }}</h3>
          <p class="text-sm text-muted-foreground">{{ week.summary }}</p>
        </div>
        <StatusBadge :status="(week.status as any) ?? 'pending'" />
      </div>

      <div class="relative mt-6">
        <div class="absolute left-1/2 top-0 h-full w-1 -translate-x-1/2 bg-gradient-to-b from-primary/30 via-primary/10 to-transparent"></div>
        <div class="flex flex-col gap-12">
          <div
            v-for="(day, index) in week.days"
            :key="day.id"
            class="relative"
          >
            <div
              class="absolute left-1/2 top-0 h-full w-px -translate-x-1/2"
              :class="index === week.days.length - 1 ? 'bg-transparent' : 'bg-primary/10'"
            ></div>
            <div
              class="flex items-center gap-4 transition-transform"
              :class="index % 2 === 0 ? '-translate-x-20' : 'translate-x-20'"
            >
              <button
                type="button"
                class="grid size-14 place-items-center rounded-full border-4 bg-white text-lg font-semibold shadow-lg transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                :class="[
                  day.id === activeDayId
                    ? 'border-primary text-primary'
                    : 'border-primary/30 text-slate-700',
                  dayStateTone(day.status) === 'success' && 'bg-emerald-50 border-emerald-300 text-emerald-700',
                  dayStateTone(day.status) === 'danger' && 'bg-red-50 border-red-300 text-red-700',
                ]"
                @click="emit('select', day.id)"
              >
                {{ day.day_index }}
              </button>
              <div
                class="flex-1 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm ring-1 ring-transparent transition hover:-translate-y-1 hover:shadow-md hover:ring-primary/20 dark:bg-slate-900/60"
              >
                <div class="flex items-center justify-between gap-2">
                  <div>
                    <p class="text-xs uppercase text-slate-500">Dia {{ day.day_index }}</p>
                    <h4 class="text-base font-semibold text-slate-900">{{ day.title }}</h4>
                  </div>
                  <StatusBadge :status="(day.status as any) ?? 'pending'" />
                </div>
                <p class="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {{ day.focus || 'Sem foco definido' }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
