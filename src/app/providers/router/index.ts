import { createRouter, createWebHistory } from 'vue-router'
import WizardSimulado from '@/components/WizardSimulado.vue'
import LoginSignup from '@/components/LoginSignup.vue'
import Home from '@/components/Home.vue'
import SignupPage from '@/components/SignupPage.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: Home },
    { path: '/login', component: LoginSignup },
    { path: '/signup', component: SignupPage },
    { path: '/wizard-simulado', component: WizardSimulado, meta: { requiresAuth: true } },
  ],
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  if (!authStore.authChecked) {
    await authStore.checkAuth()
  }
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router
