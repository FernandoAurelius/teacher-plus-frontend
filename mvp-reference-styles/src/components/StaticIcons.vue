<template>
  <div style="display: none;">
    <!-- Pre-render all icons to avoid conditional rendering -->
    <GraduationCap />
    <Sparkles />
    <Check />
    <User />
    <Settings />
    <BookOpen />
    <ClipboardList />
    <Layers />
    <LogOut />
    <Menu />
    <X />
  </div>
</template>

<script setup lang="ts">
import {
  GraduationCap,
  Sparkles,
  Check,
  User,
  Settings,
  BookOpen,
  ClipboardList,
  Layers,
  LogOut,
  Menu,
  X
} from 'lucide-vue-next'
</script>
