<template>
  <div class="app-container">
    <aside class="sidebar">
      <div class="sidebar-header">
        <img
          src="/logo-placeholder.svg"
          alt="ScrapePro Logo"
          class="logo"
        />
        <h2 class="brand">ScrapePro</h2>
      </div>

      <div class="sidebar-content">
        <h3
          class="sidebar-section"
          id="main-nav-heading"
        >MAIN</h3>
        <nav
          class="sidebar-nav"
          aria-labelledby="main-nav-heading"
        >
          <router-link
            to="/dashboard"
            class="nav-item"
            active-class="active"
          >
            <i class="fas fa-chart-pie"></i>
            <span>Dashboard</span>
          </router-link>
          <router-link
            to="/dashboard/scrapes"
            class="nav-item"
            active-class="active"
          >
            <i class="fas fa-globe"></i>
            <span>Scrapes</span>
          </router-link>
          <router-link
            to="/dashboard/preview-sites"
            class="nav-item"
            active-class="active"
          >
            <i class="fas fa-desktop"></i>
            <span>Preview Sites</span>
          </router-link>
          <router-link
            to="/dashboard/businesses"
            class="nav-item"
            active-class="active"
          >
            <i class="fas fa-store"></i>
            <span>Entreprises</span>
          </router-link>
          <router-link
            to="/dashboard/prospects"
            class="nav-item"
            active-class="active"
          >
            <i class="fas fa-building"></i>
            <span>Prospects</span>
          </router-link>
          <router-link
            to="/dashboard/clients"
            class="nav-item"
            active-class="active"
          >
            <i class="fas fa-users"></i>
            <span>Clients</span>
          </router-link>
          <router-link
            to="/dashboard/tasks"
            class="nav-item"
            active-class="active"
          >
            <i class="fas fa-tasks"></i>
            <span>Tasks</span>
          </router-link>
        </nav>

        <h3
          class="sidebar-section"
          id="tools-nav-heading"
        >TOOLS</h3>
        <nav
          class="sidebar-nav"
          aria-labelledby="tools-nav-heading"
        >
          <router-link
            to="/dashboard/tools"
            class="nav-item"
            active-class="active"
            exact
          >
            <i class="fas fa-toolbox"></i>
            <span>All Tools</span>
          </router-link>
          <router-link
            to="/dashboard/scrape-builder"
            class="nav-item"
            active-class="active"
          >
            <i class="fas fa-tools"></i>
            <span>Scrape Builder</span>
          </router-link>
          <router-link
            to="/dashboard/site-designer"
            class="nav-item"
            active-class="active"
          >
            <i class="fas fa-edit"></i>
            <span>Site Designer</span>
          </router-link>
          <router-link
            to="/dashboard/data-explorer"
            class="nav-item"
            active-class="active"
          >
            <i class="fas fa-database"></i>
            <span>Data Explorer</span>
          </router-link>
        </nav>

        <h3
          class="sidebar-section"
          id="settings-nav-heading"
        >SETTINGS</h3>
        <nav
          class="sidebar-nav"
          aria-labelledby="settings-nav-heading"
        >
          <router-link
            to="/dashboard/settings"
            class="nav-item"
            active-class="active"
            exact
          >
            <i class="fas fa-cog"></i>
            <span>All Settings</span>
          </router-link>
          <router-link
            to="/dashboard/account"
            class="nav-item"
            active-class="active"
          >
            <i class="fas fa-user"></i>
            <span>Account</span>
          </router-link>
          <router-link
            to="/dashboard/team"
            class="nav-item"
            active-class="active"
          >
            <i class="fas fa-users-cog"></i>
            <span>Team</span>
          </router-link>

        </nav>
      </div>

      <div class="sidebar-footer">
        <p class="version">ScrapePro v1.0.0</p>
        <p class="copyright">© {{ currentYear }} ScrapePro Inc.</p>
      </div>
    </aside>

    <div class="main-content">
      <header class="top-header">
        <div class="header-left">
          <button
            class="menu-toggle"
            @click="toggleSidebar"
          >
            <i class="fas fa-bars"></i>
          </button>
          <h1 class="brand">ScrapePro</h1>
        </div>

        <div class="header-right">
          <GlobalSearch />

          <TaskButton />

          <NotificationCenter />

          <button
            class="theme-toggle"
            @click="toggleTheme"
            title="Toggle dark/light mode"
          >
            <i :class="isDarkMode ? 'fas fa-sun' : 'fas fa-moon'"></i>
          </button>

          <div
            class="user-profile"
            @click="toggleProfileMenu"
          >
            <img
              :src="userAvatar"
              alt="User avatar"
              class="avatar"
            />
            <span class="username">{{ userName }}</span>
            <i class="fas fa-chevron-down"></i>

            <transition name="dropdown">
              <div
                class="profile-menu"
                v-if="showProfileMenu"
              >
                <router-link to="/dashboard/account">My Profile</router-link>
                <router-link to="/dashboard/settings">Settings</router-link>
                <router-link to="/dashboard/tools">Tools</router-link>
                <router-link to="/dashboard/team">Team Settings</router-link>
                <a
                  href="#"
                  @click.prevent="logout"
                >Logout</a>
              </div>
            </transition>
          </div>
        </div>
      </header>

      <main class="content">
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/auth";
import { useTheme } from "../../composables/useTheme";
import GlobalSearch from "../search/GlobalSearch.vue";
import NotificationCenter from "../ui/NotificationCenter.vue";
import TaskButton from "../tasks/TaskButton.vue";

const router = useRouter();
const authStore = useAuthStore();
const { isDarkMode, toggleTheme } = useTheme();

