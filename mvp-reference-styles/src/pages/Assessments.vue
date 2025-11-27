<template>
  <div class="assessments">
    <div class="page-header">
      <h1>Avaliações</h1>
      <p>Teste seus conhecimentos com avaliações personalizadas</p>
    </div>

    <!-- Collapsible Chat -->
    <CollapsibleChat />

    <!-- Assessments List -->
    <div class="assessments-grid">
      <Card
        v-for="assessment in assessments"
        :key="assessment.id"
        className="assessment-card"
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
        <div class="assessment-header">
          <div class="assessment-info">
            <h3>{{ assessment.title }}</h3>
            <p>{{ assessment.subject }}</p>
          </div>
          <div class="assessment-status">
            <div v-if="assessment.completed" class="status-badge completed">
              <Check :size="16" />
              Concluída
            </div>
            <div v-else class="status-badge pending">
              <Clock :size="16" />
              Pendente
            </div>
          </div>
        </div>
        
        <div class="assessment-meta">
          <span class="question-count">{{ assessment.questions.length }} questões</span>
          <span class="difficulty">Nível Médio</span>
        </div>
        
        <div class="assessment-actions">
          <Button
            @click="startAssessment(assessment)"
            :variant="assessment.completed ? 'outline' : 'primary'"
            size="sm"
          >
            {{ assessment.completed ? 'Revisar' : 'Iniciar' }}
          </Button>
        </div>
      </Card>
    </div>

    <!-- Assessment Modal/Drawer -->
    <div v-if="activeAssessment" class="assessment-overlay" @click="closeAssessment">
      <div class="assessment-drawer" @click.stop>
        <div class="drawer-header">
          <div class="assessment-title">
            <h2>{{ activeAssessment.title }}</h2>
            <p>{{ activeAssessment.subject }}</p>
          </div>
          <button @click="closeAssessment" class="close-button">
            <X :size="24" />
          </button>
        </div>

        <div class="drawer-content">
          <!-- Quiz in Progress -->
          <div v-if="!quizCompleted" class="quiz-section">
            <!-- Progress Bar -->
            <div class="progress-section">
              <div class="progress-info">
                <span>Questão {{ currentQuestionIndex + 1 }} de {{ activeAssessment.questions.length }}</span>
                <span>{{ Math.round(((currentQuestionIndex + 1) / activeAssessment.questions.length) * 100) }}%</span>
              </div>
              <div class="progress-bar">
                <div 
                  class="progress-fill"
                  :style="{ width: `${((currentQuestionIndex + 1) / activeAssessment.questions.length) * 100}%` }"
                ></div>
              </div>
            </div>

            <!-- Current Question -->
            <div class="question-section">
              <h3>{{ currentQuestion.question }}</h3>
              <div class="options-list">
                <button
                  v-for="(option, index) in currentQuestion.options"
                  :key="index"
                  @click="selectOption(index)"
                  class="option-button"
                  :class="{ 
                    'selected': selectedOption === index,
                    'correct': showResults && index === currentQuestion.correctAnswer,
                    'incorrect': showResults && selectedOption === index && index !== currentQuestion.correctAnswer
                  }"
                  :disabled="showResults"
                >
                  <div class="option-letter">{{ String.fromCharCode(65 + index) }}</div>
                  <span>{{ option }}</span>
                  <div v-if="showResults && index === currentQuestion.correctAnswer" class="result-icon correct">
                    <Check :size="16" />
                  </div>
                  <div v-else-if="showResults && selectedOption === index && index !== currentQuestion.correctAnswer" class="result-icon incorrect">
                    <X :size="16" />
                  </div>
                </button>
              </div>
            </div>

            <!-- Navigation -->
            <div class="question-navigation">
              <Button
                v-if="!showResults"
                @click="submitAnswer"
                :disabled="selectedOption === null"
                variant="primary"
              >
                Confirmar Resposta
              </Button>
              <Button
                v-else
                @click="nextQuestion"
                variant="primary"
              >
                {{ currentQuestionIndex < activeAssessment.questions.length - 1 ? 'Próxima Questão' : 'Ver Resultado' }}
              </Button>
            </div>
          </div>

          <!-- Quiz Results -->
          <div v-else class="results-section">
            <div class="results-header">
              <div class="score-circle">
                <div class="score-text">
                  <span class="score-number">{{ score }}</span>
                  <span class="score-total">/ {{ activeAssessment.questions.length }}</span>
                </div>
              </div>
              <h3>Avaliação Concluída!</h3>
              <p class="score-percentage">{{ Math.round((score / activeAssessment.questions.length) * 100) }}% de acertos</p>
            </div>

            <div class="performance-analysis">
              <h4>Análise de Desempenho</h4>
              <div class="performance-grid">
                <div class="performance-item">
                  <div class="performance-icon correct">
                    <Check :size="20" />
                  </div>
                  <div class="performance-info">
                    <span class="performance-number">{{ score }}</span>
                    <span class="performance-label">Acertos</span>
                  </div>
                </div>
                <div class="performance-item">
                  <div class="performance-icon incorrect">
                    <X :size="20" />
                  </div>
                  <div class="performance-info">
                    <span class="performance-number">{{ activeAssessment.questions.length - score }}</span>
                    <span class="performance-label">Erros</span>
                  </div>
                </div>
                <div class="performance-item">
                  <div class="performance-icon time">
                    <Clock :size="20" />
                  </div>
                  <div class="performance-info">
                    <span class="performance-number">{{ formatTime(elapsedTime) }}</span>
                    <span class="performance-label">Tempo</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="results-actions">
              <Button @click="restartQuiz" variant="outline">
                Refazer Avaliação
              </Button>
              <Button @click="closeAssessment" variant="primary">
                Concluir
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Check, Clock, X } from 'lucide-vue-next'
import CollapsibleChat from '@/components/CollapsibleChat.vue'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import type { Assessment, Question } from '@/types'

