import { computed, reactive, ref } from "vue"

import type {
  FlashcardDeck,
  FlashcardDifficulty,
  FlashcardSessionSnapshot,
  FlashcardSessionSummary,
} from "./types"

interface FlashcardSessionOptions {
  snapshot?: FlashcardSessionSnapshot | null
}

export const useFlashcardSession = (
  deck: FlashcardDeck,
  options: FlashcardSessionOptions = {},
) => {
  const currentIndex = ref(0)
  const side = ref<"front" | "back">("front")
  const answers = ref<Record<string, FlashcardDifficulty>>({})
  const startedAt = ref(new Date().toISOString())

  const hydrateFromSnapshot = (snapshot: FlashcardSessionSnapshot | null | undefined) => {
    if (!snapshot || snapshot.deckId !== deck.id) return
    currentIndex.value = clampIndex(snapshot.currentIndex, deck.items.length)
    side.value = snapshot.side
    answers.value = { ...snapshot.answers }
    startedAt.value = snapshot.startedAt ?? new Date().toISOString()
  }

  hydrateFromSnapshot(options.snapshot)

  const currentCard = computed(() => deck.items[currentIndex.value])
  const total = computed(() => deck.items.length)
  const answered = computed(() => Object.keys(answers.value).length)
  const progress = computed(() =>
    total.value === 0 ? 0 : Math.min(1, (currentIndex.value + 1) / total.value),
  )

  const setSide = (nextSide: "front" | "back") => {
    side.value = nextSide
  }

  const flip = () => {
    side.value = side.value === "front" ? "back" : "front"
  }

  const goTo = (index: number) => {
    currentIndex.value = clampIndex(index, deck.items.length)
    side.value = "front"
  }

  const next = () => {
    goTo(currentIndex.value + 1)
  }

  const prev = () => {
    goTo(currentIndex.value - 1)
  }

  const markAnswer = (difficulty: FlashcardDifficulty) => {
    const card = currentCard.value
    if (!card) return
    answers.value = { ...answers.value, [card.id]: difficulty }
    if (currentIndex.value < deck.items.length - 1) {
      next()
    }
  }

  const reset = () => {
    currentIndex.value = 0
    side.value = "front"
    answers.value = {}
    startedAt.value = new Date().toISOString()
  }

  const snapshot = computed<FlashcardSessionSnapshot>(() => ({
    deckId: deck.id,
    currentIndex: currentIndex.value,
    answers: answers.value,
    side: side.value,
    startedAt: startedAt.value,
  }))

  const summary = computed<FlashcardSessionSummary>(() => {
    const base: FlashcardSessionSummary = {
      total: total.value,
      answered: 0,
      easy: 0,
      medium: 0,
      hard: 0,
      skipped: 0,
      accuracy: 0,
    }
    Object.values(answers.value).forEach((difficulty) => {
      base.answered += 1
      if (difficulty === "easy") base.easy += 1
      if (difficulty === "medium") base.medium += 1
      if (difficulty === "hard") base.hard += 1
      if (difficulty === "skipped") base.skipped += 1
    })
    const totalAnswered = base.answered || 1
    const weightedCorrect = base.easy * 1 + base.medium * 0.7 + base.hard * 0.4
    base.accuracy = Math.round((weightedCorrect / totalAnswered) * 100)
    return base
  })

  return {
    currentCard,
    currentIndex,
    total,
    answered,
    progress,
    side,
    answers,
    snapshot,
    summary,
    setSide,
    flip,
    next,
    prev,
    goTo,
    markAnswer,
    reset,
  }
}

const clampIndex = (value: number, length: number) => {
  if (length <= 0) return 0
  return Math.max(0, Math.min(value, length - 1))
}
