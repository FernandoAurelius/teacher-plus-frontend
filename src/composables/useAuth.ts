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
      const has_user_context = (await client.loginUser({ username, password })).has_user_context
      const userData = await client.getCurrentUser()
      store.isAuthenticated = true
      store.user = userData
      return { userData, has_user_context }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } }
      store.error = error.response?.data?.detail || 'Credenciais inválidas'
      throw err
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
