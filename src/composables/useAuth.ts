import { useAuthStore } from '@/stores/auth'
import { client } from '@/api/client'
import { useRouter } from 'vue-router'
import { schemas } from '@/api/schemas'
import z from 'zod'

type UserWrite = z.infer<typeof schemas.UserWrite>

export function useAuth() {
  const store = useAuthStore()
  const router = useRouter()

  const login = async (username: string, password: string) => {
    store.loading = true
    store.error = ''
    try {
      await client.loginUser({ username, password })
      await store.checkAuth()
      router.push('/wizard-simulado')
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } }
      store.error = error.response?.data?.detail || 'Credenciais inválidas'
    } finally {
      store.loading = false
    }
  }

  const logout = async () => {
    store.loading = true
    try {
      await client.logoutUser(undefined)
      store.isAuthenticated = false
      store.user = null
      router.push('/login')
    } finally {
      store.loading = false
    }
  }

  const signup = async (userData: UserWrite) => {
    console.log('Signing up user!')
    store.loading = true
    store.error = ''
    try {
      await client.createUser(userData)
      // After signup, auto login
      await login(userData.username, userData.password)
    } catch (err: unknown) {
      console.log('Erro tentando criar conta: ', err)
      const error = err as { response?: { data?: { detail?: string } } }
      store.error = error.response?.data?.detail || 'Erro ao criar conta'
    } finally {
      store.loading = false
    }
  }

  return {
    ...store,
    login,
    logout,
    signup
  }
}