const activeAssessment = ref<Assessment | null>(null)
const currentQuestionIndex = ref(0)
const selectedOption = ref<number | null>(null)
const showResults = ref(false)
const quizCompleted = ref(false)
const userAnswers = ref<number[]>([])
const startTime = ref<Date | null>(null)
const elapsedTime = ref(0)

const mockAssessments: Assessment[] = [
  {
    id: '1',
    title: 'Português - Interpretação de Texto',
    subject: 'Língua Portuguesa',
    completed: false,
    questions: [
      {
        id: '1',
        question: 'Qual é a função da linguagem predominante no texto "Venha conhecer nossa nova loja!"?',
        options: [
          'Função referencial',
          'Função emotiva',
          'Função conativa',
          'Função fática'
        ],
        correctAnswer: 2
      },
      {
        id: '2',
        question: 'Em "O livro que comprei é muito interessante", o termo "que" é:',
        options: [
          'Pronome interrogativo',
          'Conjunção integrante',
          'Pronome relativo',
          'Conjunção coordenativa'
        ],
        correctAnswer: 2
      },
      {
        id: '3',
        question: 'Qual figura de linguagem está presente em "Suas palavras foram punhais em meu coração"?',
        options: [
          'Metáfora',
          'Metonímia',
          'Hipérbole',
          'Personificação'
        ],
        correctAnswer: 0
      },
      {
        id: '4',
        question: 'O período "Embora chovesse, saímos de casa" é classificado como:',
        options: [
          'Período simples',
          'Período composto por coordenação',
          'Período composto por subordinação',
          'Período misto'
        ],
        correctAnswer: 2
      },
      {
        id: '5',
        question: 'Em qual alternativa há erro de concordância verbal?',
        options: [
          'Fazem dois anos que não o vejo.',
          'Havia muitas pessoas na festa.',
          'Existem várias opções disponíveis.',
          'Deve haver soluções para o problema.'
        ],
        correctAnswer: 0
      }
    ]
  },
  {
    id: '2',
    title: 'Matemática - Funções',
    subject: 'Matemática',
    completed: true,
    questions: [
      {
        id: '1',
        question: 'Qual é o domínio da função f(x) = √(x - 2)?',
        options: [
          'x ≥ 2',
          'x ≤ 2',
          'x > 2',
          'x < 2'
        ],
        correctAnswer: 0
      },
      {
        id: '2',
        question: 'Se f(x) = 2x + 3, qual é o valor de f(5)?',
        options: [
          '10',
          '11',
          '13',
          '15'
        ],
        correctAnswer: 2
      }
    ]
  },
  {
    id: '3',
    title: 'História - Brasil Colonial',
    subject: 'História',
    completed: false,
    questions: [
      {
        id: '1',
        question: 'Qual foi o primeiro sistema econômico implantado no Brasil colonial?',
        options: [
          'Plantation',
          'Capitanias hereditárias',
          'Extração do pau-brasil',
          'Mineração'
        ],
        correctAnswer: 2
      }
    ]
  }
]

