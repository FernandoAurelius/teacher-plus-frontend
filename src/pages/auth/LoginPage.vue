<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuth } from '@/features/auth/lib/useAuth'
import { useRouter } from 'vue-router'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Zap, Sparkles } from 'lucide-vue-next'

const { login, loading, error } = useAuth()
const router = useRouter()

// Login form
const loginUsername = ref('')
const loginPassword = ref('')

// Validation
const isValidPassword = (password: string) => password.length >= 8

const loginPasswordValid = computed(() => !loginPassword.value || isValidPassword(loginPassword.value))

const canLogin = computed(() => loginUsername.value && loginPassword.value && loginPasswordValid.value)

const handleLogin = async () => {
  if (!canLogin.value) return
  try {
    const { userData, has_user_context } = await login(loginUsername.value, loginPassword.value)
    if (userData && has_user_context === false) {
      router.push('/wizard-simulado')
    } else {
      router.push('/') // ou dashboard
    }
  } catch {
    // erro já tratado no useAuth
  }
}

</script>

<template>
  <div class="min-h-screen text-foreground relative overflow-hidden">

    <!-- Main Content -->
    <div class="relative z-10 min-h-screen flex items-center justify-center p-4">
      <Card
        class="w-full max-w-md animate-in fade-in slide-in-from-bottom-2 duration-500 bg-white/90 backdrop-blur-sm border-2 border-primary/20 shadow-2xl">
        <CardHeader class="text-center relative">
          <!-- Gradient Title -->
          <CardTitle
            class="text-3xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
            TeacherPlus
          </CardTitle>
          <p class="text-muted-foreground mt-2">Entre ou crie sua conta</p>

          <!-- Sparkle Effect -->
          <div class="absolute -top-2 -right-2">
            <Sparkles class="w-6 h-6 text-yellow-400 animate-spin" />
          </div>
        </CardHeader>

        <CardContent class="space-y-6">
          <div class="space-y-4">
            <div class="space-y-2">
              <Label for="login-username" class="text-foreground font-semibold">Nome de usuário</Label>
              <Input id="login-username" v-model="loginUsername" type="text" placeholder="seu_usuario"
                class="border-2 hover:border-primary/50 focus:border-primary transition-all duration-300 hover:shadow-lg" />
            </div>
            <div class="space-y-2">
              <Label for="login-password" class="text-foreground font-semibold">Senha</Label>
              <Input id="login-password" v-model="loginPassword" type="password" placeholder="••••••••"
                class="border-2 hover:border-primary/50 focus:border-primary transition-all duration-300 hover:shadow-lg"
                :class="{ 'border-red-500 animate-shake': !loginPasswordValid }"
                aria-describedby="login-password-error" />
              <p v-if="!loginPasswordValid" id="login-password-error" class="text-red-500 text-sm animate-fade-in">
                Mínimo 8 caracteres</p>
            </div>
            <Button @click="handleLogin" :disabled="!canLogin || loading"
              class="w-full bg-gradient-to-r from-primary to-purple-500 hover:from-primary/80 hover:to-purple-500/80 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
              :class="{ 'opacity-50 cursor-not-allowed': loading }">
              <span class="flex items-center justify-center">
                {{ loading ? 'Entrando...' : 'Entrar' }}
                <Zap v-if="!loading" class="ml-2 w-4 h-4 animate-pulse" />
              </span>
            </Button>
          </div>

          <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-3 animate-fade-in">
            <p class="text-red-600 text-center font-medium">{{ error }}</p>
          </div>
        </CardContent>

        <CardFooter class="text-center">
          <router-link to="/signup" class="inline-block text-sm font-medium bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent hover:from-purple-500 hover:to-pink-500 transition-all duration-300 hover:scale-105 hover:shadow-lg px-4 py-2 rounded-lg border border-transparent hover:border-primary/20">
            Não tem conta? <span class="underline decoration-2 underline-offset-4">Criar conta</span>
          </router-link>
        </CardFooter>
      </Card>
    </div>
  </div>
</template>

<style scoped>
/* Custom animations for pizzaz */
@keyframes fade-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes shake {

  0%,
  100% {
    transform: translateX(0);
  }

  25% {
    transform: translateX(-5px);
  }

  75% {
    transform: translateX(5px);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-in;
}

.animate-shake {
  animation: shake 0.5s ease-in-out;
}

/* Floating icons animation */
@keyframes float {

  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }

  50% {
    transform: translateY(-10px) rotate(5deg);
  }
}


/* Gradient text effect */
.gradient-text {
  background: linear-gradient(45deg, #3B82F6, #8B5CF6, #EC4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Enhanced button hover effects */
.hover-glow:hover {
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
}

/* Particle effect simulation */
.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.8) 0%, transparent 70%);
  border-radius: 50%;
  animation: particle-float 4s ease-in-out infinite;
}

@keyframes particle-float {
  0% {
    transform: translateY(0px) scale(0);
    opacity: 0;
  }

  50% {
    transform: translateY(-20px) scale(1);
    opacity: 1;
  }

  100% {
    transform: translateY(-40px) scale(0);
    opacity: 0;
  }
}
</style>
