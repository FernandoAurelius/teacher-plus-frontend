<script setup lang="ts">
import type { HTMLAttributes } from "vue"

import { Textarea } from "@/shared/ui/textarea"

const props = defineProps<{
  value: string
  placeholder?: string
  class?: HTMLAttributes["class"]
}>()

const emit = defineEmits<{
  (e: "update:value", value: string): void
}>()

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  emit("update:value", target.value)
}
</script>

<template>
  <div>
    <label class="text-sm font-medium text-foreground">Notas</label>
    <Textarea
      :value="props.value"
      :placeholder="props.placeholder ?? 'Escreva ideias, links ou destaques...'"
      class="mt-2 min-h-28"
      :class="props.class"
      @input="handleInput"
    />
  </div>
</template>
