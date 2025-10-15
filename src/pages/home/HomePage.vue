<template>
  <div class="min-h-screen text-foreground relative overflow-hidden">

    <!-- Navigation -->
    <nav class="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <GraduationCap class="h-8 w-8 text-primary mr-2" />
            <span class="text-xl font-bold">TeacherPlus</span>
          </div>

          <div class="hidden md:flex items-center space-x-8">
            <a href="#estudantes" class="text-muted-foreground hover:text-foreground transition-colors">Estudantes</a>
            <a href="#professores" class="text-muted-foreground hover:text-foreground transition-colors">Professores</a>
            <a href="#recursos" class="text-muted-foreground hover:text-foreground transition-colors">Recursos</a>
            <a href="#planos" class="text-muted-foreground hover:text-foreground transition-colors">Planos</a>
          </div>

          <div class="flex items-center space-x-4">
            <router-link to="/login" class="text-muted-foreground hover:text-foreground transition-colors">Entrar</router-link>
            <router-link
              to="/login"
              class="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-all duration-200 hover:scale-105"
              v-motion :whileHover="{ scale: 1.05 }" :whileTap="{ scale: 0.98 }">
              Começar Agora
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="relative min-h-screen py-20 lg:py-32 overflow-hidden flex items-center justify-center">
      <div class="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/5"></div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <div ref="heroTitle" class="mb-8 opacity-0 translate-y-12 transition-all duration-1500 ease-out"
            :class="{ 'opacity-100 translate-y-0': heroTitleVisible }">
            <h1
              class="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              Revolucione sua
              <br />
              <span class="text-primary">Educação</span>
            </h1>
            <p class="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Plataforma inteligente que conecta estudantes e professores através de IA avançada,
              criando experiências de aprendizado personalizadas e eficazes.
            </p>
          </div>

          <div ref="heroButtons"
            class="flex flex-col sm:flex-row gap-4 justify-center mb-16 opacity-0 translate-y-12 transition-all duration-1500 ease-out delay-500"
            :class="{ 'opacity-100 translate-y-0': heroButtonsVisible }">
            <router-link to="/login"
              class="bg-primary text-primary-foreground px-8 py-4 rounded-xl text-lg font-semibold hover:bg-primary/90 transition-all duration-200 hover:scale-105 hover:shadow-lg">
              <Users class="inline-block w-5 h-5 mr-2" />
              Sou Estudante
            </router-link>
            <router-link to="/login"
              class="bg-accent text-accent-foreground px-8 py-4 rounded-xl text-lg font-semibold hover:bg-accent/90 transition-all duration-200 hover:scale-105 hover:shadow-lg">
              <BookOpen class="inline-block w-5 h-5 mr-2" />
              Sou Professor
            </router-link>
          </div>

          <!-- AI Study Plan Card -->
          <div ref="heroCard"
            class="relative max-w-md mx-auto opacity-0 scale-90 translate-y-8 transition-all duration-1500 ease-out delay-700"
            :class="{ 'opacity-100 scale-100 translate-y-0': heroCardVisible }">
            <div
              class="bg-card border border-border rounded-2xl p-6 shadow-2xl hover:shadow-primary/20 transition-all duration-300 hover:scale-105">
              <div
                class="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300">
              </div>
              <div class="relative">
                <Sparkles class="w-8 h-8 text-primary mb-4 mx-auto" />
                <h3 class="text-lg font-semibold mb-2">Plano de Estudos Gerado por IA</h3>
                <p class="text-muted-foreground text-sm">Algoritmos avançados criam rotinas personalizadas baseadas no
                  seu perfil e objetivos</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Como Funciona -->
    <section id="como-funciona" class="min-h-screen py-20 bg-muted/30 flex items-center justify-center">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref="stepsHeader" class="text-center mb-16 opacity-0 translate-y-12 transition-all duration-1200 ease-out"
          :class="{ 'opacity-100 translate-y-0': stepsHeaderVisible }">
          <h2 class="text-3xl md:text-4xl font-bold mb-4">Como Funciona</h2>
          <p class="text-xl text-muted-foreground max-w-2xl mx-auto">
            Três passos simples para transformar sua experiência educacional
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <div v-for="(step, index) in steps" :key="index" :ref="el => stepRefs[index] = el"
            class="text-center group opacity-0 translate-y-12 transition-all duration-1200 ease-out"
            :class="{ 'opacity-100 translate-y-0': stepVisibility[index] }"
            :style="{ transitionDelay: `${600 + index * 300}ms` }">
            <div
              class="bg-card border border-border rounded-2xl p-8 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:scale-105 hover:border-primary/50">
              <div
                class="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                <component :is="step.icon" class="w-8 h-8 text-primary" />
              </div>
              <h3 class="text-xl font-semibold mb-4">{{ step.title }}</h3>
              <p class="text-muted-foreground leading-relaxed">{{ step.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Recursos -->
    <section id="recursos" class="min-h-screen py-20 flex items-center justify-center">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref="featuresHeader"
          class="text-center mb-16 opacity-0 translate-y-12 transition-all duration-1200 ease-out"
          :class="{ 'opacity-100 translate-y-0': featuresHeaderVisible }">
          <h2 class="text-3xl md:text-4xl font-bold mb-4">Recursos Poderosos</h2>
          <p class="text-xl text-muted-foreground max-w-2xl mx-auto">
            Ferramentas inteligentes para estudantes e professores alcançarem seus objetivos
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div v-for="(feature, index) in features" :key="index" :ref="el => featureRefs[index] = el"
            class="group opacity-0 translate-y-12 transition-all duration-1200 ease-out"
            :class="{ 'opacity-100 translate-y-0': featureVisibility[index] }"
            :style="{ transitionDelay: `${400 + index * 200}ms` }">
            <div
              class="bg-card border border-border rounded-2xl p-6 h-full hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:scale-105 hover:border-primary/50">
              <div
                class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <component :is="feature.icon" class="w-6 h-6 text-primary" />
              </div>
              <h3 class="text-lg font-semibold mb-3">{{ feature.title }}</h3>
              <p class="text-muted-foreground text-sm leading-relaxed">{{ feature.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing -->
    <section id="planos" class="min-h-screen py-20 bg-muted/30 flex items-center justify-center">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref="pricingHeader"
          class="text-center mb-16 opacity-0 translate-y-12 transition-all duration-1200 ease-out"
          :class="{ 'opacity-100 translate-y-0': pricingHeaderVisible }">
          <h2 class="text-3xl md:text-4xl font-bold mb-4">Planos Flexíveis</h2>
          <p class="text-xl text-muted-foreground mb-8">Escolha o plano ideal para sua jornada educacional</p>

          <!-- Toggle -->
          <div class="flex items-center justify-center mb-8">
            <span class="text-muted-foreground mr-3">Mensal</span>
            <button @click="isAnnual = !isAnnual"
              class="relative w-14 h-7 bg-muted rounded-full transition-colors duration-200"
              :class="{ 'bg-primary': isAnnual }">
              <div class="absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-200"
                :class="{ 'translate-x-7': isAnnual }"></div>
            </button>
            <span class="text-muted-foreground ml-3">Anual</span>
            <span class="ml-2 text-xs bg-accent text-accent-foreground px-2 py-1 rounded-full">-20%</span>
          </div>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <div v-for="(plan, index) in plans" :key="index" :ref="el => planRefs[index] = el"
            class="relative group opacity-0 translate-y-12 transition-all duration-1200 ease-out"
            :class="{ 'opacity-100 translate-y-0': planVisibility[index] }"
            :style="{ transitionDelay: `${400 + index * 300}ms` }">
            <div class="bg-card border rounded-2xl p-8 h-full transition-all duration-300 hover:scale-105"
              :class="plan.popular ? 'border-primary shadow-xl shadow-primary/20' : 'border-border hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10'">
              <div v-if="plan.popular" class="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span class="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                  Mais Popular
                </span>
              </div>

              <div class="text-center mb-8">
                <h3 class="text-xl font-bold mb-2">{{ plan.name }}</h3>
                <div class="mb-4">
                  <span class="text-4xl font-bold">R$ {{ isAnnual ? plan.yearlyPrice : plan.monthlyPrice }}</span>
                  <span class="text-muted-foreground">{{ isAnnual ? '/ano' : '/mês' }}</span>
                </div>
                <p class="text-muted-foreground text-sm">{{ plan.description }}</p>
              </div>

              <ul class="space-y-3 mb-8">
                <li v-for="feature in plan.features" :key="feature" class="flex items-center text-sm">
                  <Check class="w-4 h-4 text-primary mr-3 flex-shrink-0" />
                  {{ feature }}
                </li>
              </ul>

              <button class="w-full py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105" :class="plan.popular
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-muted text-foreground hover:bg-muted/80'">
                {{ plan.cta }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="min-h-screen py-20 flex items-center justify-center">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref="faqHeader" class="text-center mb-16 opacity-0 translate-y-12 transition-all duration-1200 ease-out"
          :class="{ 'opacity-100 translate-y-0': faqHeaderVisible }">
          <h2 class="text-3xl md:text-4xl font-bold mb-4">Perguntas Frequentes</h2>
          <p class="text-xl text-muted-foreground">Tire suas dúvidas sobre a plataforma</p>
        </div>

        <div class="space-y-4">
          <div v-for="(faq, index) in faqs" :key="index" :ref="el => faqRefs[index] = el"
            class="bg-card border border-border rounded-xl overflow-hidden opacity-0 translate-y-12 transition-all duration-1200 ease-out"
            :class="{ 'opacity-100 translate-y-0': faqVisibility[index] }"
            :style="{ transitionDelay: `${300 + index * 200}ms` }">
            <button @click="toggleFaq(index)"
              class="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-muted/50 transition-colors">
              <span class="font-semibold">{{ faq.question }}</span>
              <ChevronDown class="w-5 h-5 transition-transform duration-200"
                :class="{ 'rotate-180': openFaq === index }" />
            </button>
            <div v-if="openFaq === index" class="px-6 pb-4 text-muted-foreground">
              {{ faq.answer }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer ref="footer"
      class="bg-card border-t border-border py-12 opacity-0 translate-y-12 transition-all duration-1500 ease-out"
      :class="{ 'opacity-100 translate-y-0': footerVisible }">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid md:grid-cols-4 gap-8">
          <div>
            <div class="flex items-center mb-4">
              <GraduationCap class="h-8 w-8 text-primary mr-2" />
              <span class="text-xl font-bold">TeacherPlus</span>
            </div>
            <p class="text-muted-foreground text-sm">
              Revolucionando a educação através da inteligência artificial e tecnologia avançada.
            </p>
          </div>

          <div>
            <h4 class="font-semibold mb-4">Produto</h4>
            <ul class="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" class="hover:text-foreground transition-colors">Recursos</a></li>
              <li><a href="#" class="hover:text-foreground transition-colors">Planos</a></li>
              <li><a href="#" class="hover:text-foreground transition-colors">API</a></li>
            </ul>
          </div>

          <div>
            <h4 class="font-semibold mb-4">Suporte</h4>
            <ul class="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" class="hover:text-foreground transition-colors">Central de Ajuda</a></li>
              <li><a href="#" class="hover:text-foreground transition-colors">Contato</a></li>
              <li><a href="#" class="hover:text-foreground transition-colors">Status</a></li>
            </ul>
          </div>

          <div>
            <h4 class="font-semibold mb-4">Legal</h4>
            <ul class="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" class="hover:text-foreground transition-colors">Privacidade</a></li>
              <li><a href="#" class="hover:text-foreground transition-colors">Termos</a></li>
              <li><a href="#" class="hover:text-foreground transition-colors">Cookies</a></li>
            </ul>
          </div>
        </div>

        <div class="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p class="text-muted-foreground text-sm">
            © 2024 TeacherPlus. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, reactive } from 'vue'
import {
  GraduationCap,
  Users,
  BookOpen,
  Sparkles,
  Brain,
  Target,
  Zap,
  BookMarked,
  MessageSquare,
  BarChart3,
  Shield,
  Check,
  ChevronDown
} from 'lucide-vue-next'

const isAnnual = ref(false)
const openFaq = ref(null)

// Added scroll animation refs and visibility states
const heroTitle = ref(null)
const heroButtons = ref(null)
const heroCard = ref(null)
const stepsHeader = ref(null)
const featuresHeader = ref(null)
const pricingHeader = ref(null)
const faqHeader = ref(null)
const footer = ref(null)

const stepRefs = ref([])
const featureRefs = ref([])
const planRefs = ref([])
const faqRefs = ref([])

const heroTitleVisible = ref(false)
const heroButtonsVisible = ref(false)
const heroCardVisible = ref(false)
const stepsHeaderVisible = ref(false)
const featuresHeaderVisible = ref(false)
const pricingHeaderVisible = ref(false)
const faqHeaderVisible = ref(false)
const footerVisible = ref(false)

const stepVisibility = reactive(Array(3).fill(false))
const featureVisibility = reactive(Array(6).fill(false))
const planVisibility = reactive(Array(3).fill(false))
const faqVisibility = reactive(Array(5).fill(false))

// Added intersection observer for scroll animations
let observer = null

const createObserver = () => {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const element = entry.target

          // Hero section elements
          if (element === heroTitle.value) heroTitleVisible.value = true
          if (element === heroButtons.value) heroButtonsVisible.value = true
          if (element === heroCard.value) heroCardVisible.value = true

          // Section headers
          if (element === stepsHeader.value) stepsHeaderVisible.value = true
          if (element === featuresHeader.value) featuresHeaderVisible.value = true
          if (element === pricingHeader.value) pricingHeaderVisible.value = true
          if (element === faqHeader.value) faqHeaderVisible.value = true
          if (element === footer.value) footerVisible.value = true

          // Steps
          stepRefs.value.forEach((ref, index) => {
            if (element === ref) stepVisibility[index] = true
          })

          // Features
          featureRefs.value.forEach((ref, index) => {
            if (element === ref) featureVisibility[index] = true
          })

          // Plans
          planRefs.value.forEach((ref, index) => {
            if (element === ref) planVisibility[index] = true
          })

          // FAQs
          faqRefs.value.forEach((ref, index) => {
            if (element === ref) faqVisibility[index] = true
          })
        }
      })
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    }
  )
}

