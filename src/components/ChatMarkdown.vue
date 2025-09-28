<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import MarkdownIt from 'markdown-it'
import DOMPurify from 'dompurify'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css' // tema

const props = defineProps<{ source: string }>()

// markdown-it com hook de highlight
const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  highlight: (code, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value
    }
    return '' // fallback: deixa o markdown-it escapar
  }
})

const html = ref('')
let t: number | null = null
function render() {
  const dirty = md.render(props.source || '')
  html.value = DOMPurify.sanitize(dirty) // XSS guard
}

watch(() => props.source, () => {
  if (t) window.clearTimeout(t)
  t = window.setTimeout(() => { render(); t = null }, 80)
})

onMounted(render)
</script>

<template>
  <div class="prose prose-sm dark:prose-invert chat-md" v-html="html" />
</template>

<style scoped>
.chat-md pre { padding: .75rem; border-radius: .75rem; }
.chat-md code, .chat-md pre { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono","Courier New", monospace; }
</style>
