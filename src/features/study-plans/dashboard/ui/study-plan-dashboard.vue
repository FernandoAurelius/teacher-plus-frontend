<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStudyPlanDashboardStore } from '../model/study-plan-dashboard-store'
import StudyPlanCard from './study-plan-card.vue'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/shared/ui/sheet'
import { Search, Filter, Plus, Loader2, NotebookText } from 'lucide-vue-next'

const store = useStudyPlanDashboardStore()
const router = useRouter()

const createForm = ref({ title: '', goal: '' })
const sheetOpen = ref(false)

onMounted(() => {
  if (!store.plans.length) {
    void store.loadPlans()
  }
})

const canSubmit = computed(() => createForm.value.title.length >= 3 || createForm.value.goal.length >= 10)

const handleCreatePlan = async () => {
  if (!canSubmit.value) return
  const id = await store.createPlan({
    title: createForm.value.title || undefined,
    goal_override: createForm.value.goal || undefined,
  })
  if (id) {
    sheetOpen.value = false
    router.push(`/portal/${id}`)
  }
}

const handleOpenPlan = (id: string) => {
  router.push(`/portal/${id}`)
}
</script>

<template>
  <section class="relative">
    <div class="neo-blob neo-blob-1 animate-float-y" aria-hidden="true"></div>
    <div class="relative space-y-8">
      <header class="space-y-3 text-center lg:text-left">
        <h1 class="font-display text-3xl font-semibold text-slate-900 dark:text-white">Meus planos</h1>
        <p class="text-base text-slate-600 dark:text-slate-300">
          Revise rapidamente seus planos de estudo. Use o formulário para disparar um novo roteiro quando precisar.
        </p>
      </header>

      <div class="rounded-3xl border border-white/40 bg-white/85 p-6 shadow-xl shadow-indigo-100/80 dark:bg-slate-900/85">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div class="flex w-full flex-col gap-3 sm:flex-row">
            <div class="flex-1">
              <label class="text-xs font-semibold uppercase text-slate-500">Buscar</label>
              <div class="mt-1 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
                <Search class="size-4 text-slate-400" />
                <Input v-model="store.searchTerm" placeholder="Título ou resumo..." class="border-0 p-0 focus-visible:ring-0" />
              </div>
            </div>
            <div class="w-full sm:w-48">
              <label class="text-xs font-semibold uppercase text-slate-500">Status</label>
              <div class="mt-1 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
                <Filter class="size-4 text-slate-400" />
                <select v-model="store.statusFilter" class="w-full bg-transparent text-sm outline-none">
                  <option value="all">Todos</option>
                  <option value="active">Ativos</option>
                  <option value="draft">Rascunhos</option>
                  <option value="archived">Arquivados</option>
                  <option value="failed">Com erro</option>
                </select>
              </div>
            </div>
          </div>
          <div class="flex flex-wrap gap-3">
            <Button variant="outline" @click="store.loadPlans">Atualizar</Button>
            <Button @click="sheetOpen = true">
              <Plus class="size-4" />
              Novo plano
            </Button>
          </div>
        </div>

        <div v-if="store.errorMessage" class="mt-4 rounded-2xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {{ store.errorMessage }}
        </div>

        <div class="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <StudyPlanCard
            v-for="plan in store.filteredPlans"
            :key="plan.id"
            :plan="plan"
            @open="handleOpenPlan"
          />
        </div>

        <div
          v-if="!store.filteredPlans.length && !store.loading"
          class="mt-10 flex flex-col items-center rounded-3xl border border-dashed border-slate-200 bg-white/70 px-5 py-16 text-center text-slate-500 dark:bg-slate-900/50"
        >
          <NotebookText class="size-12 text-primary/50" />
          <h3 class="mt-3 text-lg font-semibold text-foreground">Nenhum plano encontrado</h3>
          <p class="text-sm">Crie um plano para começar ou ajuste os filtros de busca.</p>
        </div>

        <div v-if="store.loading" class="mt-10 flex items-center justify-center text-sm text-muted-foreground">
          <Loader2 class="mr-2 size-4 animate-spin" />
          Carregando planos...
        </div>
      </div>
    </div>

    <Sheet v-model:open="sheetOpen">
      <SheetContent class="flex h-full w-full max-w-lg flex-col gap-6 p-6 sm:p-8">
        <SheetHeader>
          <SheetTitle>Gerar novo plano</SheetTitle>
          <SheetDescription>
            Informe o foco da preparação para disparar a geração assíncrona. Assim que a IA concluir, o plano aparecerá
            na lista.
          </SheetDescription>
        </SheetHeader>

        <form class="flex-1 space-y-4" @submit.prevent="handleCreatePlan">
          <label class="space-y-2 text-sm font-medium">
            Título
            <Input v-model="createForm.title" placeholder="ENEM 2025 - Redação" />
          </label>
          <label class="space-y-2 text-sm font-medium">
            Objetivo
            <textarea
              v-model="createForm.goal"
              rows="4"
              class="w-full rounded-2xl border border-slate-200 bg-transparent p-3 text-sm"
              placeholder="Explique o foco da preparação e o prazo desejado..."
            />
          </label>
        </form>

        <Button type="button" :disabled="!canSubmit || store.creating" class="w-full" @click="handleCreatePlan">
          <Loader2 v-if="store.creating" class="mr-2 size-4 animate-spin" />
          <span v-else class="inline-flex items-center gap-2">
            <Plus class="size-4" />
            Gerar plano
          </span>
        </Button>
      </SheetContent>
    </Sheet>
  </section>
</template>
