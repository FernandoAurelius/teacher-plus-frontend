<script setup lang="ts">
import { ref } from "vue"

const props = defineProps<{
  summary?: string
  content?: string
}>()

const isExpanded = ref(false)
</script>

<div class="rounded-xl border bg-card p-4 text-card-foreground shadow-sm">
  <p class="text-sm text-muted-foreground">Resumo</p>
  <p class="mt-2 text-base leading-relaxed text-foreground">
    {{ props.summary ?? "Sem resumo cadastrado." }}
  </p>

  <div v-if="props.content" class="mt-3">
    <button
      class="text-sm font-semibold text-primary underline underline-offset-4"
      type="button"
      @click="isExpanded = !isExpanded"
    >
      {{ isExpanded ? "Ocultar detalhes" : "Ver detalhes" }}
    </button>
    <p v-if="isExpanded" class="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground">
      {{ props.content }}
    </p>
  </div>
</div>
