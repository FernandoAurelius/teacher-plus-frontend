<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue"

const props = defineProps<{
  storageKey: string
  placeholder?: string
}>()

const status = ref<"idle" | "ready" | "error">("idle")
const errorMessage = ref("")
const editorHolder = ref<HTMLDivElement | null>(null)
let editor: any = null

const isClient = typeof window !== "undefined"

const loadFromStorage = () => {
  if (!isClient) return null
  const raw = window.localStorage.getItem(props.storageKey)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

const saveToStorage = (data: unknown) => {
  if (!isClient) return

  // Persistência local
  window.localStorage.setItem(props.storageKey, JSON.stringify(data))

  // TODO: enviar para API quando houver backend:
  // await api.notes.save({ key: props.storageKey, data })
}

onMounted(async () => {
  if (!isClient) return

  try {
    const [
      { default: EditorJS },
      { default: Header },
      { default: List },
      { default: Checklist },
      { default: CodeTool },
      { default: Quote },
      { default: InlineCode },
    ] = await Promise.all([
      import("@editorjs/editorjs"),
      import("@editorjs/header"),
      import("@editorjs/list"),
      import("@editorjs/checklist"),
      import("@editorjs/code"),
      import("@editorjs/quote"),
      import("@editorjs/inline-code"),
    ])

    const initialData = loadFromStorage()

    editor = new EditorJS({
      holder: editorHolder.value as HTMLElement,
      logLevel: "ERROR",
      minHeight: 0,
      placeholder: props.placeholder ?? "Escreva suas anotações aqui, como em uma página do Notion...",
      inlineToolbar: ["bold", "italic", "link", "inlineCode"],
      tools: {
        header: {
          class: Header,
          inlineToolbar: true,
          config: {
            levels: [2, 3, 4],
            defaultLevel: 3,
          },
        },
        list: {
          class: List,
          inlineToolbar: true,
        },
        checklist: {
          class: Checklist,
          inlineToolbar: true,
        },
        quote: {
          class: Quote,
          inlineToolbar: true,
          config: {
            quotePlaceholder: "Escreva uma citação...",
            captionPlaceholder: "Autor ou contexto...",
          },
        },
        code: CodeTool,
        inlineCode: InlineCode,
        // paragraph é padrão do EditorJS, não precisa registrar
      },
      data:
        initialData ??
        ({
          time: Date.now(),
          blocks: [
            {
              type: "paragraph",
              data: {
                text: "Use este espaço para organizar ideias, resumos e insights das tarefas deste dia.",
              },
            },
          ],
        } as any),
      onReady: () => {
        status.value = "ready"
      },
      async onChange(api) {
        const output = await api.saver.save()
        saveToStorage(output)
      },
    })
  } catch (error) {
    console.error("Erro ao iniciar EditorJS", error)
    status.value = "error"
    errorMessage.value = "Não foi possível carregar o editor de anotações."
  }
})

onBeforeUnmount(() => {
  if (editor && editor.destroy) {
    editor.destroy()
  }
})
</script>

<template>
  <div class="flex flex-col gap-2 h-full">
    <p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
      Anotações inteligentes
    </p>

    <div
      class="flex-1 rounded-2xl border border-slate-200 bg-white/90 shadow-inner transition
             hover:border-slate-300 focus-within:border-slate-300 focus-within:ring-2
             focus-within:ring-slate-200/80"
    >
      <div
        ref="editorHolder"
        class="min-h-[260px] max-h-[540px] w-full overflow-y-auto px-4 py-3 text-sm leading-relaxed text-slate-800"
      ></div>
    </div>

    <p v-if="status === 'error'" class="text-xs text-destructive">
      {{ errorMessage }}
    </p>
  </div>
</template>
