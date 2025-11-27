import type { ContentBlockBase } from "@/entities/content-block"

export type FlashcardDifficulty = "easy" | "medium" | "hard" | "skipped"

export interface FlashcardItem {
  id: string
  front: string
  back: string
  hint?: string
  tags?: string[]
}

export interface FlashcardDeck extends ContentBlockBase {
  topic?: string
  items: FlashcardItem[]
}

export interface FlashcardSessionSnapshot {
  deckId: string
  currentIndex: number
  answers: Record<string, FlashcardDifficulty>
  side: "front" | "back"
  startedAt: string
}

export interface FlashcardSessionSummary {
  total: number
  answered: number
  easy: number
  medium: number
  hard: number
  skipped: number
  accuracy: number
}
