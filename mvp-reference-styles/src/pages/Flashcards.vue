<template>
  <div class="flashcards">
    <div class="page-header">
      <h1>Flashcards</h1>
      <p>Pratique e memorize conceitos importantes</p>
    </div>

    <!-- Collapsible Chat -->
    <CollapsibleChat />

    <!-- Tabs -->
    <div class="tabs-container">
      <div class="tabs-header">
        <button
          @click="activeTab = 'folders'"
          class="tab-button"
          :class="{ active: activeTab === 'folders' }"
        >
          <Folder :size="20" />
          Pastas
        </button>
        <button
          @click="activeTab = 'individual'"
          class="tab-button"
          :class="{ active: activeTab === 'individual' }"
        >
          <Layers :size="20" />
          Avulsos
        </button>
      </div>

      <!-- Folders Tab -->
      <div v-if="activeTab === 'folders'" class="tab-content">
        <div class="folders-grid">
          <Card
            v-for="folder in folders"
            :key="folder.id"
            className="folder-card"
            @click="openFolder(folder)"
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ 
              opacity: 1, 
              y: 0, 
              transition: { 
                duration: 300, 
                ease: 'easeOut' 
              } 
            }"
          >
            <div class="folder-icon">
              <Folder :size="32" />
            </div>
            <div class="folder-info">
              <h3>{{ folder.name }}</h3>
              <p>{{ folder.subject }}</p>
              <div class="folder-stats">
                <span>{{ folder.cards.length }} cartões</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <!-- Individual Cards Tab -->
      <div v-if="activeTab === 'individual'" class="tab-content">
        <div class="individual-cards">
          <div
            v-for="card in individualCards"
            :key="card.id"
            class="card-item"
            v-motion
            :initial="{ opacity: 0, x: -20 }"
            :enter="{ 
              opacity: 1, 
              x: 0, 
              transition: { 
                duration: 300, 
                ease: 'easeOut' 
              } 
            }"
          >
            <Card className="individual-card">
              <div class="card-preview">
                <div class="card-front">
                  <h4>{{ card.front }}</h4>
                </div>
                <div class="card-meta">
                  <div class="card-subject">{{ card.subject }}</div>
                  <div class="card-difficulty" :class="`difficulty-${card.difficulty}`">
                    {{ getDifficultyLabel(card.difficulty) }}
                  </div>
                </div>
              </div>
              <div class="card-actions">
                <Button @click="practiceCard(card)" variant="primary" size="sm">
                  Praticar
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>

    <!-- Folder Detail Modal -->
    <div v-if="selectedFolder" class="folder-modal-overlay" @click="closeFolder">
      <div class="folder-modal" @click.stop>
        <div class="folder-header">
          <div class="folder-title">
            <h2>{{ selectedFolder.name }}</h2>
            <p>{{ selectedFolder.subject }} • {{ selectedFolder.cards.length }} cartões</p>
          </div>
          <button @click="closeFolder" class="close-button">
            <X :size="24" />
          </button>
        </div>

        <div class="folder-content">
          <div class="folder-actions">
            <Button @click="practiceFolder" variant="primary">
              <Play :size="16" />
              Praticar Todos
            </Button>
            <Button @click="shufflePractice" variant="outline">
              <Shuffle :size="16" />
              Modo Aleatório
            </Button>
          </div>

          <div class="cards-list">
            <div
              v-for="card in selectedFolder.cards"
              :key="card.id"
              class="card-list-item"
            >
              <div class="card-preview-small">
                <div class="card-question">{{ card.front }}</div>
                <div class="card-answer">{{ card.back }}</div>
              </div>
              <Button @click="practiceCard(card)" variant="ghost" size="sm">
                <Play :size="14" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Practice Modal -->
    <div v-if="practiceMode" class="practice-modal-overlay" @click="closePractice">
      <div class="practice-modal" @click.stop>
        <div class="practice-header">
          <div class="practice-info">
            <h3>Modo Prática</h3>
            <p v-if="practiceCards.length > 1">
              {{ currentCardIndex + 1 }} de {{ practiceCards.length }}
            </p>
          </div>
          <button @click="closePractice" class="close-button">
            <X :size="24" />
          </button>
        </div>

        <div class="practice-content">
          <div class="flashcard" :class="{ flipped: cardFlipped }" @click="flipCard">
            <div class="flashcard-inner">
              <div class="flashcard-front">
                <div class="card-content">
                  <h4>{{ currentPracticeCard.front }}</h4>
                </div>
                <div class="flip-hint">
                  <RotateCcw :size="16" />
                  Clique para ver a resposta
                </div>
              </div>
              <div class="flashcard-back">
                <div class="card-content">
                  <h4>{{ currentPracticeCard.back }}</h4>
                </div>
                <div class="flip-hint">
                  <RotateCcw :size="16" />
                  Clique para voltar
                </div>
              </div>
            </div>
          </div>

          <div v-if="cardFlipped" class="practice-actions">
            <Button @click="markDifficult" variant="outline" class="difficulty-btn difficult">
              <X :size="16" />
              Difícil
            </Button>
            <Button @click="markMedium" variant="outline" class="difficulty-btn medium">
              <Minus :size="16" />
              Médio
            </Button>
            <Button @click="markEasy" variant="primary" class="difficulty-btn easy">
              <Check :size="16" />
              Fácil
            </Button>
          </div>

          <div v-if="practiceCards.length > 1" class="practice-navigation">
            <Button
              @click="previousCard"
              :disabled="currentCardIndex === 0"
              variant="ghost"
            >
              <ChevronLeft :size="16" />
              Anterior
            </Button>
            <Button
              @click="nextCard"
              :disabled="currentCardIndex === practiceCards.length - 1"
              variant="ghost"
            >
              Próximo
              <ChevronRight :size="16" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Folder,
  Layers,
  X,
  Play,
  Shuffle,
  RotateCcw,
  Check,
  Minus,
  ChevronLeft,
  ChevronRight
} from 'lucide-vue-next'
import CollapsibleChat from '@/components/CollapsibleChat.vue'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import type { Flashcard, FlashcardFolder } from '@/types'

