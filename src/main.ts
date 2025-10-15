import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './app/providers/router'
import { MotionPlugin } from '@vueuse/motion'
import './app/styles/index.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(MotionPlugin)

app.mount('#app')
