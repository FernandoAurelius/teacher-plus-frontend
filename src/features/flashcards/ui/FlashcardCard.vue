<script setup lang="ts">
import { computed } from "vue"

import type { FlashcardItem } from "../model/types"

const props = defineProps<{
  card: FlashcardItem
  side: "front" | "back"
}>()

const emit = defineEmits<{
  (e: "flip"): void
}>()

const sideLabel = computed(() => (props.side === "front" ? "Frente" : "Verso"))
</script>

<template>
  <div
    class="group relative h-64 w-full max-w-2xl cursor-pointer select-none [perspective:1200px]"
    role="button"
    tabindex="0"
    aria-label="Flashcard"
    @click="emit('flip')"
    @keydown.space.prevent="emit('flip')"
    @keydown.enter.prevent="emit('flip')"
  >
    <div
      class="absolute inset-0 rounded-2xl border bg-card text-card-foreground shadow-lg transition-transform duration-300 [transform-style:preserve-3d] group-hover:shadow-xl"
      :class="{
        '[transform:rotateY(180deg)]': side === 'back',
      }"
    >
      <div class="absolute inset-0 flex flex-col gap-2 p-6 [backface-visibility:hidden]">
        <div class="flex items-center justify-between text-xs uppercase text-muted-foreground tracking-[0.08em]">
          <span>Frente</span>
          <span class="rounded-full bg-muted px-3 py-1 text-[10px]">{{ sideLabel }}</span>
        </div>
        <p class="mt-2 text-lg font-semibold leading-relaxed text-foreground">
          {{ card.front }}
        </p>
        <p v-if="card.hint" class="mt-auto text-sm text-muted-foreground">Dica: {{ card.hint }}</p>
      </div>

      <div
        class="absolute inset-0 flex flex-col gap-2 p-6 [backface-visibility:hidden] [transform:rotateY(180deg)]"
      >
        <div class="flex items-center justify-between text-xs uppercase text-muted-foreground tracking-[0.08em]">
          <span>Verso</span>
          <span class="rounded-full bg-muted px-3 py-1 text-[10px]">{{ sideLabel }}</span>
        </div>
        <p class="mt-2 text-base leading-relaxed text-foreground">
          {{ card.back }}
        </p>
      </div>
    </div>
  </div>
</template>
