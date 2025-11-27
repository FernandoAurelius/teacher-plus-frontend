<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue"
import { useSwipe } from "@vueuse/core"

import FlashcardCard from "./FlashcardCard.vue"
import FlashcardControls from "./FlashcardControls.vue"
import FlashcardSummary from "./FlashcardSummary.vue"
import type {
  FlashcardDeck,
  FlashcardDifficulty,
  FlashcardSessionSnapshot,
} from "../model/types"
import { useFlashcardSession } from "../model/useFlashcardSession"
import { StatusBadge } from "@/shared/ui/status-badge"

const props = withDefaults(
  defineProps<{
    deck: FlashcardDeck
    autoPersist?: boolean
  }>(),
  {
    autoPersist: true,
  },
)

const emit = defineEmits<{
  (e: "complete", snapshot: FlashcardSessionSnapshot): void
}>()

const snapshotKey = (deckId: string) => `tp_flashcards_${deckId}`

/**
 * Temporarily persists flashcard sessions client-side until the backend submission endpoints exist.
 * TODO(tp-backend): replace localStorage usage with API persistence once endpoints are available.
 */
const loadSnapshot = (deckId: string): FlashcardSessionSnapshot | null => {
  if (typeof window === "undefined") return null
  const raw = window.localStorage.getItem(snapshotKey(deckId))
  if (!raw) return null
  try {
    return JSON.parse(raw) as FlashcardSessionSnapshot
  } catch {
    return null
  }
}

const persistSnapshot = (deckId: string, value: FlashcardSessionSnapshot) => {
  if (typeof window === "undefined") return
  window.localStorage.setItem(snapshotKey(deckId), JSON.stringify(value))
}

const persistedSnapshot = loadSnapshot(props.deck.id)
const session = useFlashcardSession(props.deck, { snapshot: persistedSnapshot })
const cardRef = ref<HTMLElement | null>(null)

const canPrev = computed(() => session.currentIndex.value > 0)
const canNext = computed(() => session.currentIndex.value < session.total.value - 1)
const isFinished = computed(
  () => session.answered.value >= session.total.value && session.total.value > 0,
)

const handleAnswer = (difficulty: FlashcardDifficulty) => {
  session.markAnswer(difficulty)
  if (session.answered.value >= session.total.value) {
    emit("complete", session.snapshot.value)
  }
}

const isTypingTarget = (event: KeyboardEvent) => {
  const target = event.target as HTMLElement | null
  if (!target) return false
  const tag = target.tagName
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    target.getAttribute("role") === "textbox" ||
    target.getAttribute("contenteditable") === "true"
  )
}

const handleKeydown = (event: KeyboardEvent) => {
  if (isTypingTarget(event) || isFinished.value) return
  if (event.code === "Space") {
    event.preventDefault()
    session.flip()
  }
  if (event.key === "ArrowRight") {
    event.preventDefault()
    session.next()
  }
  if (event.key === "ArrowLeft") {
    event.preventDefault()
    session.prev()
  }
  if (event.key === "1") {
    event.preventDefault()
    handleAnswer("easy")
  }
  if (event.key === "2") {
    event.preventDefault()
    handleAnswer("medium")
  }
  if (event.key === "3") {
    event.preventDefault()
    handleAnswer("hard")
  }
}

onMounted(() => {
  window.addEventListener("keydown", handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown)
})

useSwipe(cardRef, {
  onSwipeEnd: (_evt, direction) => {
    if (isFinished.value) return
    if (direction === "left") session.next()
    if (direction === "right") session.prev()
    if (direction === "up" || direction === "down") session.flip()
  },
})

watch(
  () => session.snapshot.value,
  (value) => {
    if (!props.autoPersist) return
    persistSnapshot(props.deck.id, value)
  },
  { deep: true },
)

onMounted(() => {
  if (props.autoPersist && !persistedSnapshot) {
    persistSnapshot(props.deck.id, session.snapshot.value)
  }
})
</script>

<div class="flex w-full flex-col items-center gap-4">
  <header class="flex w-full max-w-2xl items-center justify-between">
    <div class="flex flex-col gap-1">
      <p class="text-sm text-muted-foreground">Deck</p>
      <h2 class="text-2xl font-semibold text-foreground">{{ deck.title }}</h2>
      <p v-if="deck.summary" class="text-sm text-muted-foreground">{{ deck.summary }}</p>
    </div>
    <StatusBadge :status="deck.status" />
  </header>

  <div v-if="session.currentCard.value" ref="cardRef" class="w-full">
    <FlashcardCard
      :card="session.currentCard.value"
      :side="session.side.value"
      @flip="session.flip"
    />
  </div>

  <FlashcardControls
    v-if="!isFinished"
    :can-prev="canPrev"
    :can-next="canNext"
    :progress="session.progress.value"
    @prev="session.prev"
    @next="session.next"
    @flip="session.flip"
    @answer="handleAnswer"
    @reset="session.reset"
  />

  <FlashcardSummary v-else :summary="session.summary.value" @reset="session.reset" />
</div>
