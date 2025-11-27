<template>
  <div class="collapsible-chat">
    <button
      @click="toggleChat"
      class="chat-toggle"
      :aria-expanded="isOpen"
      aria-label="Toggle chat"
    >
      <Sparkles :size="20" />
      <span>Assistente IA</span>
      <ChevronDown 
        :size="16" 
        class="chevron"
        :class="{ 'rotated': isOpen }"
      />
    </button>
    
    <div 
      v-if="isOpen"
      class="chat-container"
      v-motion
      :initial="{ opacity: 0, height: 0 }"
      :enter="{ 
        opacity: 1, 
        height: 'auto',
        transition: { 
          duration: 300, 
          ease: 'easeOut' 
        } 
      }"
      :leave="{ 
        opacity: 0, 
        height: 0,
        transition: { 
          duration: 200, 
          ease: 'easeIn' 
        } 
      }"
    >
      <div class="chat-messages">
        <ChatMessage
          v-for="message in messages"
          :key="message.timestamp.getTime()"
          :role="message.role"
          :content="message.content"
        />
        <TypingDots v-if="isTyping" />
      </div>
      
      <form @submit.prevent="sendMessage" class="chat-input-form">
        <input
          v-model="inputMessage"
          type="text"
          placeholder="Digite sua pergunta..."
          class="chat-input"
          :disabled="isTyping"
        />
        <button
          type="submit"
          class="send-button"
          :disabled="!inputMessage.trim() || isTyping"
        >
          Enviar
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Sparkles, ChevronDown } from 'lucide-vue-next'
import ChatMessage from './ChatMessage.vue'
import TypingDots from './TypingDots.vue'
import type { ChatMessage as ChatMessageType } from '@/types'

const isOpen = ref(false)
const inputMessage = ref('')
const isTyping = ref(false)
const messages = ref<ChatMessageType[]>([])

const mockResponses = [
  "Claro! Posso ajudar você com isso. Que tipo de conteúdo você gostaria de estudar?",
  "Excelente pergunta! Vou preparar algumas sugestões personalizadas para você.",
  "Entendi! Vamos criar um plano de estudos que se adapte ao seu ritmo.",
  "Ótima ideia! Posso gerar exercícios específicos sobre esse tópico.",
  "Perfeito! Vou organizar o material de forma mais eficiente para você."
]

const toggleChat = () => {
  isOpen.value = !isOpen.value
}

const sendMessage = async () => {
  if (!inputMessage.value.trim() || isTyping.value) return

  // Add user message
  messages.value.push({
    role: 'user',
    content: inputMessage.value,
    timestamp: new Date()
  })

  const userInput = inputMessage.value
  inputMessage.value = ''
  isTyping.value = true

  // Simulate AI response delay
  setTimeout(() => {
    const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)]
    messages.value.push({
      role: 'assistant',
      content: randomResponse,
      timestamp: new Date()
    })
    isTyping.value = false
  }, 1500)
}
</script>

<style scoped>
.collapsible-chat {
  background: var(--bg-elev1);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  margin-bottom: 24px;
  backdrop-filter: blur(12px);
  overflow: hidden;
}

.chat-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: transparent;
  border: none;
  color: var(--fg-base);
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--dur-fast) var(--ease-standard);
}

.chat-toggle:hover {
  background: var(--bg-elev2);
}

.chevron {
  margin-left: auto;
  transition: transform var(--dur-normal) var(--ease-standard);
}

.chevron.rotated {
  transform: rotate(180deg);
}

.chat-container {
  border-top: 1px solid var(--border);
  padding: 20px;
}

.chat-messages {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 16px;
  padding-right: 8px;
}

.chat-messages::-webkit-scrollbar {
  width: 4px;
}

.chat-messages::-webkit-scrollbar-track {
  background: var(--bg-elev2);
  border-radius: 2px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 2px;
}

.chat-input-form {
  display: flex;
  gap: 12px;
}

.chat-input {
  flex: 1;
  padding: 12px 16px;
  background: var(--bg-elev2);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--fg-base);
  font-size: 14px;
  outline: none;
  transition: all var(--dur-fast) var(--ease-standard);
}

.chat-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(99,102,241,0.2);
}

.chat-input::placeholder {
  color: var(--fg-subtle);
}

.send-button {
  padding: 12px 20px;
  background: var(--primary);
  color: var(--fg-base);
  border: none;
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--dur-fast) var(--ease-standard);
}

.send-button:hover:not(:disabled) {
  background: var(--primary-600);
  transform: scale(1.02);
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}
</style>
