<template>
  <div class="study-plans">
    <div class="page-header">
      <h1>Planos de Estudo</h1>
      <p>Crie planos personalizados com base nos seus objetivos</p>
    </div>

    <!-- Collapsible Chat -->
    <CollapsibleChat />

    <!-- Plan Generation -->
    <div class="plan-generation">
      <Card className="generation-card">
        <h2>Gerar Novo Plano</h2>
        <p>Descreva o que você gostaria de estudar e eu criarei um roadmap personalizado para você.</p>
        
        <form @submit.prevent="generatePlan" class="generation-form">
          <textarea
            v-model="planInput"
            placeholder="Ex: Quero estudar matemática para o ENEM, focando em álgebra e geometria..."
            class="plan-input"
            rows="3"
            :disabled="isGenerating"
          ></textarea>
          <Button
            type="submit"
            :loading="isGenerating"
            :disabled="!planInput.trim()"
            variant="primary"
            size="lg"
          >
            <Sparkles :size="20" />
            Gerar Plano
          </Button>
        </form>
      </Card>
    </div>

    <!-- Generated Plan -->
    <div v-if="generatedPlan.length > 0" class="roadmap-section">
      <h2>Seu Plano de Estudos</h2>
      <div class="roadmap">
        <div class="roadmap-line"></div>
        <div
          v-for="(module, index) in generatedPlan"
          :key="module.id"
          class="roadmap-item"
          v-motion
          :initial="{ opacity: 0, x: -20 }"
          :enter="{ 
            opacity: 1, 
            x: 0, 
            transition: { 
              duration: 400, 
              delay: index * 100,
              ease: 'easeOut' 
            } 
          }"
        >
          <div class="roadmap-node">
            <div class="node-number">{{ index + 1 }}</div>
          </div>
          <Card className="module-card">
            <div class="module-header">
              <h3>{{ module.title }}</h3>
              <div class="module-badge" :class="`badge-${module.level.toLowerCase()}`">
                {{ module.level }}
              </div>
            </div>
            <ul class="module-topics">
              <li v-for="topic in module.topics" :key="topic">
                <Check :size="16" />
                {{ topic }}
              </li>
            </ul>
            <div class="module-footer">
              <span class="module-duration">{{ module.duration }}</span>
              <Button variant="outline" size="sm">
                Começar
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Sparkles, Check } from 'lucide-vue-next'
import CollapsibleChat from '@/components/CollapsibleChat.vue'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import type { StudyModule } from '@/types'

const planInput = ref('')
const isGenerating = ref(false)
const generatedPlan = ref<StudyModule[]>([])

const mockModules: StudyModule[] = [
  {
    id: '1',
    title: 'Fundamentos de Álgebra',
    topics: ['Equações do 1º grau', 'Sistemas lineares', 'Inequações', 'Funções básicas'],
    level: 'Básico',
    duration: '2 semanas'
  },
  {
    id: '2',
    title: 'Geometria Plana',
    topics: ['Triângulos e propriedades', 'Quadriláteros', 'Círculos e circunferências', 'Áreas e perímetros'],
    level: 'Básico',
    duration: '3 semanas'
  },
  {
    id: '3',
    title: 'Funções Avançadas',
    topics: ['Função quadrática', 'Função exponencial', 'Função logarítmica', 'Análise de gráficos'],
    level: 'Intermediário',
    duration: '3 semanas'
  },
  {
    id: '4',
    title: 'Geometria Espacial',
    topics: ['Prismas e pirâmides', 'Cilindros e cones', 'Esferas', 'Volumes e áreas'],
    level: 'Intermediário',
    duration: '2 semanas'
  },
  {
    id: '5',
    title: 'Trigonometria',
    topics: ['Razões trigonométricas', 'Círculo trigonométrico', 'Identidades', 'Equações trigonométricas'],
    level: 'Intermediário',
    duration: '4 semanas'
  },
  {
    id: '6',
    title: 'Análise Combinatória',
    topics: ['Princípio fundamental', 'Permutações', 'Arranjos', 'Combinações'],
    level: 'Avançado',
    duration: '2 semanas'
  },
  {
    id: '7',
    title: 'Probabilidade',
    topics: ['Espaço amostral', 'Probabilidade condicional', 'Distribuições', 'Teorema de Bayes'],
    level: 'Avançado',
    duration: '3 semanas'
  },
  {
    id: '8',
    title: 'Estatística',
    topics: ['Medidas de tendência', 'Medidas de dispersão', 'Gráficos estatísticos', 'Análise de dados'],
    level: 'Avançado',
    duration: '2 semanas'
  }
]

