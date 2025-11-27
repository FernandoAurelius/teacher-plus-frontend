<template>
  <div 
    class="chat-message"
    :class="{
      'user-message': role === 'user',
      'assistant-message': role === 'assistant'
    }"
    v-motion
    :initial="role === 'assistant' ? { opacity: 0, y: 12 } : {}"
    :enter="role === 'assistant' ? { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 400, 
        ease: 'easeOut',
        delay: 100
      } 
    } : {}"
  >
    <div class="message-content">
      <div v-if="role === 'assistant'" class="avatar">
        <GraduationCap :size="20" />
      </div>
      <div class="message-text">
        <span 
          v-if="role === 'assistant' && isTyping"
          class="typewriter-text"
          :key="content"
        >
          {{ displayedContent }}
        </span>
        <span v-else>{{ content }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { GraduationCap } from 'lucide-vue-next'

interface Props {
  role: 'user' | 'assistant'
  content: string
}

const props = defineProps<Props>()

const displayedContent = ref('')
const isTyping = ref(false)

const typewriterEffect = () => {
  if (props.role !== 'assistant') {
    displayedContent.value = props.content
    return
  }

  isTyping.value = true
  displayedContent.value = ''
  
  let i = 0
  const typeInterval = setInterval(() => {
    if (i < props.content.length) {
      displayedContent.value += props.content.charAt(i)
      i++
    } else {
      clearInterval(typeInterval)
      isTyping.value = false
    }
  }, 30)
}

onMounted(() => {
  if (props.role === 'assistant') {
    setTimeout(typewriterEffect, 200)
  } else {
    displayedContent.value = props.content
  }
})

watch(() => props.content, () => {
  if (props.role === 'assistant') {
    typewriterEffect()
  } else {
    displayedContent.value = props.content
  }
})
</script>

<style scoped>
.chat-message {
  margin-bottom: 16px;
  width: 100%;
}

.user-message {
  display: flex;
  justify-content: flex-end;
}

.assistant-message {
  display: flex;
  justify-content: flex-start;
}

.message-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  max-width: 80%;
}

.user-message .message-content {
  flex-direction: row-reverse;
}

.avatar {
  width: 32px;
  height: 32px;
  background: var(--primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--fg-base);
  flex-shrink: 0;
}

.message-text {
  background: var(--bg-elev1);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 12px 16px;
  color: var(--fg-base);
  line-height: 1.5;
  backdrop-filter: blur(8px);
}

.user-message .message-text {
  background: var(--primary);
  color: var(--fg-base);
  border-color: var(--primary);
}

.typewriter-text::after {
  content: '|';
  animation: blink 1s infinite;
  color: var(--primary);
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .typewriter-text::after {
    animation: none;
    opacity: 0;
  }
}
</style>