const activeTab = ref<'folders' | 'individual'>('folders')
const selectedFolder = ref<FlashcardFolder | null>(null)
const practiceMode = ref(false)
const practiceCards = ref<Flashcard[]>([])
const currentCardIndex = ref(0)
const cardFlipped = ref(false)

const mockFolders: FlashcardFolder[] = [
  {
    id: '1',
    name: 'Português - Figuras de Linguagem',
    subject: 'Língua Portuguesa',
    cards: [
      {
        id: '1',
        front: 'O que é metáfora?',
        back: 'Figura de linguagem que estabelece uma comparação implícita entre dois elementos, sem usar conectivos comparativos.',
        subject: 'Português',
        difficulty: 'medium'
      },
      {
        id: '2',
        front: 'Defina metonímia.',
        back: 'Figura de linguagem que substitui uma palavra por outra com a qual mantém relação de proximidade ou dependência.',
        subject: 'Português',
        difficulty: 'medium'
      },
      {
        id: '3',
        front: 'O que é hipérbole?',
        back: 'Figura de linguagem que expressa uma ideia de forma exagerada, intensificando o sentido.',
        subject: 'Português',
        difficulty: 'easy'
      }
    ]
  },
  {
    id: '2',
    name: 'Matemática - Fórmulas Básicas',
    subject: 'Matemática',
    cards: [
      {
        id: '4',
        front: 'Fórmula de Bhaskara',
        back: 'x = (-b ± √(b² - 4ac)) / 2a',
        subject: 'Matemática',
        difficulty: 'hard'
      },
      {
        id: '5',
        front: 'Área do círculo',
        back: 'A = π × r²',
        subject: 'Matemática',
        difficulty: 'easy'
      },
      {
        id: '6',
        front: 'Teorema de Pitágoras',
        back: 'a² + b² = c²',
        subject: 'Matemática',
        difficulty: 'medium'
      }
    ]
  },
  {
    id: '3',
    name: 'História - Datas Importantes',
    subject: 'História',
    cards: [
      {
        id: '7',
        front: 'Descobrimento do Brasil',
        back: '22 de abril de 1500',
        subject: 'História',
        difficulty: 'easy'
      },
      {
        id: '8',
        front: 'Independência do Brasil',
        back: '7 de setembro de 1822',
        subject: 'História',
        difficulty: 'easy'
      }
    ]
  }
]

