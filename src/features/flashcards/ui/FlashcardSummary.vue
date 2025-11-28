<script setup lang="ts">
import type { FlashcardSessionSummary } from "../model/types"
import { Button } from "@/shared/ui/button"
import { StatusBadge } from "@/shared/ui/status-badge"

const props = defineProps<{
  summary: FlashcardSessionSummary
}>()

const emit = defineEmits<{
  (e: "reset"): void
}>()
</script>

<template>
  <div class="w-full max-w-2xl rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
    <header class="flex items-center justify-between gap-2">
      <div>
        <p class="text-sm text-muted-foreground">Sessao concluida</p>
        <h3 class="text-xl font-semibold text-foreground">Resumo dos flashcards</h3>
      </div>
      <StatusBadge status="done" label="Concluido" />
    </header>

    <div class="mt-4 grid grid-cols-2 gap-4 text-sm text-foreground sm:grid-cols-3">
      <div class="rounded-lg border bg-muted/40 px-3 py-2">
        <p class="text-muted-foreground">Total</p>
        <p class="text-lg font-semibold">{{ summary.total }}</p>
      </div>
      <div class="rounded-lg border bg-muted/40 px-3 py-2">
        <p class="text-muted-foreground">Respondidos</p>
        <p class="text-lg font-semibold">{{ summary.answered }}</p>
      </div>
      <div class="rounded-lg border bg-muted/40 px-3 py-2">
        <p class="text-muted-foreground">Acertos estimados</p>
        <p class="text-lg font-semibold">{{ summary.accuracy }}%</p>
      </div>
      <div class="rounded-lg border bg-muted/40 px-3 py-2">
        <p class="text-muted-foreground">Facil</p>
        <p class="text-lg font-semibold text-emerald-600 dark:text-emerald-300">
          {{ summary.easy }}
        </p>
      </div>
      <div class="rounded-lg border bg-muted/40 px-3 py-2">
        <p class="text-muted-foreground">Medio</p>
        <p class="text-lg font-semibold text-amber-600 dark:text-amber-300">
          {{ summary.medium }}
        </p>
      </div>
      <div class="rounded-lg border bg-muted/40 px-3 py-2">
        <p class="text-muted-foreground">Dificil</p>
        <p class="text-lg font-semibold text-red-600 dark:text-red-300">
          {{ summary.hard }}
        </p>
      </div>
      <div class="rounded-lg border bg-muted/40 px-3 py-2">
        <p class="text-muted-foreground">Pulados</p>
        <p class="text-lg font-semibold text-slate-700 dark:text-slate-200">
          {{ summary.skipped }}
        </p>
      </div>
    </div>

    <div class="mt-6 flex justify-end">
      <Button variant="outline" @click="emit('reset')">Refazer sessao</Button>
    </div>
  </div>
</template>
