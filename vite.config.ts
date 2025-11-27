import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

import tailwindcss from '@tailwindcss/vite'

const defaultAllowedHosts = [
  'teacher-front.ngrok-free.app',
  'localhost',
  'pc.local.test',
]

const envAllowedHostsValue =
  process.env.VITE_ALLOWED_HOSTS ?? process.env.VITE_ALLOWED_HOST ?? ''

const envAllowedHosts = envAllowedHostsValue
  .split(',')
  .map((host) => host.trim())
  .filter(Boolean)

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    allowedHosts: envAllowedHosts.length ? envAllowedHosts : defaultAllowedHosts,
    port: 5175,
  },
})
