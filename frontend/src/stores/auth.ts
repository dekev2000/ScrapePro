import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
// No need for axios import
import { mockLogin, mockRegister, mockLogout } from '../services/directMockAuth'

// No need for a dedicated API instance since we're using mock data only
// We'll log authentication actions for debugging
const logAuthAction = (action: string, data?: any) => {
  console.log(`🔐 Auth Action: ${action}`, data ?? {})
}

interface User {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
}

interface LoginCredentials {
  email: string
  password: string
}

interface RegisterData {
  name: string
  email: string
  password: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value)

  // Initialize auth state from localStorage
  const initAuth = () => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (storedToken) {
      token.value = storedToken
    }

    if (storedUser) {
      try {
        user.value = JSON.parse(storedUser)
      } catch (e) {
        console.error('Failed to parse stored user data:', e)
        localStorage.removeItem('user')
      }
    }
  }

  // Initialize on store creation
  initAuth()

  const setAuthData = (userData: User, tokenValue: string) => {
    user.value = userData
    token.value = tokenValue

    // Save to localStorage
    localStorage.setItem('token', tokenValue)
    localStorage.setItem('user', JSON.stringify(userData))

    logAuthAction('setAuthData', { user: userData })
  }

  const clearAuthData = () => {
    user.value = null
    token.value = null

    // Clear localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    logAuthAction('clearAuthData')
  }

  const login = async (credentials: LoginCredentials) => {
    loading.value = true
    error.value = null

    try {
      logAuthAction('login', { email: credentials.email })

      // Use mock login
      const response = await mockLogin(credentials.email, credentials.password)
      setAuthData(response.user, response.token)
      return response
    } catch (err: any) {
      console.error('Login error:', err)
      error.value = err.message ?? 'Invalid credentials'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  const register = async (registerData: RegisterData) => {
    loading.value = true
    error.value = null

    try {
      logAuthAction('register', { email: registerData.email, name: registerData.name })

      // Use mock register
      const response = await mockRegister(
        registerData.name,
        registerData.email,
        registerData.password
      )
      setAuthData(response.user, response.token)
      return response
    } catch (err: any) {
      console.error('Registration error:', err)
      error.value = err.message ?? 'Registration failed'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    loading.value = true

    try {
      logAuthAction('logout')
      await mockLogout()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      clearAuthData()
      loading.value = false
    }
  }

  const getUser = async () => {
    if (!token.value) return null

    loading.value = true
    error.value = null

    try {
      logAuthAction('getUser')

      // Just return the current user from state
      return user.value
    } catch (err: any) {
      console.error('Get user error:', err)
      error.value = err.message ?? 'Failed to get user data'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Update user details (name/email)
  const updateUserDetails = async (updateData: { name?: string; email?: string }) => {
    if (!token.value) throw new Error('Not authenticated')

    loading.value = true
    error.value = null

    try {
      logAuthAction('updateUserDetails', updateData)

      // Update the user in state
      if (user.value) {
        const updatedUser = {
          ...user.value,
          ...updateData
        }
        user.value = updatedUser
        localStorage.setItem('user', JSON.stringify(updatedUser))
      }

      return user.value
    } catch (err: any) {
      console.error('Update user details error:', err)
      error.value = err.message ?? 'Failed to update profile'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Update password
  const updatePassword = async (updateData: { currentPassword: string; newPassword: string }) => {
    if (!token.value) throw new Error('Not authenticated')

    loading.value = true
    error.value = null

    try {
      logAuthAction('updatePassword')

      // Just pretend it worked
      return true
    } catch (err: any) {
      console.error('Update password error:', err)
      error.value = err.message ?? 'Failed to update password'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    getUser,
    updateUserDetails,
    updatePassword
  }
})
