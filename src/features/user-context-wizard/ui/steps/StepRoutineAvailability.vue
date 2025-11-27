<script setup lang="ts">
import { computed } from 'vue'
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import Textarea from '@/shared/ui/textarea/Textarea.vue'

const formatOptions = [
  { label: 'Vídeo aulas', value: 'video' },
  { label: 'Textos e resumos', value: 'text' },
  { label: 'Áudio / podcast', value: 'audio' },
  { label: 'Listas de exercícios', value: 'exercises' },
]

const notificationOptions = [
  { label: 'E-mail', value: 'email' },
  { label: 'Push', value: 'push' },
  { label: 'WhatsApp', value: 'whatsapp' },
]

const toggleValue = (value: string, current: string[]) => {
  const set = new Set(current || [])
  if (set.has(value)) {
    set.delete(value)
  } else {
    set.add(value)
  }
  const next = Array.from(set)
  console.log('[wizard] toggle format', { value, current, next })
  return next
}

const descriptionText = computed(() => 'Como você quer receber e consumir os materiais do plano?')
</script>

<template>
  <div class="grid gap-4 animate-[fadeInUp_0.35s_ease-out]">
    <p class="text-sm text-muted-foreground">
      {{ descriptionText }}
    </p>

    <FormField name="study_routine" v-slot="{ field }">
      <FormItem>
        <FormLabel>Rotina de estudo atual</FormLabel>
        <FormControl>
          <Textarea
            :model-value="field.value"
            @update:model-value="field.onChange"
            @blur="field.onBlur"
            placeholder="Ex.: Estudo 1h por noite, foco em redação nos fins de semana"
            rows="3"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField name="preferences_formats" v-slot="{ field }">
      <FormItem>
        <FormLabel>Formatos preferidos</FormLabel>
        <div class="grid gap-2 md:grid-cols-2">
          <label
            v-for="option in formatOptions"
            :key="option.value"
            class="flex items-start gap-3 rounded-lg border border-border/60 px-3 py-2 transition hover:border-primary"
          >
            <input
              type="checkbox"
              class="mt-1 h-4 w-4 rounded border border-border"
              :checked="field.value?.includes(option.value)"
              @change="field.onChange(toggleValue(option.value, field.value || []))"
            />
            <div class="space-y-0.5">
              <p class="font-medium leading-tight">{{ option.label }}</p>
              <p class="text-xs text-muted-foreground">Você pode escolher mais de um.</p>
            </div>
          </label>
        </div>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField name="notifications" v-slot="{ field }">
      <FormItem>
        <FormLabel>Notificações</FormLabel>
        <FormControl>
          <div class="grid gap-3 md:grid-cols-3">
            <label
              v-for="option in notificationOptions"
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
        <FormDescription>Usamos para lembrar do plano e enviar feedbacks.</FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>
  </div>
</template>
