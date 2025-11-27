<script setup lang="ts">
import { Bookmark, BookmarkCheck, Sparkles } from "lucide-vue-next"

import ReadingContent from "./ReadingContent.vue"
import ReadingNotes from "./ReadingNotes.vue"
import type { ReadingItem } from "../model/types"
import { useReadingProgress } from "../model/useReadingProgress"
import { Button } from "@/shared/ui/button"
import { StatusBadge } from "@/shared/ui/status-badge"

const props = withDefaults(
  defineProps<{
    item: ReadingItem
    autoPersist?: boolean
  }>(),
  {
    autoPersist: true,
  },
)

const emit = defineEmits<{
  (e: "mark-done", item: ReadingItem): void
  (e: "favorite", item: ReadingItem, favorite: boolean): void
  (e: "save-notes", item: ReadingItem, notes: string): void
}>()

const progress = useReadingProgress(props.item, { autoPersist: props.autoPersist })

const handleDone = () => {
  progress.markDone()
  emit("mark-done", props.item)
}

const handleFavorite = () => {
  progress.toggleFavorite()
  emit("favorite", props.item, progress.favorite.value)
}

const handleNotes = (value: string) => {
  progress.updateNotes(value)
  emit("save-notes", props.item, value)
}
</script>

<article class="w-full max-w-3xl rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
  <header class="flex flex-wrap items-start justify-between gap-2">
    <div class="flex flex-col gap-1">
      <p class="text-sm text-muted-foreground">Leitura</p>
      <h3 class="text-2xl font-semibold text-foreground">{{ item.title }}</h3>
      <p v-if="item.summary" class="text-sm text-muted-foreground">{{ item.summary }}</p>
      <p v-if="item.estimateMinutes" class="text-xs text-muted-foreground">
        ~{{ item.estimateMinutes }} min
      </p>
    </div>
    <div class="flex items-center gap-2">
      <StatusBadge :status="progress.isRead.value ? 'done' : item.status" />
      <Button variant="ghost" size="icon" :aria-pressed="progress.favorite.value" @click="handleFavorite">
        <component :is="progress.favorite.value ? BookmarkCheck : Bookmark" class="size-4" />
      </Button>
    </div>
  </header>

  <div class="mt-4 grid gap-3">
    <ReadingContent :summary="item.summary" :content="item.content" />
    <div class="flex items-center gap-2">
      <Button variant="secondary" size="sm" @click="handleDone">
        <Sparkles class="size-4" />
        Marcar como lido
      </Button>
    </div>
    <ReadingNotes :value="progress.notes.value" @update:value="handleNotes" />
  </div>
</article>
