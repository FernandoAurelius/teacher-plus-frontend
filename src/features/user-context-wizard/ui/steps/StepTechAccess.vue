<script setup lang="ts">
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import Input from '@/shared/ui/input/Input.vue'

const deviceOptions = [
  { label: 'Notebook/PC', value: 'desktop' },
  { label: 'Celular', value: 'mobile' },
  { label: 'Tablet', value: 'tablet' },
]

const connectivityOptions = [
  { label: 'Boa e estável', value: 'stable' },
  { label: 'Instável às vezes', value: 'unstable' },
  { label: 'Acesso offline ocasional', value: 'offline' },
]

const accessibilityOptions = [
  { label: 'Leitor de tela', value: 'screen_reader' },
  { label: 'Alto contraste', value: 'high_contrast' },
  { label: 'Legendas / transcrições', value: 'captions' },
]

const toggleValue = (value: string, current: string[]) => {
  const set = new Set(current || [])
  if (set.has(value)) {
    set.delete(value)
  } else {
    set.add(value)
  }
  const next = Array.from(set)
  console.log('[wizard] toggle accessibility', { value, current, next })
  return next
}
</script>

<template>
  <div class="grid gap-4 animate-[fadeInUp_0.35s_ease-out]">
    <p class="text-sm text-muted-foreground">
      Ajustamos entregas de acordo com seu dispositivo e necessidades de acessibilidade.
    </p>

    <FormField name="tech_device" v-slot="{ field }">
      <FormItem>
        <FormLabel>Seu dispositivo principal</FormLabel>
        <FormControl>
          <div class="grid gap-2 md:grid-cols-3">
            <label
              v-for="option in deviceOptions"
              :key="option.value"
              class="flex items-center gap-3 rounded-lg border border-border/60 px-3 py-2 transition hover:border-primary"
            >
              <input
                type="radio"
                class="h-4 w-4"
                :value="option.value"
                :checked="field.value === option.value"
                @change="field.onChange(option.value)"
              />
              <span class="text-sm font-medium">{{ option.label }}</span>
            </label>
          </div>
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField name="tech_connectivity" v-slot="{ field }">
      <FormItem>
        <FormLabel>Como é sua conexão?</FormLabel>
        <FormControl>
          <div class="grid gap-2 md:grid-cols-3">
            <label
              v-for="option in connectivityOptions"
              :key="option.value"
              class="flex items-center gap-3 rounded-lg border border-border/60 px-3 py-2 transition hover:border-primary"
            >
              <input
                type="radio"
                class="h-4 w-4"
                :value="option.value"
                :checked="field.value === option.value"
                @change="field.onChange(option.value)"
              />
              <span class="text-sm font-medium">{{ option.label }}</span>
            </label>
          </div>
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <div class="grid gap-3 md:grid-cols-[1.2fr_0.8fr]">
      <FormField name="preferences_language" v-slot="{ field }">
        <FormItem>
          <FormLabel>Idioma preferencial</FormLabel>
          <FormControl>
            <Input
              :model-value="field.value"
              @update:model-value="field.onChange"
              @blur="field.onBlur"
              list="language-options"
              placeholder="pt-BR"
            />
            <datalist id="language-options">
              <option value="pt-BR" />
              <option value="en" />
              <option value="es" />
            </datalist>
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField name="preferences_accessibility" v-slot="{ field }">
        <FormItem>
          <FormLabel>Acessibilidade</FormLabel>
          <div class="grid gap-2">
            <label
              v-for="option in accessibilityOptions"
              :key="option.value"
              class="flex items-center gap-3 rounded-lg border border-border/60 px-3 py-2 transition hover:border-primary"
            >
              <input
                type="checkbox"
                class="h-4 w-4"
                :checked="field.value?.includes(option.value)"
                @change="field.onChange(toggleValue(option.value, field.value || []))"
              />
              <span class="text-sm font-medium">{{ option.label }}</span>
            </label>
          </div>
          <FormDescription>Opcional. Usamos para otimizar legibilidade e feedbacks.</FormDescription>
          <FormMessage />
        </FormItem>
      </FormField>
    </div>
  </div>
</template>
