import { z } from 'zod'
import { schemas } from '@/shared/api/schemas'

export type StudyPlan = z.infer<typeof schemas.StudyPlan>
export type StudyPlanSummary = z.infer<typeof schemas.StudyPlanSummary>
export type StudyDay = z.infer<typeof schemas.StudyDay>
export type StudyTask = z.infer<typeof schemas.StudyTask>

export type StudyWeek = {
  weekIndex: number
  title: string
  status: StudyDay['status']
  summary?: string | null
  days: StudyDay[]
}

export type StudyTaskContentKind =
  | 'lesson'
  | 'reading'
  | 'practice'
  | 'project'
  | 'flashcards'
  | 'assessment'
  | 'reflection'
  | 'review'
  | 'other'

export type LessonContent = {
  summary?: string
  body?: string
  key_points?: string[]
  source_refs?: string[]
}

export type ReadingContent = {
  overview?: string
  instructions?: string
  resources?: string[]
}

export type PracticeContent = {
  prompt?: string
  expected_output?: string
  rubric?: string
  hints?: string[]
}

export type ProjectContent = {
  brief?: string
  deliverables?: string[]
  evaluation?: string
  resources?: string[]
}

export type ReflectionContent = {
  prompts?: string[]
  takeaways?: string[]
}

export type ReviewContent = {
  focus?: string
  checklist?: string[]
}

export type Flashcard = {
  front: string
  back: string
  hints?: string[]
  difficulty?: string
}

export type FlashcardContent = {
  topic?: string
  cards: Flashcard[]
}

export type AssessmentItem = {
  type: 'mcq' | 'tf' | 'open'
  prompt: string
  choices?: string[]
  answer?: string
  explanation?: string
}

export type AssessmentContent = {
  title?: string
  instructions?: string
  items: AssessmentItem[]
}

export type StudyTaskContent =
  | { kind: 'lesson'; data: LessonContent }
  | { kind: 'reading'; data: ReadingContent }
  | { kind: 'practice'; data: PracticeContent }
  | { kind: 'project'; data: ProjectContent }
  | { kind: 'flashcards'; data: FlashcardContent }
  | { kind: 'assessment'; data: AssessmentContent }
  | { kind: 'reflection'; data: ReflectionContent }
  | { kind: 'review'; data: ReviewContent }
  | { kind: 'other'; data: Record<string, unknown> | string | null }

type JsonValue = Record<string, unknown> | string | null

export function groupDaysByWeek(days: StudyDay[] = []): StudyWeek[] {
  if (!days.length) {
    return [
      {
        weekIndex: 1,
        title: 'Semana 1',
        status: 'pending',
        days: [],
        summary: '',
      },
    ]
  }

  const grouped = new Map<number, StudyWeek>()

  days.forEach((day) => {
    const weekIndex = normalizeNumber(day.week_index)
    if (!grouped.has(weekIndex)) {
      grouped.set(weekIndex, {
        weekIndex,
        title: `Semana ${weekIndex}`,
        status: day.status,
        days: [],
        summary: day.focus,
      })
    }
    grouped.get(weekIndex)!.days.push(day)
  })

  return [...grouped.values()].sort((a, b) => a.weekIndex - b.weekIndex)
}

export function getCurrentWeekLabel(plan?: StudyPlanSummary | StudyPlan | null) {
  if (!plan) return '—'
  if ('current_week' in plan && plan.current_week) return plan.current_week

  const firstDay = plan.days?.[0]
  if (!firstDay) return 'Semana 1'
  return `Semana ${firstDay.week_index}`
}

export function parseTaskContent(task: StudyTask): StudyTaskContent {
  const raw = deserialize< JsonValue >(task.content)
  const kind = (task.content_type || task.task_type || 'other') as StudyTaskContentKind

  switch (kind) {
    case 'lesson':
      return { kind: 'lesson', data: ensureObject<LessonContent>(raw) }
    case 'reading':
      return { kind: 'reading', data: ensureObject<ReadingContent>(raw) }
    case 'practice':
      return { kind: 'practice', data: ensureObject<PracticeContent>(raw) }
    case 'project':
      return { kind: 'project', data: ensureObject<ProjectContent>(raw) }
    case 'flashcards': {
      const payload = ensureObject<FlashcardContent>(raw)
      return {
        kind: 'flashcards',
        data: {
          topic: payload?.topic ?? task.title,
          cards: payload?.cards ?? [],
        },
      }
    }
    case 'assessment': {
      const payload = ensureObject<AssessmentContent>(raw)
      return {
        kind: 'assessment',
        data: {
          title: payload?.title ?? task.title,
          instructions: payload?.instructions ?? task.description,
          items: payload?.items ?? [],
        },
      }
    }
    case 'reflection':
      return { kind: 'reflection', data: ensureObject<ReflectionContent>(raw) }
    case 'review':
      return { kind: 'review', data: ensureObject<ReviewContent>(raw) }
    default:
      return { kind: 'other', data: raw }
  }
}

export function getPlanStatusBadge(plan: StudyPlanSummary | StudyPlan) {
  if (plan.generation_status === 'failed') return { label: 'Erro IA', tone: 'destructive' as const }
  if (plan.generation_status === 'pending' || plan.generation_status === 'running') {
    return { label: 'Gerando...', tone: 'amber' as const }
  }
  if (plan.status === 'active') return { label: 'Ativo', tone: 'success' as const }
  if (plan.status === 'archived') return { label: 'Arquivado', tone: 'muted' as const }
  return { label: 'Draft', tone: 'secondary' as const }
}

function deserialize<T>(value: unknown): T | null {
  if (!value) return null
  if (typeof value === 'object') return value as T
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T
    } catch {
      return null
    }
  }
  return null
}

function ensureObject<T extends Record<string, unknown>>(value: JsonValue): T {
  if (value && typeof value === 'object') return value as T
  return {} as T
}

function normalizeNumber(value: unknown): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10)
    return Number.isNaN(parsed) ? 0 : parsed
  }
  return 0
}