const generatePlan = async () => {
  if (!planInput.value.trim() || isGenerating.value) return

  isGenerating.value = true
  generatedPlan.value = []

  // Simulate API call
  setTimeout(() => {
    generatedPlan.value = mockModules
    isGenerating.value = false
    planInput.value = ''
  }, 2000)
}
</script>

<style scoped>
.study-plans {
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: var(--fg-base);
  margin: 0 0 8px 0;
}

.page-header p {
  font-size: 18px;
  color: var(--fg-muted);
  margin: 0;
}

.plan-generation {
  margin-bottom: 48px;
}

.generation-card {
  text-align: center;
}

.generation-card h2 {
  font-size: 24px;
  font-weight: 600;
  color: var(--fg-base);
  margin: 0 0 8px 0;
}

.generation-card p {
  color: var(--fg-muted);
  margin: 0 0 24px 0;
  line-height: 1.6;
}

.generation-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
}

.plan-input {
  width: 100%;
  max-width: 600px;
  padding: 16px 20px;
  background: var(--bg-elev2);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--fg-base);
  font-size: 16px;
  line-height: 1.5;
  resize: vertical;
  outline: none;
  transition: all var(--dur-fast) var(--ease-standard);
}

.plan-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
}

.plan-input::placeholder {
  color: var(--fg-subtle);
}

.roadmap-section {
  margin-top: 48px;
}

.roadmap-section h2 {
  font-size: 28px;
  font-weight: 600;
  color: var(--fg-base);
  margin: 0 0 32px 0;
  text-align: center;
}

.roadmap {
  position: relative;
  padding: 0 20px;
}

.roadmap-line {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, var(--primary), var(--secondary));
  transform: translateX(-50%);
  z-index: 1;
}

.roadmap-item {
  display: flex;
  align-items: center;
  margin-bottom: 32px;
  position: relative;
}

.roadmap-item:nth-child(even) {
  flex-direction: row-reverse;
}

.roadmap-node {
  width: 60px;
  height: 60px;
  background: var(--primary);
  border: 4px solid var(--bg-base);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
  flex-shrink: 0;
}

.node-number {
  color: var(--fg-base);
  font-weight: 700;
  font-size: 18px;
}

.module-card {
  flex: 1;
  max-width: 400px;
  margin: 0 24px;
}

.module-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.module-header h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--fg-base);
  margin: 0;
}

.module-badge {
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-básico {
  background: rgba(34, 197, 94, 0.2);
  color: var(--success);
}

.badge-intermediário {
  background: rgba(245, 158, 11, 0.2);
  color: var(--warning);
}

.badge-avançado {
  background: rgba(239, 68, 68, 0.2);
  color: var(--danger);
}

.module-topics {
  list-style: none;
  padding: 0;
  margin: 0 0 20px 0;
}

.module-topics li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  color: var(--fg-muted);
  font-size: 14px;
}

.module-topics li svg {
  color: var(--success);
  flex-shrink: 0;
}

.module-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}

.module-duration {
  color: var(--fg-subtle);
  font-size: 14px;
  font-weight: 500;
}

/* Mobile Styles */
@media (max-width: 768px) {
  .page-header h1 {
    font-size: 28px;
  }
  
  .page-header p {
    font-size: 16px;
  }
  
  .roadmap {
    padding: 0 10px;
  }
  
  .roadmap-line {
    left: 30px;
    transform: none;
  }
  
  .roadmap-item {
    flex-direction: row !important;
    align-items: flex-start;
  }
  
  .roadmap-node {
    width: 40px;
    height: 40px;
    margin-right: 20px;
  }
  
  .node-number {
    font-size: 14px;
  }
  
  .module-card {
    margin: 0;
    max-width: none;
  }
  
  .module-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
