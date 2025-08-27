import { createRouter, createWebHistory } from 'vue-router'
import WizardSimulado from '@/components/WizardSimulado.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/wizard-simulado', component: WizardSimulado },
  ],
})

export default router
