<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import NeoAnimatedBackground from './NeoAnimatedBackground.vue'
import { Sparkles, Brain, Zap, Star } from 'lucide-vue-next'

const { login, signup, loading, error } = useAuth()

// Login form
const loginUsername = ref('')
const loginPassword = ref('')

// Signup form
const signupUsername = ref('')
const signupEmail = ref('')
const signupPassword = ref('')
const signupConfirmPassword = ref('')
const signupFirstName = ref('')
const signupLastName = ref('')

// Floating icons
const floatingIcons = ref([
  { icon: Sparkles, x: 10, y: 20, delay: 0 },
  { icon: Brain, x: 80, y: 30, delay: 1 },
  { icon: Zap, x: 20, y: 70, delay: 2 },
  { icon: Star, x: 70, y: 80, delay: 3 },
])

// Validation
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
const isValidPassword = (password: string) => password.length >= 8

const loginPasswordValid = computed(() => !loginPassword.value || isValidPassword(loginPassword.value))

const signupEmailValid = computed(() => !signupEmail.value || isValidEmail(signupEmail.value))
const signupPasswordValid = computed(() => !signupPassword.value || isValidPassword(signupPassword.value))
const signupConfirmValid = computed(() => !signupConfirmPassword.value || signupPassword.value === signupConfirmPassword.value)

const canLogin = computed(() => loginUsername.value && loginPassword.value && loginPasswordValid.value)
const canSignup = computed(() => signupUsername.value && signupEmail.value && signupPassword.value && signupConfirmPassword.value &&
  signupEmailValid.value && signupPasswordValid.value && signupConfirmValid.value)

const handleLogin = async () => {
  if (canLogin.value) {
    await login(loginUsername.value, loginPassword.value)
  }
}

const handleSignup = async () => {
  console.log('handleSignup clicked!')
  if (canSignup.value) {
    console.log('Signing up! ', canSignup.value)
    await signup({
      username: signupUsername.value,
      email: signupEmail.value,
      password: signupPassword.value,
      first_name: signupFirstName.value || undefined,
      last_name: signupLastName.value || undefined
    })
  } else {
    console.log('Not able to signup: ', canSignup.value)
  }
}

onMounted(() => {
  // Add some pizzaz with random floating animations
  floatingIcons.value.forEach((icon, index) => {
    const element = document.getElementById(`floating-${index}`)
    if (element) {
      element.style.animationDelay = `${icon.delay}s`
    }
  })
})
</script>

