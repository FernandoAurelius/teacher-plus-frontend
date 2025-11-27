<template>
  <div class="wizard-chat">
    <StaticIcons />
    <!-- Header -->
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
            <path d="M6 12v5c3 3 9 3 12 0v-5"/>
          </svg>
          <h1>TeacherPlus</h1>
        </div>
        <Button 
          @click="startChat"
          variant="primary"
          class="cta-button"
          :class="{ 'hidden': chatStarted }"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z"/>
            <path d="M18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z"/>
          </svg>
          Começar
        </Button>
      </div>
    </header>

    <!-- Chat Area -->
    <main class="chat-main">
      <div class="chat-container">
        <!-- Welcome Message -->
        <div class="welcome-section" :class="{ 'hidden': chatStarted }">
          <div 
            class="welcome-content"
            v-motion
            :initial="{ opacity: 0, y: 24 }"
            :enter="{ 
              opacity: 1, 
              y: 0, 
              transition: { 
                duration: 600, 
                ease: 'easeOut' 
              } 
            }"
          >
            <h2>Seu assistente pessoal de estudos</h2>
            <p>Vamos criar um plano de estudos personalizado para você. Responda algumas perguntas e deixe a IA fazer o resto!</p>
          </div>
        </div>

        <!-- Chat Messages -->
        <div class="messages-area" :class="{ 'hidden': !chatStarted }">
          <ChatMessage
            v-for="message in messages"
            :key="message.timestamp.getTime()"
            :role="message.role"
            :content="message.content"
          />
          <TypingDots v-if="isTyping" />
        </div>

        <!-- Input Area -->
        <div class="input-area" :class="{ 'hidden': !chatStarted || isCompleted }">
          <form @submit.prevent="sendMessage" class="input-form">
            <input
              ref="inputRef"
              v-model="currentInput"
              type="text"
              :placeholder="currentQuestion?.placeholder || ''"
              class="chat-input"
              :disabled="isTyping"
            />
            <Button
              type="submit"
              :disabled="!currentInput.trim() || isTyping"
              variant="primary"
            >
              Enviar
            </Button>
          </form>
        </div>

        <!-- Completion Area -->
        <div class="completion-area" :class="{ 'hidden': !isCompleted }">
          <div 
            class="completion-content"
            v-motion
            :initial="{ opacity: 0, scale: 0.95 }"
            :enter="{ 
              opacity: 1, 
              scale: 1, 
              transition: { 
                duration: 500, 
                ease: 'easeOut' 
              } 
            }"
          >
            <div class="success-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 6 9 17l-5-5"/>
              </svg>
            </div>
            <h3>Perfeito! Seu perfil está completo</h3>
            <p>Agora vamos criar seu plano de estudos personalizado.</p>
            <Button
              @click="goToDashboard"
              variant="primary"
              size="lg"
              class="dashboard-button"
            >
              Ir para o painel
            </Button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, computed } from 'vue'
import { useRouter } from 'vue-router'
import ChatMessage from '@/components/ChatMessage.vue'
import TypingDots from '@/components/TypingDots.vue'
import Button from '@/components/ui/Button.vue'
import StaticIcons from '@/components/StaticIcons.vue'
import type { ChatMessage as ChatMessageType, UserContext } from '@/types'

const router = useRouter()

const chatStarted = ref(false)
const isTyping = ref(false)
const isCompleted = ref(false)
const currentInput = ref('')
const inputRef = ref<HTMLInputElement>()
const messages = ref<ChatMessageType[]>([])
const currentQuestionIndex = ref(0)
const userContext = ref<Partial<UserContext>>({})

const questions = [
  {
    key: 'persona',
    question: 'Olá! Sou seu assistente de estudos. Para começar, me conte: você é estudante, professor ou profissional buscando se capacitar?',
    placeholder: 'Ex: Sou estudante do ensino médio...'
  },
  {
    key: 'goal',
    question: 'Ótimo! Qual é seu principal objetivo de estudo no momento?',
    placeholder: 'Ex: Quero passar no ENEM...'
  },
  {
    key: 'deadline',
    question: 'Entendi! Você tem algum prazo específico para alcançar esse objetivo?',
    placeholder: 'Ex: Tenho 6 meses até a prova...'
  },
  {
    key: 'weeklyTimeHours',
    question: 'Perfeito! Quantas horas por semana você pode dedicar aos estudos?',
    placeholder: 'Ex: Posso estudar 10 horas por semana...'
  },
  {
    key: 'studyRoutine',
    question: 'Ótimo! Como você prefere organizar sua rotina de estudos?',
    placeholder: 'Ex: Prefiro estudar de manhã...'
  },
  {
    key: 'backgroundLevel',
    question: 'Entendi! Como você avalia seu nível atual no assunto que quer estudar?',
    placeholder: 'Ex: Sou iniciante em matemática...'
  },
  {
    key: 'preferencesLanguage',
    question: 'Por último, você tem alguma preferência de formato de conteúdo ou metodologia?',
    placeholder: 'Ex: Prefiro videoaulas e exercícios práticos...'
  }
]

