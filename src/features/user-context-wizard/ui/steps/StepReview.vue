<script setup lang="ts">
import { computed } from 'vue'
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import Checkbox from '@/shared/ui/checkbox/Checkbox.vue'
import type { WizardFormValues } from '../../lib/validation'

const preferenceLabels: Record<string, string> = {
  video: 'Vídeo aulas',
  text: 'Textos e resumos',
  audio: 'Áudio / podcast',
  exercises: 'Listas de exercícios',
}

const personaLabels: Record<string, string> = {
  student: 'Estudante',
  teacher: 'Professor',
  guardian: 'Responsável',
  other: 'Outro',
}

const notificationLabels: Record<string, string> = {
  email: 'E-mail',
  push: 'Notificações push',
  whatsapp: 'WhatsApp',
}

const deviceLabels: Record<string, string> = {
  desktop: 'Notebook/PC',
  mobile: 'Celular',
  tablet: 'Tablet',
}

const connectivityLabels: Record<string, string> = {
  stable: 'Boa e estável',
  unstable: 'Instável às vezes',
  offline: 'Acesso offline ocasional',
}

const interestLabels: Record<string, string> = {
  humanas: 'Ciências Humanas',
  natureza: 'Ciências da Natureza',
  linguagens: 'Linguagens',
  matematica: 'Matemática',
  redacao: 'Redação',
}

const accessibilityLabels: Record<string, string> = {
  screen_reader: 'Leitor de tela',
  high_contrast: 'Alto contraste',
  captions: 'Legendas / transcrições',
}

const props = defineProps<{
  values: WizardFormValues
}>()

const summary = computed(() => {
  const v = props.values
  const formatList = (items: string[], labels: Record<string, string>) =>
    (items || []).map((item) => labels[item] || item).join(', ')

  return [
    {
      title: 'Perfil',
      items: [
        { label: 'Persona', value: personaLabels[v.persona] || v.persona || '—' },
        { label: 'Objetivo', value: v.goal || '—' },
        { label: 'Prazo', value: v.deadline || '—' },
        { label: 'Horas/semana', value: v.weekly_time_hours?.toString() || '0' },
      ],
    },
    {
      title: 'Rotina',
      items: [
        { label: 'Rotina', value: v.study_routine || '—' },
        {
          label: 'Formatos',
          value: formatList(v.preferences_formats || [], preferenceLabels) || 'Nenhum formato preferido',
        },
        { label: 'Notificações', value: notificationLabels[v.notifications] || v.notifications || '—' },
      ],
    },
    {
      title: 'Background',
      items: [
        { label: 'Nível', value: v.background_level || '—' },
        { label: 'Instituição', value: v.background_institution_type || '—' },
        { label: 'Interesses', value: formatList(v.interests || [], interestLabels) || '—' },
      ],
    },
    {
      title: 'Tecnologia',
      items: [
        { label: 'Dispositivo', value: deviceLabels[v.tech_device] || v.tech_device || '—' },
        { label: 'Conectividade', value: connectivityLabels[v.tech_connectivity] || v.tech_connectivity || '—' },
        { label: 'Idioma', value: v.preferences_language || '—' },
        {
          label: 'Acessibilidade',
          value: formatList(v.preferences_accessibility || [], accessibilityLabels) || '—',
        },
      ],
    },
  ]
})
</script>

<template>
  <div class="grid gap-4 animate-[fadeInUp_0.35s_ease-out]">
    <p class="text-sm text-muted-foreground">
      Confira rapidamente antes de enviar. Você pode voltar e ajustar qualquer etapa.
    </p>

    <div class="grid gap-3 rounded-xl border border-border/70 bg-card/60 p-4 shadow-sm">
      <div
        v-for="section in summary"
        :key="section.title"
        class="grid gap-2 border-b border-border/50 pb-3 last:border-none last:pb-0"
      >
        <p class="text-sm font-semibold">{{ section.title }}</p>
        <div class="grid gap-1 md:grid-cols-2">
          <div
            v-for="item in section.items"
            :key="item.label"
            class="flex items-start justify-between gap-3 rounded-lg bg-muted/30 px-3 py-2 text-sm"
          >
            <span class="text-muted-foreground">{{ item.label }}</span>
            <span class="font-medium text-foreground text-right">{{ item.value }}</span>
          </div>
        </div>
      </div>
    </div>

    <FormField name="consent_lgpd" v-slot="{ field }">
      <FormItem class="flex flex-row items-start gap-3 space-y-0 rounded-lg border border-border/70 p-4">
        <FormControl>
          <input
            type="checkbox"
            class="mt-1 h-4 w-4 rounded border border-border"
            :checked="!!field.value"
            @change="(e) => field.onChange((e.target as HTMLInputElement).checked)"
            @blur="field.onBlur"
          />
        </FormControl>
        <div class="space-y-1 leading-none">
          <FormLabel>Aceito o uso dos meus dados para personalizar o plano</FormLabel>
          <FormDescription>
            Usamos seu contexto apenas para melhorar recomendações. Você pode revogar depois.
          </FormDescription>
          <FormMessage />
        </div>
      </FormItem>
    </FormField>
  </div>
</template>
