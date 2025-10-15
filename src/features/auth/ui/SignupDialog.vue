<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Bem-vindo ao Cadastro</DialogTitle>
        <DialogDescription>
          Vamos começar seu cadastro em duas etapas simples.
        </DialogDescription>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <div class="space-y-4">
          <div class="flex items-start gap-3">
            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
              1
            </div>
            <div>
              <h4 class="font-medium">Etapa 1: Coleta de Informações</h4>
              <p class="text-sm text-muted-foreground">
                Conversaremos por chat para coletar suas informações básicas de forma interativa e personalizada.
              </p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
              2
            </div>
            <div>
              <h4 class="font-medium">Etapa 2: Configuração Personalizada</h4>
              <p class="text-sm text-muted-foreground">
                Após o cadastro, você será direcionado para uma experiência personalizada com o assistente.
              </p>
            </div>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button @click="$emit('start')">Começar Cadastro</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Button } from '@/shared/ui/button'

defineProps<{
  open: boolean
}>()

defineEmits<{
  'update:open': [value: boolean]
  start: []
}>()
</script>
