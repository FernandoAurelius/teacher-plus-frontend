import { createRouter, createWebHistory } from 'vue-router'
import WizardSimulado from '@/components/WizardSimulado.vue'
import LoginSignup from '@/components/LoginSignup.vue'
import Home from '@/components/Home.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: Home },
    { path: '/login', component: LoginSignup },
    { path: '/wizard-simulado', component: WizardSimulado, meta: { requiresAuth: true } },
  ],
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router
