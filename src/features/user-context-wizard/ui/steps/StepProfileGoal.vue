<script setup lang="ts">
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/shared/ui/form'
import Input from '@/shared/ui/input/Input.vue'
import Select from '@/shared/ui/select/Select.vue'
import SelectContent from '@/shared/ui/select/SelectContent.vue'
import SelectGroup from '@/shared/ui/select/SelectGroup.vue'
import SelectItem from '@/shared/ui/select/SelectItem.vue'
import SelectLabel from '@/shared/ui/select/SelectLabel.vue'
import SelectTrigger from '@/shared/ui/select/SelectTrigger.vue'
import SelectValue from '@/shared/ui/select/SelectValue.vue'

const personaOptions = [
  { label: 'Estudante', value: 'student' },
  { label: 'Professor', value: 'teacher' },
  { label: 'Responsável', value: 'guardian' },
  { label: 'Outro', value: 'other' },
]
</script>

<template>
  <div class="grid gap-4 animate-[fadeInUp_0.35s_ease-out]">
    <div>
      <p class="text-sm text-muted-foreground">Comece com um retrato rápido para personalizar recomendações.</p>
    </div>

    <div class="grid gap-3">
      <FormField name="persona" v-slot="{ field }">
        <FormItem>
          <FormLabel>Persona principal</FormLabel>
          <FormControl>
            <Select v-bind="field" :value="field.value || undefined" @update:value="field.onChange">
              <SelectTrigger>
                <SelectValue placeholder="Selecione quem você é no app" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Escolha uma</SelectLabel>
                  <SelectItem v-for="option in personaOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </FormControl>
          <FormDescription>Usamos isso para ajustar a linguagem e tom.</FormDescription>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField name="goal" v-slot="{ field }">
        <FormItem>
          <FormLabel>Objetivo principal</FormLabel>
          <FormControl>
            <Input v-bind="field" placeholder="Ex.: Passar no ENEM com foco em humanas" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <div class="grid gap-3 md:grid-cols-2">
        <FormField name="deadline" v-slot="{ field }">
          <FormItem>
            <FormLabel>Prazo ou prova alvo</FormLabel>
            <FormControl>
              <Input v-bind="field" placeholder="Enem 2025 / Dez 2025" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField name="weekly_time_hours" v-slot="{ field }">
          <FormItem>
            <FormLabel>Horas semanais de estudo</FormLabel>
            <FormControl>
              <Input v-bind="field" type="number" min="1" max="168" inputmode="numeric" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
      </div>
    </div>
  </div>
</template>