const mockIndividualCards: Flashcard[] = [
  {
    id: '9',
    front: 'Qual é a capital da França?',
    back: 'Paris',
    subject: 'Geografia',
    difficulty: 'easy'
  },
  {
    id: '10',
    front: 'Quem escreveu "Dom Casmurro"?',
    back: 'Machado de Assis',
    subject: 'Literatura',
    difficulty: 'medium'
  },
  {
    id: '11',
    front: 'Fórmula da velocidade',
    back: 'v = Δs / Δt',
    subject: 'Física',
    difficulty: 'medium'
  }
]

const folders = ref<FlashcardFolder[]>(mockFolders)
const individualCards = ref<Flashcard[]>(mockIndividualCards)

const currentPracticeCard = computed(() => {
  return practiceCards.value[currentCardIndex.value]
})

const getDifficultyLabel = (difficulty: string) => {
  const labels = {
    easy: 'Fácil',
    medium: 'Médio',
    hard: 'Difícil'
  }
  return labels[difficulty as keyof typeof labels] || 'Médio'
}

const openFolder = (folder: FlashcardFolder) => {
  selectedFolder.value = folder
}

const closeFolder = () => {
  selectedFolder.value = null
}

const practiceFolder = () => {
  if (!selectedFolder.value) return
  practiceCards.value = [...selectedFolder.value.cards]
  startPractice()
}

const shufflePractice = () => {
  if (!selectedFolder.value) return
  const shuffled = [...selectedFolder.value.cards].sort(() => Math.random() - 0.5)
  practiceCards.value = shuffled
  startPractice()
}

const practiceCard = (card: Flashcard) => {
  practiceCards.value = [card]
  startPractice()
}

const startPractice = () => {
  practiceMode.value = true
  currentCardIndex.value = 0
  cardFlipped.value = false
  closeFolder()
}

const closePractice = () => {
  practiceMode.value = false
  practiceCards.value = []
  currentCardIndex.value = 0
  cardFlipped.value = false
}

const flipCard = () => {
  cardFlipped.value = !cardFlipped.value
}

const markDifficult = () => {
  // In a real app, this would update the card's difficulty and scheduling
  nextCard()
}

const markMedium = () => {
  // In a real app, this would update the card's difficulty and scheduling
  nextCard()
}

const markEasy = () => {
  // In a real app, this would update the card's difficulty and scheduling
  nextCard()
}

const previousCard = () => {
  if (currentCardIndex.value > 0) {
    currentCardIndex.value--
    cardFlipped.value = false
  }
}

const nextCard = () => {
  if (currentCardIndex.value < practiceCards.value.length - 1) {
    currentCardIndex.value++
    cardFlipped.value = false
  } else if (practiceCards.value.length === 1) {
    closePractice()
  }
}
</script>

<style scoped>
.flashcards {
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: var(--fg-base);
  margin: 0 0 8px 0;
}

.page-header p {
  font-size: 18px;
  color: var(--fg-muted);
  margin: 0;
}

/* Tabs */
.tabs-container {
  margin-top: 32px;
}

.tabs-header {
  display: flex;
  gap: 4px;
  margin-bottom: 24px;
  background: var(--bg-elev1);
  border-radius: var(--radius-md);
  padding: 4px;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: transparent;
  border: none;
  color: var(--fg-muted);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--dur-fast) var(--ease-standard);
  font-weight: 500;
}

.tab-button:hover {
  color: var(--fg-base);
  background: var(--bg-elev2);
}

.tab-button.active {
  background: var(--primary);
  color: var(--fg-base);
}

.tab-content {
  min-height: 400px;
}

/* Folders */
.folders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.folder-card {
  cursor: pointer;
  transition: all var(--dur-fast) var(--ease-standard);
  display: flex;
  align-items: center;
  gap: 16px;
}

.folder-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.folder-icon {
  width: 60px;
  height: 60px;
  background: var(--primary);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--fg-base);
  flex-shrink: 0;
}

.folder-info {
  flex: 1;
}

.folder-info h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--fg-base);
  margin: 0 0 4px 0;
}

.folder-info p {
  color: var(--fg-muted);
  margin: 0 0 8px 0;
  font-size: 14px;
}

.folder-stats {
  font-size: 12px;
  color: var(--fg-subtle);
}

/* Individual Cards */
.individual-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-item {
  width: 100%;
}

.individual-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.card-preview {
  flex: 1;
}

.card-front h4 {
  font-size: 16px;
  font-weight: 600;
  color: var(--fg-base);
  margin: 0 0 8px 0;
}

