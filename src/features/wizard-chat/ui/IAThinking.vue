<script setup lang="ts">
import { GraduationCap } from 'lucide-vue-next'
</script>

<template>
  <div class="flex items-center gap-2 text-primary">
    <div class="relative">
      <div class="absolute inset-0 rounded-full opacity-30 animate-ping bg-primary/50"></div>
      <GraduationCap class="w-6 h-6 animate-pulse" />
    </div>
    <div class="inline-flex gap-1 align-middle">
      <span class="w-1.5 h-1.5 rounded-full bg-primary/70 animate-bounce [animation-delay:0ms]"></span>
      <span class="w-1.5 h-1.5 rounded-full bg-primary/70 animate-bounce [animation-delay:120ms]"></span>
      <span class="w-1.5 h-1.5 rounded-full bg-primary/70 animate-bounce [animation-delay:240ms]"></span>
    </div>
  </div>
</template>
