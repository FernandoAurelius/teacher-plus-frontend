<script setup lang="ts">
import type { StudyPlanSummary } from '@/entities/study-plan'
import { getPlanStatusBadge } from '@/entities/study-plan'
import { computed } from 'vue'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Calendar, ArrowRight } from 'lucide-vue-next'

const props = defineProps<{
  plan: StudyPlanSummary
}>()

const emits = defineEmits<{
  (e: 'open', id: string): void
}>()

const badge = computed(() => getPlanStatusBadge(props.plan))
</script>

<template>
  <article
    class="group flex flex-col justify-between rounded-2xl border border-border/70 bg-white/80 p-5 shadow-md shadow-slate-200/70 ring-1 ring-transparent transition hover:-translate-y-1 hover:border-primary/60 hover:shadow-lg hover:ring-primary/20 dark:bg-slate-900/80 dark:border-slate-800"
  >
    <div class="space-y-3">
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="text-xs uppercase tracking-wide text-muted-foreground">Plano</p>
          <h3 class="font-semibold text-lg text-foreground">{{ plan.title }}</h3>
        </div>
        <Badge
          :variant="badge.tone === 'destructive' ? 'destructive' : badge.tone === 'success' ? 'default' : 'secondary'"
          class="text-xs"
        >
          {{ badge.label }}
        </Badge>
      </div>

      <p class="text-sm text-muted-foreground line-clamp-2">
        {{ plan.summary || 'Sem resumo disponível.' }}
      </p>

      <div class="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span class="inline-flex items-center gap-1">
          <Calendar class="size-3.5 text-primary" />
          {{ plan.current_week }}
        </span>
        <span>{{ plan.total_days }} dias</span>
        <span>ID {{ plan.id.slice(0, 8) }}...</span>
      </div>

      <p
        v-if="plan.last_error"
        class="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
      >
        {{ plan.last_error }}
      </p>
    </div>

    <footer class="mt-4 flex items-center justify-between gap-3">
      <div class="text-xs text-muted-foreground">
        Atualizado em {{ new Date(plan.updated_at).toLocaleDateString() }}
      </div>
      <Button size="sm" class="ml-auto" @click="emits('open', plan.id)">
        Abrir plano
        <ArrowRight class="size-4" />
      </Button>
    </footer>
  </article>
</template>
