<template>
  <component :is="iconComponent" v-bind="$attrs" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import * as LucideIcons from 'lucide-vue-next'

interface Props {
  name: string
}

const props = defineProps<Props>()

const iconComponent = computed(() => {
  return (LucideIcons as any)[props.name] || LucideIcons.HelpCircle
})
</script>
