import { createRouter, createWebHistory } from 'vue-router'
import WizardSimulado from '@/pages/wizard/WizardSimulado.vue'
import LoginSignup from '@/pages/auth/LoginPage.vue'
import Home from '@/pages/home/HomePage.vue'
import SignupPage from '@/pages/auth/SignupPage.vue'
import { useAuthStore } from '@/features/auth/model/store'

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