const assessments = ref<Assessment[]>(mockAssessments)

const currentQuestion = computed(() => {
  if (!activeAssessment.value) return null
  return activeAssessment.value.questions[currentQuestionIndex.value]
})

const score = computed(() => {
  if (!activeAssessment.value) return 0
  return userAnswers.value.reduce((acc, answer, index) => {
    return acc + (answer === activeAssessment.value!.questions[index].correctAnswer ? 1 : 0)
  }, 0)
})

const startAssessment = (assessment: Assessment) => {
  activeAssessment.value = assessment
  currentQuestionIndex.value = 0
  selectedOption.value = null
  showResults.value = false
  quizCompleted.value = false
  userAnswers.value = []
  startTime.value = new Date()
}

const closeAssessment = () => {
  activeAssessment.value = null
  if (startTime.value) {
    elapsedTime.value = Date.now() - startTime.value.getTime()
  }
}

const selectOption = (index: number) => {
  if (showResults.value) return
  selectedOption.value = index
}

const submitAnswer = () => {
  if (selectedOption.value === null) return
  
  userAnswers.value[currentQuestionIndex.value] = selectedOption.value
  showResults.value = true
}

const nextQuestion = () => {
  if (currentQuestionIndex.value < activeAssessment.value!.questions.length - 1) {
    currentQuestionIndex.value++
    selectedOption.value = null
    showResults.value = false
  } else {
    // Complete quiz
    quizCompleted.value = true
    if (startTime.value) {
      elapsedTime.value = Date.now() - startTime.value.getTime()
    }
    
    // Mark assessment as completed
    const assessmentIndex = assessments.value.findIndex(a => a.id === activeAssessment.value!.id)
    if (assessmentIndex !== -1) {
      assessments.value[assessmentIndex].completed = true
    }
  }
}

const restartQuiz = () => {
  currentQuestionIndex.value = 0
  selectedOption.value = null
  showResults.value = false
  quizCompleted.value = false
  userAnswers.value = []
  startTime.value = new Date()
}

const formatTime = (milliseconds: number) => {
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.assessments {
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

.assessments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
  margin-top: 32px;
}

.assessment-card {
  cursor: pointer;
  transition: all var(--dur-fast) var(--ease-standard);
}

.assessment-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.assessment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.assessment-info h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--fg-base);
  margin: 0 0 4px 0;
}

.assessment-info p {
  color: var(--fg-muted);
  margin: 0;
  font-size: 14px;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: var(--radius-pill);
  font-size: 12px;
  font-weight: 500;
}

.status-badge.completed {
  background: rgba(34, 197, 94, 0.2);
  color: var(--success);
}

.status-badge.pending {
  background: rgba(245, 158, 11, 0.2);
  color: var(--warning);
}

.assessment-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  font-size: 14px;
  color: var(--fg-subtle);
}

.assessment-actions {
  display: flex;
  justify-content: flex-end;
}

/* Assessment Drawer */
.assessment-overlay {
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

.assessment-drawer {
  background: var(--bg-elev1);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-md);
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid var(--border);
}

