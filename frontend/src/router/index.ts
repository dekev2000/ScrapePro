import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import MainLayout from '../components/layout/MainLayout.vue'

// Import views
const Home = () => import('../views/Home.vue')
const Dashboard = () => import('../views/Dashboard.vue')
const Login = () => import('../views/auth/Login.vue')
const Register = () => import('../views/auth/Register.vue')
const ForgotPassword = () => import('../views/auth/ForgotPassword.vue')
const ResetPassword = () => import('../views/auth/ResetPassword.vue')
const Scrapes = () => import('../views/scrapes/ScrapesList.vue')
const PreviewSites = () => import('../views/previews/PreviewsList.vue')
const Prospects = () => import('../views/prospects/ProspectsList.vue')
const Clients = () => import('../views/clients/ClientsList.vue')
const Businesses = () => import('../views/BusinessesView.vue')
const ScrapeBuilder = () => import('../views/tools/ScrapeBuilder.vue')
const SiteDesigner = () => import('../views/tools/SiteDesigner.vue')
const TasksKanban = () => import('../views/tasks/TasksKanban.vue')
const FullscreenPreview = () => import('../views/tools/FullscreenPreview.vue')
const DataExplorer = () => import('../views/tools/DataExplorer.vue')
const ToolsPage = () => import('../views/tools/ToolsPage.vue')
const EmailTemplateManager = () => import('../views/tools/EmailTemplateManager.vue')
const Account = () => import('../views/settings/Account.vue')
const Team = () => import('../views/settings/Team.vue')
const GooglePlacesTest = () => import('../components/scrapes/GooglePlacesTest.vue')

const SettingsPage = () => import('../views/settings/SettingsPage.vue')

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      requiresAuth: false,
      layout: 'default',
      title: 'Web Scraping & Preview Sites'
    }
  },

  {
    path: '/auth/login',
    name: 'Login',
    component: Login,
    meta: {
      requiresAuth: false,
      layout: 'default',
      title: 'Login'
    }
  },
  {
    path: '/auth/register',
    name: 'Register',
    component: Register,
    meta: {
      requiresAuth: false,
      layout: 'default',
      title: 'Register'
    }
  },
  {
    path: '/auth/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPassword,
    meta: {
      requiresAuth: false,
      layout: 'default',
      title: 'Forgot Password'
    }
  },
  {
    path: '/auth/reset-password/:token',
    name: 'ResetPassword',
    component: ResetPassword,
    meta: {
      requiresAuth: false,
      layout: 'default',
      title: 'Reset Password'
    }
  },
  {
    path: '/login',
    redirect: '/auth/login'
  },
  {
    path: '/register',
    redirect: '/auth/register'
  },
  {
    path: '/dashboard',
    component: MainLayout,
    meta: {
      requiresAuth: true
    },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: Dashboard,
        meta: {
          title: 'Dashboard'
        }
      },
      {
        path: 'scrapes',
        name: 'Scrapes',
        component: Scrapes,
        meta: {
          title: 'Scrapes'
        }
      },
      {
        path: 'preview-sites',
        name: 'PreviewSites',
        component: PreviewSites,
        meta: {
          title: 'Preview Sites'
        }
      },
      {
        path: 'businesses',
        name: 'Businesses',
        component: Businesses,
        meta: {
          title: 'Entreprises'
        }
      },
      {
        path: 'prospects',
        name: 'Prospects',
        component: Prospects,
        meta: {
          title: 'Prospects'
        }
      },
      {
        path: 'clients',
        name: 'Clients',
        component: Clients,
        meta: {
          title: 'Clients'
        }
      },
      {
        path: 'scrape-builder',
        name: 'ScrapeBuilder',
        component: ScrapeBuilder,
        meta: {
          title: 'Scrape Builder'
        }
      },
      {
        path: 'site-designer',
        name: 'SiteDesigner',
        component: SiteDesigner,
        meta: {
          title: 'Site Designer'
        }
      },
      {
        path: 'data-explorer',
        name: 'DataExplorer',
        component: DataExplorer,
        meta: {
          title: 'Data Explorer'
        }
      },
      {
        path: 'email-templates',
        name: 'EmailTemplateManager',
        component: EmailTemplateManager,
        meta: {
          title: 'Email Templates'
        }
      },
      {
        path: 'account',
        name: 'Account',
        component: Account,
        meta: {
          title: 'Account'
        }
      },
      {
        path: 'team',
        name: 'Team',
        component: Team,
        meta: {
          title: 'Team'
        }
      },

      {
        path: 'tools',
        name: 'Tools',
        component: ToolsPage,
        meta: {
          title: 'Tools'
        }
      },
      {
        path: 'google-places-test',
        name: 'GooglePlacesTest',
        component: GooglePlacesTest,
        meta: {
          title: 'Google Places API Test'
        }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: SettingsPage,
        meta: {
          title: 'Settings'
        }
      },
      {
        path: 'tasks',
        name: 'Tasks',
        component: TasksKanban,
        meta: {
          title: 'Task Management'
        }
      }
    ]
  },
  // Fullscreen preview route (outside of main layout)
  {
    path: '/fullscreen-preview',
    name: 'FullscreenPreview',
    component: FullscreenPreview,
    meta: {
      requiresAuth: true,
      layout: 'none',
      title: 'Website Preview'
    }
  },
  // Catch-all route for 404
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth !== false)
  const isAuthenticated = authStore.isAuthenticated

  // Set document title
  document.title = to.meta.title ? `${to.meta.title as string} | ScrapePro` : 'ScrapePro'

  if (requiresAuth && !isAuthenticated) {
    next('/auth/login')
  } else if (to.path.startsWith('/auth') && isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
