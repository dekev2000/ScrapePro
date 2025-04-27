import { ref, watch, onMounted } from 'vue'

type Theme = 'light' | 'dark' | 'system'

export function useTheme() {
  const theme = ref<Theme>(
    localStorage.getItem('theme') as Theme || 'system'
  )
  const systemDarkMode = ref(false)
  const isDarkMode = ref(false)

  // Check if system prefers dark mode
  const checkSystemDarkMode = () => {
    systemDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  // Update the actual theme based on the selected theme and system preference
  const updateActualTheme = () => {
    if (theme.value === 'system') {
      isDarkMode.value = systemDarkMode.value
    } else {
      isDarkMode.value = theme.value === 'dark'
    }

    // Apply theme to document
    if (isDarkMode.value) {
      document.documentElement.classList.add('dark-mode')
    } else {
      document.documentElement.classList.remove('dark-mode')
    }

    // Save theme preference to localStorage
    localStorage.setItem('theme', theme.value)
  }

  // Toggle between light and dark mode
  const toggleTheme = () => {
    if (theme.value === 'system') {
      theme.value = systemDarkMode.value ? 'light' : 'dark'
    } else if (theme.value === 'light') {
      theme.value = 'dark'
    } else {
      theme.value = 'light'
    }
  }

  // Set a specific theme
  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme
  }

  // Watch for changes in theme or system preference
  watch(theme, updateActualTheme)
  watch(systemDarkMode, () => {
    if (theme.value === 'system') {
      updateActualTheme()
    }
  })

  // Initialize
  onMounted(() => {
    checkSystemDarkMode()
    updateActualTheme()

    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', (e) => {
      systemDarkMode.value = e.matches
    })
  })

  return {
    theme,
    isDarkMode,
    toggleTheme,
    setTheme
  }
}