onMounted(() => {
  createObserver()

  // Observe all elements
  const elementsToObserve = [
    heroTitle.value,
    heroButtons.value,
    heroCard.value,
    stepsHeader.value,
    featuresHeader.value,
    pricingHeader.value,
    faqHeader.value,
    footer.value,
    ...stepRefs.value,
    ...featureRefs.value,
    ...planRefs.value,
    ...faqRefs.value
  ].filter(Boolean)

  elementsToObserve.forEach(el => observer.observe(el))
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})

const steps = [
  {
    icon: Brain,
    title: "Análise Inteligente",
    description: "Nossa IA analisa seu perfil, objetivos e estilo de aprendizado para criar um plano personalizado."
  },
  {
    icon: Target,
    title: "Plano Personalizado",
    description: "Receba um cronograma de estudos adaptado às suas necessidades e disponibilidade de tempo."
  },
  {
    icon: Zap,
    title: "Evolução Contínua",
    description: "Acompanhe seu progresso em tempo real e ajuste automaticamente seu plano conforme evolui."
  }
]

const features = [
  {
    icon: BookMarked,
    title: "Flashcards Inteligentes",
    description: "Sistema de repetição espaçada com IA que otimiza a retenção de conhecimento."
  },
  {
    icon: MessageSquare,
    title: "Quizzes Adaptativos",
    description: "Questões que se ajustam ao seu nível de conhecimento em tempo real."
  },
  {
    icon: BarChart3,
    title: "Diagnóstico Preciso",
    description: "Avaliações detalhadas que identificam pontos fortes e áreas de melhoria."
  },
  {
    icon: Brain,
    title: "RAG Educacional",
    description: "Sistema de busca inteligente que encontra conteúdo relevante instantaneamente."
  },
  {
    icon: Target,
    title: "Metas Inteligentes",
    description: "Definição automática de objetivos realistas baseados no seu progresso."
  },
  {
    icon: Shield,
    title: "Ambiente Seguro",
    description: "Plataforma protegida com criptografia de ponta a ponta para seus dados."
  }
]

