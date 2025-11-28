<script setup lang="ts">
import type { QuickTestResult } from "../model/types"
import { Button } from "@/shared/ui/button"
import { StatusBadge } from "@/shared/ui/status-badge"

const props = defineProps<{
  result: QuickTestResult
}>()

const emit = defineEmits<{
  (e: "retry"): void
}>()
</script>

<template>
  <div class="w-full max-w-2xl rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
    <header class="flex items-center justify-between gap-2">
      <div>
        <p class="text-sm text-muted-foreground">Teste finalizado</p>
        <h3 class="text-xl font-semibold text-foreground">Resultado</h3>
      </div>
      <StatusBadge
        :status="props.result.score >= 70 ? 'done' : 'review'"
        :label="props.result.score >= 70 ? 'Aproveitado' : 'Rever'"
      />
    </header>

    <div class="mt-4 grid grid-cols-2 gap-4 text-sm text-foreground sm:grid-cols-3">
      <div class="rounded-lg border bg-muted/40 px-3 py-2">
        <p class="text-muted-foreground">Total</p>
        <p class="text-lg font-semibold">{{ result.total }}</p>
      </div>
      <div class="rounded-lg border bg-muted/40 px-3 py-2">
        <p class="text-muted-foreground">Corretas</p>
        <p class="text-lg font-semibold text-emerald-600 dark:text-emerald-300">
          {{ result.correct }}
        </p>
      </div>
      <div class="rounded-lg border bg-muted/40 px-3 py-2">
        <p class="text-muted-foreground">Erradas</p>
        <p class="text-lg font-semibold text-red-600 dark:text-red-300">
          {{ result.wrong }}
        </p>
      </div>
      <div class="rounded-lg border bg-muted/40 px-3 py-2">
        <p class="text-muted-foreground">Score</p>
        <p class="text-lg font-semibold">{{ result.score }}%</p>
      </div>
      <div class="rounded-lg border bg-muted/40 px-3 py-2">
        <p class="text-muted-foreground">Tempo gasto</p>
        <p class="text-lg font-semibold">
          {{ result.elapsedSeconds }}s
        </p>
      </div>
    </div>

    <div class="mt-6 flex justify-end gap-2">
      <Button variant="outline" @click="emit('retry')">Tentar novamente</Button>
    </div>
  </div>
</template>
