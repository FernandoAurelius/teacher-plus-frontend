import type { StudyTask, StudyTaskContent } from '@/entities/study-plan'
import type {
  FlashcardDeck,
  FlashcardItem,
  FlashcardSessionSnapshot,
} from '@/features/flashcards'
import type { QuickQuestion, QuickTest } from '@/features/quick-tests'
import type { ReadingItem } from '@/features/readings'

type ParsedContent = StudyTaskContent

export const mapTaskToFlashcardDeck = (task: StudyTask, content: ParsedContent): FlashcardDeck => {
  const cards = content.kind === 'flashcards' ? content.data.cards ?? [] : []
  const items: FlashcardItem[] = cards.map((card, index) => ({
    id: `${task.id}-${index}`,
    front: card.front ?? card.prompt ?? task.title,
    back: card.back ?? card.answer ?? card.explanation ?? task.description ?? '',
    hint: card.hints?.[0] ?? card.hint,
  }))

  if (!items.length) {
    items.push({
      id: `${task.id}-fallback`,
      front: task.title,
      back: task.description ?? 'Revise este item.',
    })
  }

  return {
    id: task.id,
    title: task.title ?? 'Deck',
    status: (task.status as FlashcardDeck['status']) ?? 'pending',
    summary: task.description ?? content.data?.topic ?? '',
    items,
  }
}

export const mapTaskToQuickTest = (task: StudyTask, content: ParsedContent): QuickTest => {
  const items = content.kind === 'assessment' ? content.data.items ?? [] : []

  const questions: QuickQuestion[] = items.map((item, index) => {
    if (item.type === 'tf') {
      return {
        id: `${task.id}-${index}`,
        prompt: item.prompt,
        kind: 'single_choice',
        options: [
          { id: 'true', label: 'Verdadeiro' },
          { id: 'false', label: 'Falso' },
        ],
        correctOptionIds: item.answer ? [item.answer === 'true' ? 'true' : 'false'] : undefined,
        explanation: item.explanation,
      }
    }
    if (item.type === 'mcq') {
      return {
        id: `${task.id}-${index}`,
        prompt: item.prompt,
        kind: 'single_choice',
        options: (item.choices ?? []).map((choice, idx) => ({
          id: `${idx}`,
          label: choice,
        })),
        correctOptionIds: item.answer ? [item.answer] : undefined,
        explanation: item.explanation,
      }
    }
    return {
      id: `${task.id}-${index}`,
      prompt: item.prompt,
      kind: 'text',
      explanation: item.explanation,
    }
  })

  if (!questions.length) {
    questions.push({
      id: `${task.id}-fallback`,
      prompt: task.description ?? 'Responda ou revise esta atividade.',
      kind: 'text',
    })
  }

  return {
    id: task.id,
    title: task.title,
    summary: task.description ?? undefined,
    status: (task.status as QuickTest['status']) ?? 'pending',
    durationSeconds: task.duration_minutes ? task.duration_minutes * 60 : undefined,
    questions,
  }
}

export const mapTaskToReadingItem = (task: StudyTask, content: ParsedContent): ReadingItem => {
  const isReading = content.kind === 'reading'
  const meta = (task as any).metadata as Record<string, unknown> | undefined
  return {
    id: task.id,
    title: task.title,
    status: (task.status as ReadingItem['status']) ?? 'pending',
    summary: task.description ?? (isReading ? content.data.overview : ''),
    estimateMinutes: task.duration_minutes ?? undefined,
    content: isReading ? content.data.instructions : undefined,
    favorite: Boolean(meta?.favorite),
  }
}

export interface TaskCompletionPayload {
  status: 'pending' | 'ready' | 'in_progress' | 'completed'
  minutes_spent?: number
  notes?: string
  payload?: Record<string, unknown>
}

export const buildFlashcardPayload = (snapshot: FlashcardSessionSnapshot): TaskCompletionPayload => ({
  status: 'completed',
  minutes_spent: 5,
  payload: {
    answers: snapshot.answers,
    currentIndex: snapshot.currentIndex,
  },
})

export const buildQuickTestPayload = (result: { score: number; elapsedSeconds: number }) => ({
  status: result.score >= 60 ? 'completed' : 'in_progress',
  minutes_spent: Math.max(1, Math.round(result.elapsedSeconds / 60)),
  payload: { score: result.score },
})