.assessment-title h2 {
  font-size: 24px;
  font-weight: 600;
  color: var(--fg-base);
  margin: 0 0 4px 0;
}

.assessment-title p {
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

.drawer-content {
  padding: 24px;
}

/* Quiz Section */
.progress-section {
  margin-bottom: 32px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--fg-muted);
}

.progress-bar {
  height: 8px;
  background: var(--bg-elev2);
  border-radius: var(--radius-pill);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary), var(--secondary));
  border-radius: var(--radius-pill);
  transition: width var(--dur-normal) var(--ease-standard);
}

.question-section {
  margin-bottom: 32px;
}

.question-section h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--fg-base);
  margin: 0 0 24px 0;
  line-height: 1.4;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-button {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: var(--bg-elev2);
  border: 2px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--fg-base);
  cursor: pointer;
  transition: all var(--dur-fast) var(--ease-standard);
  text-align: left;
}

.option-button:hover:not(:disabled) {
  border-color: var(--primary);
  background: var(--bg-elev1);
}

.option-button.selected {
  border-color: var(--primary);
  background: rgba(99, 102, 241, 0.1);
}

.option-button.correct {
  border-color: var(--success);
  background: rgba(34, 197, 94, 0.1);
}

.option-button.incorrect {
  border-color: var(--danger);
  background: rgba(239, 68, 68, 0.1);
}

.option-button:disabled {
  cursor: not-allowed;
}

.option-letter {
  width: 32px;
  height: 32px;
  background: var(--primary);
  color: var(--fg-base);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.option-button.correct .option-letter {
  background: var(--success);
}

.option-button.incorrect .option-letter {
  background: var(--danger);
}

.result-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
}

.result-icon.correct {
  background: var(--success);
  color: white;
}

.result-icon.incorrect {
  background: var(--danger);
  color: white;
}

.question-navigation {
  display: flex;
  justify-content: center;
}

/* Results Section */
.results-section {
  text-align: center;
}

.results-header {
  margin-bottom: 32px;
}

.score-circle {
  width: 120px;
  height: 120px;
  border: 8px solid var(--primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  background: rgba(99, 102, 241, 0.1);
}

.score-text {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.score-number {
  font-size: 32px;
  font-weight: 700;
  color: var(--primary);
}

.score-total {
  font-size: 16px;
  color: var(--fg-muted);
}

.results-header h3 {
  font-size: 28px;
  font-weight: 600;
  color: var(--fg-base);
  margin: 0 0 8px 0;
}

.score-percentage {
  font-size: 18px;
  color: var(--fg-muted);
  margin: 0;
}

.performance-analysis {
  margin-bottom: 32px;
}

.performance-analysis h4 {
  font-size: 20px;
  font-weight: 600;
  color: var(--fg-base);
  margin: 0 0 20px 0;
}

.performance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.performance-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--bg-elev2);
  border-radius: var(--radius-md);
}

.performance-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.performance-icon.correct {
  background: var(--success);
}

.performance-icon.incorrect {
  background: var(--danger);
}

.performance-icon.time {
  background: var(--info);
}

.performance-info {
  display: flex;
  flex-direction: column;
}

.performance-number {
  font-size: 18px;
  font-weight: 600;
  color: var(--fg-base);
}

.performance-label {
  font-size: 12px;
  color: var(--fg-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.results-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

/* Mobile Styles */
@media (max-width: 768px) {
  .assessments-grid {
    grid-template-columns: 1fr;
  }
  
  .assessment-drawer {
    width: 95%;
    max-height: 95vh;
  }
  
  .drawer-header,
  .drawer-content {
    padding: 16px;
  }
  
  .question-section h3 {
    font-size: 18px;
  }
  
  .option-button {
    padding: 12px 16px;
  }
  
  .performance-grid {
    grid-template-columns: 1fr;
  }
  
  .results-actions {
    flex-direction: column;
  }
}
</style>