<template>
  <div class="min-h-screen text-foreground relative overflow-hidden">
    <!-- Animated Background -->
    <NeoAnimatedBackground />

    <!-- Floating Icons for Pizzaz -->
    <div
      v-for="(iconData, index) in floatingIcons"
      :key="index"
      :id="`floating-${index}`"
      class="absolute pointer-events-none opacity-20 animate-bounce"
      :style="{ left: `${iconData.x}%`, top: `${iconData.y}%` }"
    >
      <component :is="iconData.icon" class="w-8 h-8 text-primary" />
    </div>

    <!-- Main Content -->
    <div class="relative z-10 min-h-screen flex items-center justify-center p-4">
      <Card class="w-full max-w-md animate-in fade-in slide-in-from-bottom-2 duration-500 bg-white/90 backdrop-blur-sm border-2 border-primary/20 shadow-2xl">
        <CardHeader class="text-center relative">
          <!-- Gradient Title -->
          <CardTitle class="text-3xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
            TeacherPlus
          </CardTitle>
          <p class="text-muted-foreground mt-2">Entre ou crie sua conta</p>

          <!-- Sparkle Effect -->
          <div class="absolute -top-2 -right-2">
            <Sparkles class="w-6 h-6 text-yellow-400 animate-spin" />
          </div>
        </CardHeader>

        <CardContent class="space-y-6">
          <Tabs default-value="login" class="w-full">
            <TabsList class="grid w-full grid-cols-2 bg-gradient-to-r from-primary/10 to-purple-500/10">
              <TabsTrigger
                value="login"
                class="hover:bg-primary/20 transition-all duration-300 hover:scale-105"
              >
                Entrar
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                class="hover:bg-purple-500/20 transition-all duration-300 hover:scale-105"
              >
                Cadastrar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" class="space-y-4 mt-6">
              <div class="space-y-2">
                <Label for="login-username" class="text-foreground font-semibold">Nome de usuário</Label>
                <Input
                  id="login-username"
                  v-model="loginUsername"
                  type="text"
                  placeholder="seu_usuario"
                  class="border-2 hover:border-primary/50 focus:border-primary transition-all duration-300 hover:shadow-lg"
                />
              </div>
              <div class="space-y-2">
                <Label for="login-password" class="text-foreground font-semibold">Senha</Label>
                <Input
                  id="login-password"
                  v-model="loginPassword"
                  type="password"
                  placeholder="••••••••"
                  class="border-2 hover:border-primary/50 focus:border-primary transition-all duration-300 hover:shadow-lg"
                  :class="{ 'border-red-500 animate-shake': !loginPasswordValid }"
                  aria-describedby="login-password-error"
                />
                <p v-if="!loginPasswordValid" id="login-password-error" class="text-red-500 text-sm animate-fade-in">Mínimo 8 caracteres</p>
              </div>
              <Button
                @click="handleLogin"
                :disabled="!canLogin || loading"
                class="w-full bg-gradient-to-r from-primary to-purple-500 hover:from-primary/80 hover:to-purple-500/80 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
                :class="{ 'opacity-50 cursor-not-allowed': loading }"
              >
                <span class="flex items-center justify-center">
                  {{ loading ? 'Entrando...' : 'Entrar' }}
                  <Zap v-if="!loading" class="ml-2 w-4 h-4 animate-pulse" />
                </span>
              </Button>
            </TabsContent>

            <TabsContent value="signup" class="space-y-4 mt-6">
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label for="signup-firstname" class="text-foreground font-semibold">Nome</Label>
                  <Input
                    id="signup-firstname"
                    v-model="signupFirstName"
                    placeholder="João"
                    class="border-2 hover:border-purple-500/50 focus:border-purple-500 transition-all duration-300 hover:shadow-lg"
                  />
                </div>
                <div class="space-y-2">
                  <Label for="signup-lastname" class="text-foreground font-semibold">Sobrenome</Label>
                  <Input
                    id="signup-lastname"
                    v-model="signupLastName"
                    placeholder="Silva"
                    class="border-2 hover:border-purple-500/50 focus:border-purple-500 transition-all duration-300 hover:shadow-lg"
                  />
                </div>
              </div>
              <div class="space-y-2">
                <Label for="signup-username" class="text-foreground font-semibold">Nome de usuário</Label>
                <Input
                  id="signup-username"
                  v-model="signupUsername"
                  placeholder="joaosilva"
                  class="border-2 hover:border-purple-500/50 focus:border-purple-500 transition-all duration-300 hover:shadow-lg"
                />
              </div>
              <div class="space-y-2">
                <Label for="signup-email" class="text-foreground font-semibold">Email</Label>
                <Input
                  id="signup-email"
                  v-model="signupEmail"
                  type="email"
                  placeholder="joao@email.com"
                  class="border-2 hover:border-purple-500/50 focus:border-purple-500 transition-all duration-300 hover:shadow-lg"
                  :class="{ 'border-red-500 animate-shake': !signupEmailValid }"
                  aria-describedby="signup-email-error"
                />
                <p v-if="!signupEmailValid" id="signup-email-error" class="text-red-500 text-sm animate-fade-in">Email inválido</p>
              </div>
              <div class="space-y-2">
                <Label for="signup-password" class="text-foreground font-semibold">Senha</Label>
                <Input
                  id="signup-password"
                  v-model="signupPassword"
                  type="password"
                  placeholder="••••••••"
                  class="border-2 hover:border-purple-500/50 focus:border-purple-500 transition-all duration-300 hover:shadow-lg"
                  :class="{ 'border-red-500 animate-shake': !signupPasswordValid }"
                  aria-describedby="signup-password-error"
                />
                <p v-if="!signupPasswordValid" id="signup-password-error" class="text-red-500 text-sm animate-fade-in">Mínimo 8 caracteres</p>
              </div>
              <div class="space-y-2">
                <Label for="signup-confirm" class="text-foreground font-semibold">Confirmar Senha</Label>
                <Input
                  id="signup-confirm"
                  v-model="signupConfirmPassword"
                  type="password"
                  placeholder="••••••••"
                  class="border-2 hover:border-purple-500/50 focus:border-purple-500 transition-all duration-300 hover:shadow-lg"
                  :class="{ 'border-red-500 animate-shake': !signupConfirmValid }"
                  aria-describedby="signup-confirm-error"
                />
                <p v-if="!signupConfirmValid" id="signup-confirm-error" class="text-red-500 text-sm animate-fade-in">Senhas não coincidem</p>
              </div>
              <Button
                @click="handleSignup"
                :disabled="!canSignup || loading"
                class="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-500/80 hover:to-pink-500/80 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
                :class="{ 'opacity-50 cursor-not-allowed': loading }"
              >
                <span class="flex items-center justify-center">
                  {{ loading ? 'Criando conta...' : 'Criar Conta' }}
                  <Star v-if="!loading" class="ml-2 w-4 h-4 animate-spin" />
                </span>
              </Button>
            </TabsContent>
          </Tabs>

          <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-3 animate-fade-in">
            <p class="text-red-600 text-center font-medium">{{ error }}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<style scoped>
/* Custom animations for pizzaz */
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-in;
}

.animate-shake {
  animation: shake 0.5s ease-in-out;
}

/* Floating icons animation */
@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(5deg); }
}

.absolute {
  animation: float 3s ease-in-out infinite;
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
  0% { transform: translateY(0px) scale(0); opacity: 0; }
  50% { transform: translateY(-20px) scale(1); opacity: 1; }
  100% { transform: translateY(-40px) scale(0); opacity: 0; }
}
</style>