const plans = [
  {
    name: "Estudante",
    monthlyPrice: "29",
    yearlyPrice: "290",
    description: "Perfeito para estudantes individuais",
    features: [
      "Plano de estudos personalizado",
      "Flashcards inteligentes",
      "Quizzes adaptativos",
      "Relatórios de progresso",
      "Suporte por email"
    ],
    cta: "Começar Gratuitamente",
    popular: false
  },
  {
    name: "Professor",
    monthlyPrice: "79",
    yearlyPrice: "790",
    description: "Ideal para educadores profissionais",
    features: [
      "Tudo do plano Estudante",
      "Criação de turmas",
      "Dashboard de acompanhamento",
      "Relatórios detalhados",
      "Integração com LMS",
      "Suporte prioritário"
    ],
    cta: "Experimentar 14 dias grátis",
    popular: true
  },
  {
    name: "Instituição",
    monthlyPrice: "199",
    yearlyPrice: "1990",
    description: "Para escolas e universidades",
    features: [
      "Tudo do plano Professor",
      "Usuários ilimitados",
      "API personalizada",
      "Treinamento da equipe",
      "Suporte dedicado",
      "SLA garantido"
    ],
    cta: "Falar com Vendas",
    popular: false
  }
]

const faqs = [
  {
    question: "Como a IA personaliza meu plano de estudos?",
    answer: "Nossa IA analisa seu histórico de aprendizado, preferências, disponibilidade de tempo e objetivos para criar um plano único. O sistema se adapta continuamente baseado no seu progresso e feedback."
  },
  {
    question: "Posso usar a plataforma offline?",
    answer: "Sim! Muitas funcionalidades estão disponíveis offline, incluindo flashcards baixados e conteúdo sincronizado. Quando você se reconectar, tudo será sincronizado automaticamente."
  },
  {
    question: "Como funciona o período de teste gratuito?",
    answer: "Oferecemos 14 dias gratuitos para todos os planos. Você tem acesso completo a todas as funcionalidades sem compromisso. Pode cancelar a qualquer momento durante o período de teste."
  },
  {
    question: "A plataforma é adequada para todas as idades?",
    answer: "Sim! Nossa plataforma é projetada para estudantes de todas as idades, desde ensino fundamental até pós-graduação. A IA adapta a interface e conteúdo conforme o perfil do usuário."
  },
  {
    question: "Como posso integrar com outras ferramentas educacionais?",
    answer: "Oferecemos integrações nativas com principais LMS como Moodle, Canvas e Google Classroom. Também temos uma API robusta para integrações personalizadas."
  }
]

