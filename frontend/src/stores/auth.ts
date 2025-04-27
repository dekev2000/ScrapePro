import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import { mockLogin, mockRegister, mockLogout, mockGetUser } from '../services/directMockAuth'

// Create a dedicated API instance for authentication
const authApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 second timeout
})

// Add request/response logs
authApi.interceptors.request.use(
  config => {
    console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, config.data || {})
    return config
  },
  error => {
    console.error('❌ API Request Error:', error)
    return Promise.reject(error)
  }
)

authApi.interceptors.response.use(
  response => {
    console.log(`✅ API Response [${response.status}]:`, response.data)
    return response
  },
  error => {
    if (error.response) {
      console.error(`❌ API Error Response [${error.response.status}]:`, error.response.data)
    } else if (error.request) {
      console.error('❌ API No Response:', error.request)
    } else {
      console.error('❌ API Request Setup Error:', error.message)
    }
    return Promise.reject(error)
  }
)

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
      authApi.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
    }

    if (storedUser) {
      try {
        user.value = JSON.parse(storedUser)
      } catch (e) {
        localStorage.removeItem('user')
      }
    }
  }

  // Initialize on store creation
  initAuth()

  const setAuthData = (userData: User, tokenValue: string) => {
    user.value = userData
    token.value = tokenValue

    // Set axios auth header
    authApi.defaults.headers.common['Authorization'] = `Bearer ${tokenValue}`

    // Save to localStorage
    localStorage.setItem('token', tokenValue)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const clearAuthData = () => {
    user.value = null
    token.value = null

    // Remove axios auth header
    delete authApi.defaults.headers.common['Authorization']

    // Clear localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const login = async (credentials: LoginCredentials) => {
    loading.value = true
    error.value = null

    try {
      console.log('Making login request...')

      // Use direct mock login in development mode
      if (import.meta.env.DEV) {
        console.log('Using direct mock login');
        try {
          const response = await mockLogin(credentials.email, credentials.password);
          setAuthData(response.user, response.token);
          return response;
        } catch (mockErr: any) {
          console.error('Mock login error:', mockErr);
          error.value = mockErr.message || 'Invalid credentials';
          throw error.value;
        }
      }

      // Fall back to real API in production
      const response = await authApi.post('/auth/login', credentials)

      if (response.data.success) {
        setAuthData(response.data.user, response.data.token)
      } else {
        throw new Error(response.data.message || 'Login failed')
      }

      return response.data
    } catch (err: any) {
      console.error('Login error details:', err)
      if (err.message === 'Network Error') {
        error.value = 'Cannot connect to server. Please check if backend service is running.'
      } else {
        error.value = err.response?.data?.message || err.message || 'Login failed'
      }
      throw error.value
    } finally {
      loading.value = false
    }
  }

  const register = async (registerData: RegisterData) => {
    loading.value = true
    error.value = null

    try {
      console.log('Making register request...')

      // Use direct mock register in development mode
      if (import.meta.env.DEV) {
        console.log('Using direct mock register');
        try {
          const response = await mockRegister(
            registerData.name,
            registerData.email,
            registerData.password
          );
          setAuthData(response.user, response.token);
          return response;
        } catch (mockErr: any) {
          console.error('Mock register error:', mockErr);
          error.value = mockErr.message || 'Registration failed';
          throw error.value;
        }
      }

      // Fall back to real API in production
      const response = await authApi.post('/auth/register', registerData)

      if (response.data.success) {
        setAuthData(response.data.user, response.data.token)
      } else {
        throw new Error(response.data.message || 'Registration failed')
      }

      return response.data
    } catch (err: any) {
      console.error('Registration error details:', err)
      if (err.message === 'Network Error') {
        error.value = 'Cannot connect to server. Please check if backend service is running.'
      } else {
        error.value = err.response?.data?.error || err.message || 'Registration failed'
      }
      throw error.value
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    loading.value = true

    try {
      // Use direct mock logout in development mode
      if (import.meta.env.DEV) {
        console.log('Using direct mock logout');
        await mockLogout();
      } else if (token.value) {
        // Use real API in production
        await authApi.get('/auth/logout')
      }
    } catch (err) {
      console.error('Logout API error:', err)
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
      const response = await authApi.get('/auth/me')

      if (response.data.success) {
        user.value = response.data.data
        localStorage.setItem('user', JSON.stringify(response.data.data))
      } else {
        throw new Error(response.data.message || 'Failed to get user data')
      }

      return response.data.data
    } catch (err: any) {
      // If 401, clear auth state
      if (err.response?.status === 401) {
        clearAuthData()
      }

      error.value = err.response?.data?.message || err.message || 'Failed to get user data'
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
      const response = await authApi.put('/auth/updatedetails', updateData)

      if (response.data.success) {
        user.value = response.data.data
        localStorage.setItem('user', JSON.stringify(response.data.data))
      } else {
        throw new Error(response.data.message || 'Failed to update profile')
      }

      return response.data.data
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Failed to update profile'
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
      const response = await authApi.put('/auth/updatepassword', updateData)

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update password')
      }

      return true
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Failed to update password'
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
