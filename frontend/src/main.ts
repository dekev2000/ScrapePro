import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import './style.css'
import './assets/darkmode.css'
import { setupMockApi } from './services/mockApi'
import { setupMockAuth } from './services/mockAuth'

// Configure axios
axios.defaults.baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'
axios.defaults.withCredentials = true // Enable cookies for cross-domain requests

axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Setup mock services for development
if (import.meta.env.DEV) {
  console.log('Setting up mock services for development')
  setupMockAuth() // Setup mock authentication first
  setupMockApi() // Setup mock API second
}

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

// Add Font Awesome
const fontAwesomeCDN = document.createElement('link')
fontAwesomeCDN.rel = 'stylesheet'
fontAwesomeCDN.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
document.head.appendChild(fontAwesomeCDN)
