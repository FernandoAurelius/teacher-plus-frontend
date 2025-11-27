import type { ContentBlockBase } from "@/entities/content-block"

export type QuickQuestionKind = "single_choice" | "multiple_choice" | "text"

export interface QuickQuestionOption {
  id: string
  label: string
}

export interface QuickQuestion {
  id: string
  prompt: string
  kind: QuickQuestionKind
  options?: QuickQuestionOption[]
  correctOptionIds?: string[]
  explanation?: string
}

export interface QuickTest extends ContentBlockBase {
  durationSeconds?: number
  questions: QuickQuestion[]
}

export interface QuickTestAnswer {
  questionId: string
  answer: string | string[]
}

export interface QuickTestResult {
  total: number
  correct: number
  wrong: number
  score: number
  durationSeconds?: number
  elapsedSeconds: number
}