const toggleFaq = (index) => {
  openFaq.value = openFaq.value === index ? null : index
}
</script>

<style scoped>
/* Animated gradient background keyframes */
@keyframes gradient-shift {

  0%,
  100% {
    transform: translateX(0%) translateY(0%) rotate(0deg);
    opacity: 0.8;
  }

  25% {
    transform: translateX(5%) translateY(-5%) rotate(1deg);
    opacity: 0.6;
  }

  50% {
    transform: translateX(-3%) translateY(3%) rotate(-0.5deg);
    opacity: 0.9;
  }

  75% {
    transform: translateX(2%) translateY(-2%) rotate(0.5deg);
    opacity: 0.7;
  }
}

@keyframes gradient-shift-reverse {

  0%,
  100% {
    transform: translateX(0%) translateY(0%) rotate(0deg);
    opacity: 0.6;
  }

  25% {
    transform: translateX(-4%) translateY(4%) rotate(-1deg);
    opacity: 0.8;
  }

  50% {
    transform: translateX(3%) translateY(-3%) rotate(0.8deg);
    opacity: 0.5;
  }

  75% {
    transform: translateX(-2%) translateY(2%) rotate(-0.3deg);
    opacity: 0.9;
  }
}

.animate-gradient-shift {
  animation: gradient-shift 20s ease-in-out infinite;
}

.animate-gradient-shift-reverse {
  animation: gradient-shift-reverse 25s ease-in-out infinite reverse;
}

/* Animações personalizadas */
@keyframes float {

  0%,
  100% {
    transform: translateY(0px);
  }

  50% {
    transform: translateY(-10px);
  }
}

.float-animation {
  animation: float 6s ease-in-out infinite;
}

/* Gradientes personalizados */
.gradient-text {
  background: linear-gradient(135deg, var(--primary), var(--accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Efeitos de hover aprimorados */
.hover-glow:hover {
  box-shadow: 0 0 30px rgba(99, 102, 241, 0.3);
}

/* Enhanced smooth transitions with longer durations */
* {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
  transition-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  transition-duration: 300ms;
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

</style>
