import { createRouter, createWebHistory } from 'vue-router'
import WizardPage from '@/pages/wizard/WizardPage.vue'
import LoginSignup from '@/pages/auth/LoginPage.vue'
import Home from '@/pages/home/HomePage.vue'
import SignupPage from '@/pages/auth/SignupPage.vue'
import LogoutPage from '@/pages/auth/LogoutPage.vue'
import PortalDashboardPage from '@/pages/portal/PortalDashboardPage.vue'
import PlanWorkspacePage from '@/pages/portal/PlanWorkspacePage.vue'
import { useAuthStore } from '@/features/auth/model/store'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: Home },
    { path: '/login', component: LoginSignup },
    { path: '/signup', component: SignupPage },
    { path: '/logout', component: LogoutPage, meta: { requiresAuth: true } },
    { path: '/wizard', component: WizardPage, meta: { requiresAuth: true } },
    { path: '/portal', component: PortalDashboardPage, meta: { requiresAuth: true, bgIcons: false } },
    { path: '/portal/:planId', component: PlanWorkspacePage, meta: { requiresAuth: true, bgIcons: false } },
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
