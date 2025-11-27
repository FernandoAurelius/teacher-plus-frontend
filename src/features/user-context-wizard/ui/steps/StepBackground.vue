<script setup lang="ts">
import { computed } from 'vue'
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import Input from '@/shared/ui/input/Input.vue'
import Textarea from '@/shared/ui/textarea/Textarea.vue'

const interestText = computed(() => 'Separe por vírgulas. Ex.: Redação, Matemática, História.')

const joinArray = (list?: string[]) => (list ?? []).join(', ')
const splitToArray = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
</script>

<template>
  <div class="grid gap-4 animate-[fadeInUp_0.35s_ease-out]">
    <p class="text-sm text-muted-foreground">
      Conte com suas palavras. Usamos esse contexto para personalizar o plano e a linguagem.
    </p>

    <FormField name="background_level" v-slot="{ field }">
      <FormItem>
        <FormLabel>Nível atual em estudos</FormLabel>
        <FormControl>
          <Textarea
            :model-value="field.value"
            @update:model-value="field.onChange"
            @blur="field.onBlur"
            rows="2"
            placeholder="Ex.: Intermediário em humanas, iniciante em exatas. Estudei em cursinho em 2023."
          />
        </FormControl>
        <FormDescription>Descreva seu nível com liberdade.</FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField name="background_institution_type" v-slot="{ field }">
      <FormItem>
        <FormLabel>Histórico de instituição</FormLabel>
        <FormControl>
          <Input
            :model-value="field.value"
            @update:model-value="field.onChange"
            @blur="field.onBlur"
            placeholder="Ex.: Ensino médio em escola pública / privada / EJA / autodidata"
          />
        </FormControl>
        <FormDescription>Use termos que façam sentido para você.</FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField name="interests" v-slot="{ field }">
      <FormItem>
        <FormLabel>Interesses e focos</FormLabel>
        <FormControl>
          <Textarea
            :model-value="joinArray(field.value)"
            @update:model-value="(val) => field.onChange(splitToArray(val))"
            @blur="field.onBlur"
            rows="2"
            :placeholder="interestText"
          />
        </FormControl>
        <FormDescription>{{ interestText }}</FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>
  </div>
</template>