.card-meta {
  display: flex;
  gap: 12px;
  align-items: center;
}

.card-subject {
  font-size: 12px;
  color: var(--fg-subtle);
  background: var(--bg-elev2);
  padding: 4px 8px;
  border-radius: var(--radius-sm);
}

.card-difficulty {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  font-weight: 500;
}

.difficulty-easy {
  background: rgba(34, 197, 94, 0.2);
  color: var(--success);
}

.difficulty-medium {
  background: rgba(245, 158, 11, 0.2);
  color: var(--warning);
}

.difficulty-hard {
  background: rgba(239, 68, 68, 0.2);
  color: var(--danger);
}

/* Folder Modal */
.folder-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(8px);
}

.folder-modal {
  background: var(--bg-elev1);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  width: 90%;
  max-width: 700px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: var(--shadow-md);
}

.folder-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid var(--border);
}

.folder-title h2 {
  font-size: 24px;
  font-weight: 600;
  color: var(--fg-base);
  margin: 0 0 4px 0;
}

.folder-title p {
  color: var(--fg-muted);
  margin: 0;
}

.close-button {
  background: transparent;
  border: none;
  color: var(--fg-muted);
  cursor: pointer;
  padding: 8px;
  border-radius: var(--radius-sm);
  transition: all var(--dur-fast) var(--ease-standard);
}

.close-button:hover {
  background: var(--bg-elev2);
  color: var(--fg-base);
}

.folder-content {
  padding: 24px;
}

.folder-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.cards-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: var(--bg-elev2);
  border-radius: var(--radius-md);
  gap: 16px;
}

.card-preview-small {
  flex: 1;
}

.card-question {
  font-weight: 600;
  color: var(--fg-base);
  margin-bottom: 4px;
}

.card-answer {
  font-size: 14px;
  color: var(--fg-muted);
}

/* Practice Modal */
.practice-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(12px);
}

.practice-modal {
  background: var(--bg-elev1);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  width: 90%;
  max-width: 600px;
  box-shadow: var(--shadow-md);
}

.practice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid var(--border);
}

.practice-info h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--fg-base);
  margin: 0 0 4px 0;
}

.practice-info p {
  color: var(--fg-muted);
  margin: 0;
  font-size: 14px;
}

.practice-content {
  padding: 32px 24px;
  text-align: center;
}

/* Flashcard */
.flashcard {
  width: 100%;
  height: 300px;
  perspective: 1000px;
  margin-bottom: 32px;
  cursor: pointer;
}

.flashcard-inner {
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

.flashcard.flipped .flashcard-inner {
  transform: rotateY(180deg);
}

.flashcard-front,
.flashcard-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  background: var(--bg-elev2);
  border: 2px solid var(--border);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 32px;
  gap: 20px;
}

.flashcard-back {
  transform: rotateY(180deg);
  background: var(--primary);
  border-color: var(--primary);
  color: var(--fg-base);
}

.card-content h4 {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  line-height: 1.3;
}

.flashcard-back .card-content h4 {
  color: var(--fg-base);
}

.flip-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--fg-subtle);
  opacity: 0.7;
}

.flashcard-back .flip-hint {
  color: rgba(255, 255, 255, 0.8);
}

/* Practice Actions */
.practice-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 24px;
}

.difficulty-btn {
  min-width: 100px;
}

.difficulty-btn.difficult {
  border-color: var(--danger);
  color: var(--danger);
}

.difficulty-btn.difficult:hover {
  background: var(--danger);
  color: white;
}

.difficulty-btn.medium {
  border-color: var(--warning);
  color: var(--warning);
}

.difficulty-btn.medium:hover {
  background: var(--warning);
  color: white;
}

.difficulty-btn.easy {
  background: var(--success);
  border-color: var(--success);
}

.difficulty-btn.easy:hover {
  background: #16a34a;
}

.practice-navigation {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

/* Mobile Styles */
@media (max-width: 768px) {
  .folders-grid {
    grid-template-columns: 1fr;
  }
  
  .folder-card {
    flex-direction: column;
    text-align: center;
  }
  
  .individual-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .practice-modal {
    width: 95%;
  }
  
  .flashcard {
    height: 250px;
  }
  
  .card-content h4 {
    font-size: 20px;
  }
  
  .practice-actions {
    flex-direction: column;
  }
  
  .folder-actions {
    flex-direction: column;
  }
}
</style>