// User data from auth store
const userName = computed(() => authStore.user?.name || "User");
const userAvatar = ref("/avatar-placeholder.svg");

// UI state
const sidebarCollapsed = ref(false);
const showProfileMenu = ref(false);

// Current year for footer
const currentYear = computed(() => new Date().getFullYear());

// Toggle sidebar visibility (for mobile)
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value;

  // Toggle class on the sidebar
  const sidebarElement = document.querySelector(".sidebar");
  if (sidebarElement) {
    sidebarElement.classList.toggle("open");
  }

  // Toggle class on the app container
  const appContainerElement = document.querySelector(".app-container");
  if (appContainerElement) {
    appContainerElement.classList.toggle("sidebar-open");
  }
};

// Toggle profile dropdown menu
const toggleProfileMenu = () => {
  showProfileMenu.value = !showProfileMenu.value;
};

// Logout function
const logout = async () => {
  try {
    await authStore.logout();
    router.push("/auth/login");
  } catch (error) {
    console.error("Logout failed:", error);
  }
};

// Close profile menu when clicking outside
const closeProfileMenu = (event: MouseEvent) => {
  const profileElement = document.querySelector(".user-profile");
  if (profileElement && !profileElement.contains(event.target as Node)) {
    showProfileMenu.value = false;
  }
};

// Fetch user data if needed
onMounted(() => {
  if (authStore.isAuthenticated && !authStore.user) {
    authStore.getUser().catch((error) => {
      console.error("Failed to fetch user data:", error);
      // If there was an error fetching the user, probably the token is invalid
      // so we log out and redirect to login
      authStore.logout();
      router.push("/auth/login");
    });
  }

  document.addEventListener("click", closeProfileMenu);

  return () => {
    document.removeEventListener("click", closeProfileMenu);
  };
});
</script>

<style scoped>
.app-container {
  display: flex;
  min-height: 100vh;
  background-color: #f6f8fa;
  width: 100vw;
  max-width: 100vw;
  position: relative;
  overflow-x: hidden;
}

.app-container.sidebar-open .main-content {
  margin-left: 0;
}

/* Sidebar Styles */
.sidebar {
  width: 250px;
  min-width: 250px;
  background-color: #4338ca;
  color: white;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease;
  overflow-y: auto;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 1000; /* Higher than header */
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
}

.sidebar-header {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo {
  width: 32px;
  height: 32px;
}

.brand {
  font-weight: 600;
  font-size: 1.25rem;
  color: #333;
  margin-left: 0.5rem;
}

.sidebar .brand {
  color: white;
  font-size: 1.5rem;
  margin: 0;
}

.sidebar-content {
  flex: 1;
  padding: 10px 15px;
  overflow-y: auto;
}

.sidebar-section {
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  margin: 20px 0 10px;
  padding-left: 10px;
  letter-spacing: 0.5px;
}

.sidebar-nav {
  margin-bottom: 20px;
}

.nav-item {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.85);
  padding: 12px 10px;
  border-radius: 6px;
  margin-bottom: 5px;
  transition: all 0.2s ease;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-item.active {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  font-weight: 500;
}

.nav-item i {
  font-size: 1rem;
  margin-right: 10px;
  width: 20px;
  text-align: center;
}

.sidebar-footer {
  padding: 15px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.version,
.copyright {
  margin: 5px 0;
}

/* Main Content Styles */
.main-content {
  flex: 1;
  margin-left: 250px;
  display: flex;
  flex-direction: column;
  min-width: 0;
  width: calc(100vw - 250px);
  transition: margin-left 0.3s ease, width 0.3s ease;
  box-sizing: border-box;
  overflow-x: hidden;
}

.top-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  position: fixed;
  top: 0;
  left: 250px;
  right: 0;
  z-index: 99;
  height: 70px;
  width: calc(100vw - 250px);
  transition: left 0.3s ease, width 0.3s ease;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.menu-toggle {
  background: none;
  border: none;
  color: #333;
  font-size: 1.25rem;
  cursor: pointer;
  margin-right: 15px;
  display: none;
}

.notifications {
  font-size: 1.25rem;
  color: #666;
  cursor: pointer;
  position: relative;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.user-profile:hover {
  background-color: #f5f5f5;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

.username {
  font-weight: 500;
  margin-right: 5px;
}

.profile-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 180px;
  background-color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 6px;
  padding: 6px 0;
  display: flex;
  flex-direction: column;
  z-index: 1000;
  border: 1px solid #eaeaea;
}

.profile-menu a {
  padding: 10px 16px;
  color: #333;
  text-decoration: none;
  transition: background-color 0.2s;
  font-size: 0.9rem;
}

.profile-menu a:hover {
  background-color: #f5f5f5;
}

/* Theme toggle button */
.theme-toggle {
  background: none;
  border: none;
  color: #666;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s, color 0.2s;
}

.theme-toggle:hover {
  background-color: #f5f5f5;
  color: #4338ca;
}

/* Main Content Area */
.content {
  padding: 0;
  flex: 1;
  overflow-y: auto;
  margin-top: 70px; /* Same as header height */
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

/* Mobile Responsive Styles */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .main-content {
    margin-left: 0;
    width: 100%;
  }

  .top-header {
    left: 0;
    width: 100%;
  }

  /* We don't need to adjust the header position for mobile in the open state */
  .app-container.sidebar-open .top-header {
    left: 0;
    width: 100%;
  }

  .menu-toggle {
    display: block;
  }

  .header-left .brand {
    display: inline-block;
  }
}

/* Dropdown animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>