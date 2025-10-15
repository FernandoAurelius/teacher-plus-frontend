<template>
  <!-- Montado uma única vez: cobre todo o viewport atrás das rotas -->
  <div class="fixed inset-0 -z-10 overflow-hidden bg-background pointer-events-none">
    <!-- Camadas de gradiente (grandes, giram/“respiram”, sem translate lateral) -->
    <div class="abs-center w-[260vmax] h-[260vmax] opacity-40 mix-blend-screen layer-1"></div>
    <div class="abs-center w-[320vmax] h-[320vmax] opacity-30 mix-blend-screen layer-2"></div>

    <!-- Ícones flutuando — mesmos do LoginSignup (posições/delays) -->
    <div v-if="showIcons" class="absolute inset-0">
      <div
        v-for="(cfg, i) in iconConfigs"
        :key="i"
        class="absolute opacity-20 will-change-transform"
        :style="{
          left: cfg.x + '%',
          top: cfg.y + '%',
          animationDelay: cfg.delay + 's'
        }"
      >
        <component
          :is="cfg.icon"
          class="text-primary icon-float"
          :style="{ width: cfg.size + 'px', height: cfg.size + 'px' }"
        />
      </div>
    </div>

    <!-- Vignette suave nas bordas (tira sensação de “corte”) -->
    <div class="absolute inset-0"
         style="background:radial-gradient(120% 120% at 50% 60%, transparent 60%, rgba(0,0,0,.07) 100%);"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Sparkles, Brain, Zap, Star } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  icons?: boolean            // força mostrar/ocultar ícones (default: true)
  iconsPreset?: 'auth' | 'none'
}>(), {
  icons: true,
  iconsPreset: 'auth'
})

const showIcons = computed(() => props.icons && props.iconsPreset !== 'none')

/** Mesmo layout/posições/delays que você usou no LoginSignup */
const iconConfigs = computed(() => {
  if (!showIcons.value) return []
  return [
    { icon: Sparkles, x: 10, y: 20, delay: 0, size: 32 },
    { icon: Brain,    x: 80, y: 30, delay: 1, size: 32 },
    { icon: Zap,      x: 20, y: 70, delay: 2, size: 32 },
    { icon: Star,     x: 70, y: 80, delay: 3, size: 32 },
  ]
})
</script>

<style scoped>
.abs-center {
  position: absolute;
  left: 50%; top: 50%;
  transform: translate(-50%, -50%);
  border-radius: 9999px;
  will-change: transform, opacity;
  /* Faz as bordas morrerem suave mesmo que a rotação encoste no viewport */
  -webkit-mask-image: radial-gradient(closest-side, #000 78%, transparent 100%);
          mask-image: radial-gradient(closest-side, #000 78%, transparent 100%);
}

/* Gradientes grandes, só giram/escalam: não abrem "buracos" nas laterais */
.layer-1 {
  background: conic-gradient(from 0deg,
    rgba(99,102,241,.35),
    rgba(236,72,153,.35),
    rgba(16,185,129,.25),
    rgba(99,102,241,.35)
  );
  animation: spinSlow 80s linear infinite, breathe 12s ease-in-out infinite;
}
.layer-2 {
  background:
    radial-gradient(closest-side, rgba(59,130,246,.25), transparent 70%),
    radial-gradient(closest-side, rgba(168,85,247,.25), transparent 70%),
    radial-gradient(closest-side, rgba(236,72,153,.2),  transparent 70%);
  animation: spinReverse 120s linear infinite, breathe 16s ease-in-out infinite;
}

@keyframes spinSlow    { to { transform: translate(-50%, -50%) rotate(360deg)  scale(1.04); } }
@keyframes spinReverse { to { transform: translate(-50%, -50%) rotate(-360deg) scale(1.06); } }
@keyframes breathe     { 0%,100% { opacity:.28 } 50% { opacity:.42 } }

/* Mesma "flutuação" suave que você usou (sem bounce lateral) */
.icon-float { animation: float 6s ease-in-out infinite; }
@keyframes float {
  0%, 100% { transform: translateY(0)      rotate(0deg);  }
  50%      { transform: translateY(-10px)  rotate(5deg);  }
}
</style>