const currentQuestion = computed(() => questions[currentQuestionIndex.value])

const startChat = async () => {
  chatStarted.value = true
  await nextTick()
  
  // Add first question
  setTimeout(() => {
    messages.value.push({
      role: 'assistant',
      content: currentQuestion.value.question,
      timestamp: new Date()
    })
  }, 500)
}

const sendMessage = async () => {
  if (!currentInput.value.trim() || isTyping.value) return

  // Add user message
  messages.value.push({
    role: 'user',
    content: currentInput.value,
    timestamp: new Date()
  })

  // Store user response
  const questionKey = currentQuestion.value.key as keyof UserContext
  if (questionKey === 'weeklyTimeHours') {
    // Extract number from response
    const hours = parseInt(currentInput.value.match(/\d+/)?.[0] || '0')
    userContext.value[questionKey] = hours
  } else {
    userContext.value[questionKey] = currentInput.value
  }

  currentInput.value = ''
  isTyping.value = true

  // Move to next question or complete
  setTimeout(() => {
    currentQuestionIndex.value++
    
    if (currentQuestionIndex.value < questions.length) {
      // Add next question
      messages.value.push({
        role: 'assistant',
        content: currentQuestion.value.question,
        timestamp: new Date()
      })
      isTyping.value = false
      
      // Focus input
      nextTick(() => {
        inputRef.value?.focus()
      })
    } else {
      // Complete onboarding
      messages.value.push({
        role: 'assistant',
        content: 'Excelente! Tenho todas as informações que preciso. Vou preparar um plano de estudos personalizado para você.',
        timestamp: new Date()
      })
      
      setTimeout(() => {
        isCompleted.value = true
        isTyping.value = false
      }, 2000)
    }
  }, 1200)
}

const goToDashboard = () => {
  // Store user context (in a real app, this would be saved to backend)
  localStorage.setItem('userContext', JSON.stringify(userContext.value))
  router.push('/app/planos')
}
</script>

<style scoped>
.wizard-chat {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  padding: 20px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--fg-base);
}

.logo h1 {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.cta-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--neo-cta-glow);
  box-shadow: var(--shadow-glow);
  transition: all var(--dur-normal) var(--ease-standard);
}

.cta-button:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-glow), var(--shadow-md);
}

.cta-button.hidden {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}

.hidden {
  display: none;
}

.chat-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
}

.chat-container {
  width: 100%;
  max-width: 800px;
  min-height: 500px;
  display: flex;
  flex-direction: column;
}

.welcome-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.welcome-content h2 {
  font-size: 48px;
  font-weight: 700;
  color: var(--fg-base);
  margin: 0 0 16px 0;
  line-height: 1.2;
}

.welcome-content p {
  font-size: 20px;
  color: var(--fg-muted);
  margin: 0;
  line-height: 1.6;
  max-width: 600px;
}

.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 20px 0;
  max-height: 500px;
}

.messages-area::-webkit-scrollbar {
  width: 6px;
}

.messages-area::-webkit-scrollbar-track {
  background: transparent;
}

.messages-area::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 3px;
}

.input-area {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
}

.input-form {
  display: flex;
  gap: 16px;
  align-items: flex-end;
}

.chat-input {
  flex: 1;
  padding: 16px 20px;
  background: var(--bg-elev1);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  color: var(--fg-base);
  font-size: 16px;
  line-height: 1.5;
  outline: none;
  transition: all var(--dur-fast) var(--ease-standard);
  min-height: 56px;
  resize: none;
}

.chat-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
}

.chat-input::placeholder {
  color: var(--fg-subtle);
}

.completion-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 0;
}

.completion-content {
  max-width: 500px;
}

.success-icon {
  width: 80px;
  height: 80px;
  background: var(--success);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  color: white;
}

.completion-content h3 {
  font-size: 32px;
  font-weight: 600;
  color: var(--fg-base);
  margin: 0 0 16px 0;
}

.completion-content p {
  font-size: 18px;
  color: var(--fg-muted);
  margin: 0 0 32px 0;
  line-height: 1.6;
}

.dashboard-button {
  background: var(--neo-cta-glow);
  box-shadow: var(--shadow-glow);
}

.dashboard-button:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-glow), var(--shadow-md);
}

/* Responsive */
@media (max-width: 768px) {
  .header-content {
    padding: 0 16px;
  }
  
  .chat-main {
    padding: 20px 16px;
  }
  
  .welcome-content h2 {
    font-size: 36px;
  }
  
  .welcome-content p {
    font-size: 18px;
  }
  
  .input-form {
    flex-direction: column;
    gap: 12px;
  }
  
  .completion-content h3 {
    font-size: 28px;
  }
}
</style>
