import { defineStore } from 'pinia'
import { ref } from 'vue'
import { client } from '@/api/client'
import { schemas } from '@/api/schemas'

type UserRead = typeof schemas.UserRead._type

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)
  const user = ref<UserRead | null>(null)
  const loading = ref(false)
  const error = ref('')
  const authChecked = ref(false)

  const checkAuth = async () => {
    if (authChecked.value) return
    try {
      const userData = await client.getCurrentUser()
      isAuthenticated.value = true
      user.value = userData
    } catch {
      isAuthenticated.value = false
      user.value = null
    } finally {
      authChecked.value = true
    }
  }

  return {
    isAuthenticated,
    user,
    loading,
    error,
    authChecked,
    checkAuth
  }
})
