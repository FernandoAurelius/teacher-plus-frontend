<template>
  <div class="relative h-full max-h-dvh overflow-hidden flex flex-col">

    <!-- Área rolável apenas do chat -->
    <div ref="scrollRef" class="flex-1 overflow-y-auto overscroll-contain scroll-smooth">
      <div class="min-h-full flex flex-col justify-end space-y-3 px-4 pt-4 pb-28">
        <div class="chat-message-fade" v-for="(m, i) in messages" :key="i">
          <div v-if="m.role === 'assistant'" class="flex items-start gap-3">
            <Bot class="h-5 w-5 text-primary mt-1 flex-shrink-0" />
            <div class="rounded-2xl border border-border bg-muted/70 backdrop-blur px-4 py-3 shadow-sm
                   w-fit max-w-[min(75ch,calc(100%-4rem))] break-words">
              <ChatMarkdown :source="m.content" />
            </div>
          </div>

          <div v-else class="flex items-start justify-end gap-3">
            <div class="rounded-2xl border border-border bg-card/90 backdrop-blur px-4 py-3 shadow-sm
                    w-fit max-w-[min(75ch,calc(100%-4rem))] break-words text-right">
              <p class="leading-relaxed whitespace-pre-wrap">{{ m.content }}</p>
            </div>
            <User class="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
          </div>
        </div>

        <div v-if="isThinking" class="chat-message-fade">
          <div class="flex items-start gap-3">
            <Bot class="h-5 w-5 text-primary mt-1 flex-shrink-0" />
            <div class="rounded-2xl border border-border bg-muted/70 backdrop-blur px-4 py-3 shadow-sm
                    w-fit max-w-[min(75ch,calc(100%-4rem))] break-words">
              <IAThinking />
            </div>
          </div>
        </div>

        <div id="chat-end"></div>
      </div>
    </div>

    <!-- Barra fixa do input (dentro do componente, não da página) -->
    <div class="absolute bottom-0 left-0 right-0 flex gap-2 p-4 bg-background border-t">
      <input v-model="input" @keydown.enter.prevent="onSend" type="text" :disabled="showPasswordPopup || isSigningUp"
        placeholder="Digite sua resposta…" class="flex-1 px-3 py-2 rounded-lg border border-input bg-background
               hover:border-input hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50" />
      <button @click="onSend" :disabled="showPasswordPopup || isSigningUp" class="px-4 py-2 rounded-lg bg-primary text-primary-foreground
               hover:bg-primary/90 active:scale-[.98] transition disabled:opacity-50">
        Enviar
      </button>
    </div>

    <!-- Modal de Confirmação -->
    <div v-if="showConfirmationModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-card rounded-xl border border-border shadow-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div class="p-6">
          <h3 class="text-lg font-semibold mb-4">Confirmar Dados do Cadastro</h3>

          <div class="space-y-3 mb-6">
            <p class="text-sm text-muted-foreground">
              Revise as informações coletadas e confirme para criar sua conta:
            </p>

            <div class="bg-muted/30 rounded-lg p-4 space-y-2">
              <div class="flex justify-between text-sm">
                <span class="font-medium">Nome:</span>
                <span class="text-right">{{ userData.first_name }} {{ userData.last_name }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="font-medium">Email:</span>
                <span class="text-right">{{ userData.email }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="font-medium">Usuário:</span>
                <span class="text-right">{{ userData.username }}</span>
              </div>
            </div>
          </div>

          <div class="flex gap-3">
            <button @click="denyConfirmation"
              class="flex-1 px-4 py-2 rounded-lg border border-border hover:bg-muted/50 transition">
              Não confirmar
            </button>
            <button @click="confirmAndSignup" :disabled="isSigningUp"
              class="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition">
              {{ isSigningUp ? 'Criando conta...' : 'Confirmar' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Popup de Senha -->
    <Dialog v-model:open="showPasswordPopup">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Definir Senha</DialogTitle>
        </DialogHeader>

        <div class="space-y-4">
          <div>
            <Label for="password">Senha</Label>
            <div class="relative">
              <Input id="password" :type="showPassword ? 'text' : 'password'" v-model="passwordInput" />
              <button @click="showPassword = !showPassword" class="absolute right-2 top-1/2 -translate-y-1/2"
                type="button">
                <Eye v-if="!showPassword" class="h-4 w-4" />
                <EyeOff v-else class="h-4 w-4" />
              </button>
            </div>
          </div>

          <div>
            <Label for="confirmPassword">Confirmar Senha</Label>
            <div class="relative">
              <Input id="confirmPassword" :type="showConfirmPassword ? 'text' : 'password'"
                v-model="confirmPasswordInput" />
              <button @click="showConfirmPassword = !showConfirmPassword"
                class="absolute right-2 top-1/2 -translate-y-1/2" type="button">
                <Eye v-if="!showConfirmPassword" class="h-4 w-4" />
                <EyeOff v-else class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose as-child>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button @click="confirmPassword">Confirmar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import { Bot, User, Eye, EyeOff } from 'lucide-vue-next'
import IAThinking from '@/features/wizard-chat/ui/IAThinking.vue'
import ChatMarkdown from '@/features/wizard-chat/ui/ChatMarkdown.vue'
import { useAuth } from '@/features/auth/lib/useAuth'
import type { ChatMsg } from '@/features/wizard-chat/lib/useWizardChat'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Button } from '@/shared/ui/button'

const { signup } = useAuth()

const messages = ref<ChatMsg[]>([])
const input = ref('')
const isThinking = ref(false)
const showConfirmationModal = ref(false)
const isSigningUp = ref(false)
const showPasswordPopup = ref(false)
const passwordInput = ref('')
const confirmPasswordInput = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const userData = ref({
  first_name: '',
  last_name: '',
  email: '',
  username: '',
  password: '',
  confirmPassword: ''
})

// ⚠️ Removemos a pergunta "Confirme sua senha:"
const questions = [
  { key: 'first_name', question: 'Olá! Vamos começar seu cadastro. Qual é o seu primeiro nome?' },
  { key: 'last_name', question: 'Nome bonito, {first_name}! Agora preciso do seu sobrenome...' },
  { key: 'email', question: '{first_name}, qual é o seu endereço de email?' },
  { key: 'username', question: '{first_name}, qual username você vai escolher? Você o utilizará para logar na sua conta' },
  { key: 'password', question: 'Beleza, {first_name}! Pra fechar, uma caixa de diálogo vai aparecer em alguns instantes pra você preencher sua senha.' },
] as const

let currentQuestionIndex = 0

const emit = defineEmits<{ signupComplete: [] }>()

onMounted(() => {
  startChat()
})

const scrollRef = ref<HTMLElement | null>(null)

function scrollToEnd() {
  nextTick(() => {
    const el = scrollRef.value
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  })
}

function startChat() {
  messages.value.push({
    role: 'assistant',
    content: getQuestionText(questions[0].question)
  })
  scrollToEnd()
}

function getQuestionText(question: string): string {
  return question.replace(/\{(\w+)\}/g, (_, k) => (userData.value as any)[k] || '')
}

async function onSend() {
  const trimmed = input.value.trim()
  if (!trimmed) return

  // Se estamos na etapa de password, ignore entrada manual no chat
  if (questions[currentQuestionIndex]?.key === 'password') {
    input.value = ''
    return
  }

  messages.value.push({ role: 'user', content: trimmed })
  input.value = ''

  isThinking.value = true
  await new Promise(resolve => setTimeout(resolve, 600))
  isThinking.value = false

  processAnswer(trimmed)
  scrollToEnd()
}

function processAnswer(answer: string) {
  const current = questions[currentQuestionIndex]

  // Guarda a resposta da pergunta atual
  userData.value[current.key as keyof typeof userData.value] = answer

  // Avança para a próxima pergunta
  currentQuestionIndex++

  if (currentQuestionIndex < questions.length) {
    const nextQ = questions[currentQuestionIndex]
    messages.value.push({
      role: 'assistant',
      content: getQuestionText(nextQ.question)
    })
    scrollToEnd()

    // Se a próxima é a de senha, abre o popup imediatamente
    if (nextQ.key === 'password') {
      setTimeout(() => { showPasswordPopup.value = true }, 500)
    }
    // Não avançamos o índice aqui: aguardamos o usuário confirmar no popup
    return
  }

  // Se acabou, valida e mostra confirmação
  if (validateData()) {
    showConfirmationModal.value = true
  } else {
    resetFlowWithError()
  }
}

function validateData(): boolean {
  return (
    userData.value.first_name.length > 0 &&
    userData.value.last_name.length > 0 &&
    userData.value.email.includes('@') &&
    userData.value.username.length > 0 &&
    userData.value.password.length >= 6 &&
    userData.value.password === userData.value.confirmPassword
  )
}

function resetFlowWithError() {
  messages.value.push({
    role: 'assistant',
    content: 'Parece que há um problema com os dados fornecidos. Vamos tentar novamente. Qual é o seu primeiro nome?'
  })
  currentQuestionIndex = 0
  userData.value = {
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  }
  scrollToEnd()
}

function denyConfirmation() {
  showConfirmationModal.value = false
  resetFlow()
}

function resetFlow() {
  currentQuestionIndex = 0
  userData.value = {
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  }
  messages.value = []
  startChat()
}

function confirmPassword() {
  userData.value.password = passwordInput.value
  userData.value.confirmPassword = confirmPasswordInput.value

  showPasswordPopup.value = false
  passwordInput.value = ''
  confirmPasswordInput.value = ''
  showPassword.value = false
  showConfirmPassword.value = false

  // Avança além da etapa 'password'
  currentQuestionIndex++

  if (currentQuestionIndex >= questions.length) {
    if (validateData()) {
      showConfirmationModal.value = true
    } else {
      resetFlowWithError()
    }
  } else {
    // (Fluxo padrão, mas na prática não haverá mais perguntas após senha)
    messages.value.push({
      role: 'assistant',
      content: getQuestionText(questions[currentQuestionIndex].question)
    })
    scrollToEnd()
  }
}

async function confirmAndSignup() {
  isSigningUp.value = true
  try {
    await signup({
      username: userData.value.username,
      email: userData.value.email,
      first_name: userData.value.first_name,
      last_name: userData.value.last_name,
      password: userData.value.password
    })
    emit('signupComplete')
  } catch (error) {
    console.error('Erro no cadastro:', error)
    messages.value.push({
      role: 'assistant',
      content: 'Houve um erro ao criar sua conta. Por favor, tente novamente.'
    })
  } finally {
    isSigningUp.value = false
  }
}
</script>

<style scoped>
.chat-message-fade {
  animation: chatFadeIn 0.6s ease-out;
}

@keyframes chatFadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Floating icons animation */
@keyframes float {

  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }

  50% {
    transform: translateY(-10px) rotate(5deg);
  }
}

</style>
