import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import './style.css'
import './assets/darkmode.css'
import { setupMockApi } from './services/mockApi'
import { setupMockAuth } from './services/mockAuth'

// Configure axios for mock data only
axios.defaults.baseURL = '/api' // This is just a placeholder, all requests will be intercepted

axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Setup mock services
console.log('Setting up mock services')
setupMockAuth() // Setup mock authentication first
setupMockApi() // Setup mock API second

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

// Add Font Awesome
const fontAwesomeCDN = document.createElement('link')
fontAwesomeCDN.rel = 'stylesheet'
fontAwesomeCDN.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
document.head.appendChild(fontAwesomeCDN)
