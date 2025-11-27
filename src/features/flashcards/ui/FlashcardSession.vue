<script setup lang="ts">
import { computed, onMounted, watch } from "vue"

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

  <FlashcardCard v-if="session.currentCard.value" :card="session.currentCard.value" :side="session.side.value" @flip="session.flip" />

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
