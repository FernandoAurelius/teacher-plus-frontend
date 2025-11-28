<script setup lang="ts">
import { computed } from "vue"

import type { ContentBlockStatus } from "@/entities/content-block"
import { getContentBlockMeta } from "@/entities/content-block"
import { Badge } from "@/shared/ui/badge"

type Tone = "info" | "success" | "warning" | "danger" | "muted"

const toneClassMap: Record<Tone, string> = {
  info: "bg-primary/10 text-primary border-primary/20 dark:bg-primary/15",
  success:
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-50 dark:border-emerald-800",
  warning:
    "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-50 dark:border-amber-800",
  danger:
    "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-100 dark:border-red-800",
  muted: "bg-muted text-muted-foreground border-muted/40 dark:bg-muted/40",
}

const props = defineProps<{
  status: ContentBlockStatus
  label?: string
  toneOverride?: Tone
}>()

const badgeMeta = computed(() => getContentBlockMeta(props.status))
const badgeTone = computed<Tone>(() => props.toneOverride ?? badgeMeta.value.tone)
const labelText = computed(() => props.label ?? badgeMeta.value.label)
</script>

<template>
  <Badge :class="toneClassMap[badgeTone]" role="status" aria-live="polite">
    <slot>{{ labelText }}</slot>
  </Badge>
</template>
