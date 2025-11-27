export interface UserContext {
  persona: string
  goal: string
  deadline: string
  weeklyTimeHours: number
  studyRoutine: string
  backgroundLevel: string
  preferencesLanguage: string
}

export interface ChatMessage {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export interface StudyModule {
  id: string
  title: string
  topics: string[]
  level: "Básico" | "Intermediário" | "Avançado"
  duration: string
}

export interface Assessment {
  id: string
  title: string
  subject: string
  questions: Question[]
  completed: boolean
}

export interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number
}

export interface Flashcard {
  id: string
  front: string
  back: string
  subject: string
  difficulty: "easy" | "medium" | "hard"
  lastReviewed?: Date
}

export interface FlashcardFolder {
  id: string
  name: string
  cards: Flashcard[]
  subject: string
}
