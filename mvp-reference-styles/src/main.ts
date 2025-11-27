import { createApp } from "vue"
import { createRouter, createWebHistory } from "vue-router"
import { MotionPlugin } from "@vueuse/motion"
import App from "./App.vue"
import "./assets/main.css"

// Import pages
import LandingPage from "./pages/LandingPage.vue"
import WizardChat from "./pages/WizardChat.vue"
import DashboardLayout from "./layouts/DashboardLayout.vue"
import StudyPlans from "./pages/StudyPlans.vue"
import Assessments from "./pages/Assessments.vue"
import Flashcards from "./pages/Flashcards.vue"

const routes = [
  { path: "/", component: LandingPage },
  { path: "/wizard", component: WizardChat },
  {
    path: "/app",
    component: DashboardLayout,
    children: [
      { path: "planos", component: StudyPlans },
      { path: "avaliacoes", component: Assessments },
      { path: "flashcards", component: Flashcards },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

const app = createApp(App)
app.use(router)
app.use(MotionPlugin)
app.mount("#app")
