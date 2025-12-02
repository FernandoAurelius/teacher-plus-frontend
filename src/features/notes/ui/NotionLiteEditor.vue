<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref, watch } from "vue"

const props = defineProps<{
  modelValue?: string
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void
}>()

const editorRef = ref<HTMLDivElement | null>(null)
const showSlashMenu = ref(false)
const slashPosition = reactive({ x: 0, y: 0 })
const savedRange = ref<Range | null>(null)

const commands = [
  { label: "Título 1", action: () => applyBlock("h1") },
  { label: "Título 2", action: () => applyBlock("h2") },
  { label: "Título 3", action: () => applyBlock("h3") },
  { label: "Parágrafo", action: () => applyBlock("p") },
  { label: "Lista", action: () => exec("insertUnorderedList") },
  { label: "Lista numerada", action: () => exec("insertOrderedList") },
  { label: "Checklist", action: () => insertChecklist() },
  { label: "Citação", action: () => applyBlock("blockquote") },
  { label: "Código", action: () => insertCodeBlock() },
  { label: "Link", action: () => insertLink() },
]

onMounted(() => {
  if (editorRef.value && props.modelValue) {
    editorRef.value.innerHTML = props.modelValue
  }
  document.addEventListener("click", handleGlobalClick)
})

onBeforeUnmount(() => {
  document.removeEventListener("click", handleGlobalClick)
})

watch(
  () => props.modelValue,
  (value) => {
    if (editorRef.value && value !== editorRef.value.innerHTML) {
      editorRef.value.innerHTML = value ?? ""
    }
  },
)

const handleInput = () => {
  if (!editorRef.value) return
  emit("update:modelValue", editorRef.value.innerHTML)
}

const ensureFocus = () => {
  if (!editorRef.value) return
  editorRef.value.focus()
  if (savedRange.value) {
    const selection = window.getSelection()
    selection?.removeAllRanges()
    selection?.addRange(savedRange.value)
  }
}

const exec = (command: string, value?: string) => {
  ensureFocus()
  document.execCommand(command, false, value)
  handleInput()
}

const applyBlock = (block: "p" | "h1" | "h2" | "h3" | "blockquote") => {
  ensureFocus()
  document.execCommand("formatBlock", false, block)
  handleInput()
}

const insertCodeBlock = () => {
  ensureFocus()
  const snippet =
    '<pre class="rounded-lg bg-slate-900 px-3 py-3 text-slate-100 overflow-auto"><code>// Digite seu código...</code></pre>'
  document.execCommand("insertHTML", false, snippet)
  handleInput()
}

const insertLink = () => {
  const url = prompt("URL")
  if (url) exec("createLink", url)
}

const insertChecklist = () => {
  ensureFocus()
  const snippet = `<div data-type="checklist"><label><input type="checkbox" /> Tarefa</label></div>`
  document.execCommand("insertHTML", false, snippet)
  handleInput()
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "/") {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return
    const range = selection.getRangeAt(0).cloneRange()
    savedRange.value = range
    const rect = range.getBoundingClientRect()
    slashPosition.x = rect.left
    slashPosition.y = rect.top + rect.height
    showSlashMenu.value = true
  }
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "b") {
    event.preventDefault()
    exec("bold")
  }
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "i") {
    event.preventDefault()
    exec("italic")
  }
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "u") {
    event.preventDefault()
    exec("underline")
  }
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "e") {
    event.preventDefault()
    insertCodeBlock()
  }
}

const handleGlobalClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest("[data-slash-menu]") && !target.closest("[contenteditable]")) {
    showSlashMenu.value = false
  }
}

const applyCommand = (action: () => void) => {
  ensureFocus()
  action()
  showSlashMenu.value = false
}
</script>

<template>
  <div class="space-y-3">
    <div class="flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-white/80 px-2 py-1 text-xs font-semibold text-slate-600">
      <button type="button" class="rounded px-2 py-1 hover:bg-slate-100" @click="applyBlock('p')">Texto</button>
      <button type="button" class="rounded px-2 py-1 hover:bg-slate-100" @click="applyBlock('h1')">H1</button>
      <button type="button" class="rounded px-2 py-1 hover:bg-slate-100" @click="applyBlock('h2')">H2</button>
      <button type="button" class="rounded px-2 py-1 hover:bg-slate-100" @click="applyBlock('h3')">H3</button>
      <button type="button" class="rounded px-2 py-1 hover:bg-slate-100" @click="exec('bold')">B</button>
      <button type="button" class="rounded px-2 py-1 hover:bg-slate-100" @click="exec('italic')">I</button>
      <button type="button" class="rounded px-2 py-1 hover:bg-slate-100" @click="exec('insertUnorderedList')">Lista</button>
      <button type="button" class="rounded px-2 py-1 hover:bg-slate-100" @click="exec('insertOrderedList')">Lista 1.</button>
      <button type="button" class="rounded px-2 py-1 hover:bg-slate-100" @click="insertChecklist">Checklist</button>
      <button type="button" class="rounded px-2 py-1 hover:bg-slate-100" @click="insertCodeBlock">Code</button>
      <button type="button" class="rounded px-2 py-1 hover:bg-slate-100" @click="insertLink">Link</button>
      <button type="button" class="rounded px-2 py-1 hover:bg-slate-100" @click="exec('undo')">Undo</button>
      <button type="button" class="rounded px-2 py-1 hover:bg-slate-100" @click="exec('redo')">Redo</button>
    </div>
    <div
      ref="editorRef"
      class="min-h-[280px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-foreground shadow-inner outline-none focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30 prose prose-slate max-w-none"
      contenteditable="true"
      :placeholder="placeholder ?? 'Escreva aqui suas anotações, títulos, listas ou código...'"
      @input="handleInput"
      @keydown="handleKeydown"
    ></div>

    <div
      v-if="showSlashMenu"
      data-slash-menu
      class="fixed z-50 w-56 rounded-lg border border-slate-200 bg-white p-2 shadow-lg"
      :style="{ left: `${slashPosition.x}px`, top: `${slashPosition.y + 12}px` }"
    >
      <p class="px-2 pb-1 text-xs font-semibold text-slate-500">Inserir bloco</p>
      <button
        v-for="cmd in commands"
        :key="cmd.label"
        type="button"
        class="w-full rounded px-2 py-1 text-left text-sm hover:bg-slate-100"
        @click="applyCommand(cmd.action)"
      >
        {{ cmd.label }}
      </button>
    </div>
  </div>
</template>
