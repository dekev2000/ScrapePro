<template>
  <div class="settings-page">
    <div class="settings-header">
      <h1>Settings</h1>
      <p class="subtitle">Manage your account and application settings</p>
    </div>

    <div class="settings-container">
      <div class="settings-sidebar">
        <div
          v-for="section in settingsSections"
          :key="section.id"
          :class="['settings-nav-item', { active: activeSection === section.id }]"
          @click="activeSection = section.id"
        >
          <i :class="section.icon"></i>
          <span>{{ section.name }}</span>
        </div>
      </div>

      <div class="settings-content">
        <!-- Profile Settings -->
        <div
          v-if="activeSection === 'profile'"
          class="settings-section"
        >
          <h2>Profile Settings</h2>

          <div class="form-group">
            <label for="name">Name</label>
            <input
              type="text"
              id="name"
              v-model="profile.name"
            />
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              v-model="profile.email"
            />
          </div>

          <div class="form-group">
            <label for="role">Role</label>
            <input
              type="text"
              id="role"
              v-model="profile.role"
              disabled
            />
          </div>

          <div class="form-actions">
            <button
              class="btn primary"
              @click="saveProfile"
            >Save Changes</button>
          </div>
        </div>

        <!-- Account Settings -->
        <div
          v-if="activeSection === 'account'"
          class="settings-section"
        >
          <h2>Account Settings</h2>

          <div class="form-group">
            <label for="current-password">Current Password</label>
            <input
              type="password"
              id="current-password"
              v-model="account.currentPassword"
            />
          </div>

          <div class="form-group">
            <label for="new-password">New Password</label>
            <input
              type="password"
              id="new-password"
              v-model="account.newPassword"
            />
          </div>

          <div class="form-group">
            <label for="confirm-password">Confirm New Password</label>
            <input
              type="password"
              id="confirm-password"
              v-model="account.confirmPassword"
            />
          </div>

          <div class="form-actions">
            <button
              class="btn primary"
              @click="changePassword"
            >Change Password</button>
          </div>
        </div>

        <!-- Appearance Settings -->
        <div
          v-if="activeSection === 'appearance'"
          class="settings-section"
        >
          <h2>Appearance Settings</h2>

          <div class="form-group">
            <label>Theme</label>
            <div class="theme-options">
              <div
                :class="['theme-option', { active: appearance.theme === 'light' }]"
                @click="appearance.theme = 'light'"
              >
                <div class="theme-preview light"></div>
                <span>Light</span>
              </div>

              <div
                :class="['theme-option', { active: appearance.theme === 'dark' }]"
                @click="appearance.theme = 'dark'"
              >
                <div class="theme-preview dark"></div>
                <span>Dark</span>
              </div>

              <div
                :class="['theme-option', { active: appearance.theme === 'system' }]"
                @click="appearance.theme = 'system'"
              >
                <div class="theme-preview system"></div>
                <span>System</span>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="density">Density</label>
            <select
              id="density"
              v-model="appearance.density"
            >
              <option value="comfortable">Comfortable</option>
              <option value="compact">Compact</option>
            </select>
          </div>

          <div class="form-actions">
            <button
              class="btn primary"
              @click="saveAppearance"
            >Save Changes</button>
          </div>
        </div>

        <!-- Notifications Settings -->
        <div
          v-if="activeSection === 'notifications'"
          class="settings-section"
        >
          <h2>Notification Settings</h2>

          <div class="form-group">
            <label>Email Notifications</label>
            <div class="checkbox-group">
              <div class="checkbox-item">
                <input
                  type="checkbox"
                  id="email-scrape"
                  v-model="notifications.emailScrapeComplete"
                />
                <label for="email-scrape">Scraping job completed</label>
              </div>

              <div class="checkbox-item">
                <input
                  type="checkbox"
                  id="email-preview"
                  v-model="notifications.emailPreviewGenerated"
                />
                <label for="email-preview">Website preview generated</label>
              </div>

              <div class="checkbox-item">
                <input
                  type="checkbox"
                  id="email-response"
                  v-model="notifications.emailClientResponse"
                />
                <label for="email-response">Client email response</label>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>In-App Notifications</label>
            <div class="checkbox-group">
              <div class="checkbox-item">
                <input
                  type="checkbox"
                  id="app-scrape"
                  v-model="notifications.appScrapeComplete"
                />
                <label for="app-scrape">Scraping job completed</label>
              </div>

              <div class="checkbox-item">
                <input
                  type="checkbox"
                  id="app-preview"
                  v-model="notifications.appPreviewGenerated"
                />
                <label for="app-preview">Website preview generated</label>
              </div>

              <div class="checkbox-item">
                <input
                  type="checkbox"
                  id="app-response"
                  v-model="notifications.appClientResponse"
                />
                <label for="app-response">Client email response</label>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button
              class="btn primary"
              @click="saveNotifications"
            >Save Changes</button>
          </div>
        </div>

        <!-- API Settings -->
        <div
          v-if="activeSection === 'api'"
          class="settings-section"
        >
          <h2>API Settings</h2>

          <div class="form-group">
            <label for="google-maps-key">Google Maps API Key</label>
            <div class="api-key-input">
              <input
                type="password"
                id="google-maps-key"
                v-model="api.googleMapsKey"
              />
              <button
                class="btn icon"
                @click="toggleApiKeyVisibility('googleMaps')"
              >
                <i :class="apiKeyVisible.googleMaps ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
          </div>

          <div class="form-group">
            <label for="openai-key">OpenAI API Key</label>
            <div class="api-key-input">
              <input
                type="password"
                id="openai-key"
                v-model="api.openaiKey"
              />
              <button
                class="btn icon"
                @click="toggleApiKeyVisibility('openai')"
              >
                <i :class="apiKeyVisible.openai ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
          </div>

          <div class="form-group">
            <label for="sendgrid-key">SendGrid API Key</label>
            <div class="api-key-input">
              <input
                type="password"
                id="sendgrid-key"
                v-model="api.sendgridKey"
              />
              <button
                class="btn icon"
                @click="toggleApiKeyVisibility('sendgrid')"
              >
                <i :class="apiKeyVisible.sendgrid ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
          </div>

          <div class="form-actions">
            <button
              class="btn primary"
              @click="saveApiSettings"
            >Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useToast } from "@/composables/useToast";

// Settings sections
const settingsSections = [
  { id: "profile", name: "Profile", icon: "fas fa-user" },
  { id: "account", name: "Account", icon: "fas fa-shield-alt" },
  { id: "appearance", name: "Appearance", icon: "fas fa-palette" },
  { id: "notifications", name: "Notifications", icon: "fas fa-bell" },
  { id: "api", name: "API Settings", icon: "fas fa-key" },
];

// Active section
const activeSection = ref("profile");

// Profile settings
const profile = ref({
  name: "Admin User",
  email: "admin@example.com",
  role: "Administrator",
});

// Account settings
const account = ref({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

// Appearance settings
const appearance = ref({
  theme: "light",
  density: "comfortable",
});

// Notification settings
const notifications = ref({
  emailScrapeComplete: true,
  emailPreviewGenerated: true,
  emailClientResponse: true,
  appScrapeComplete: true,
  appPreviewGenerated: true,
  appClientResponse: true,
});

// API settings
const api = ref({
  googleMapsKey: "AIzaSyA1234567890abcdefghijklmnopqrstuv",
  openaiKey: "sk-1234567890abcdefghijklmnopqrstuv",
  sendgridKey: "SG.1234567890abcdefghijklmnopqrstuv",
});

// API key visibility
const apiKeyVisible = ref({
  googleMaps: false,
  openai: false,
  sendgrid: false,
});

// Initialize toast
const toast = useToast();

// Methods
const saveProfile = () => {
  console.log("Saving profile:", profile.value);
  // In a real app, this would call an API to save the profile
  toast.success("Profile saved successfully!");
};

const changePassword = () => {
  if (account.value.newPassword !== account.value.confirmPassword) {
    toast.error("New passwords do not match!");
    return;
  }

  console.log("Changing password");
  // In a real app, this would call an API to change the password
  toast.success("Password changed successfully!");

  // Reset form
  account.value.currentPassword = "";
  account.value.newPassword = "";
  account.value.confirmPassword = "";
};

const saveAppearance = () => {
  console.log("Saving appearance:", appearance.value);
  // In a real app, this would call an API to save the appearance settings
  toast.success("Appearance settings saved successfully!");
};

const saveNotifications = () => {
  console.log("Saving notifications:", notifications.value);
  // In a real app, this would call an API to save the notification settings
  toast.success("Notification settings saved successfully!");
};

const saveApiSettings = () => {
  console.log("Saving API settings");
  // In a real app, this would call an API to save the API settings
  toast.success("API settings saved successfully!");
};

const toggleApiKeyVisibility = (key: "googleMaps" | "openai" | "sendgrid") => {
  apiKeyVisible.value[key] = !apiKeyVisible.value[key];
};
</script>

<style scoped>
.settings-page {
  width: 100%;
  padding: 20px;
}

.settings-header {
  margin-bottom: 24px;
}

.settings-header h1 {
  margin-bottom: 8px;
  font-size: 24px;
  font-weight: 600;
  color: #111827;
}

.subtitle {
  color: #6b7280;
  font-size: 16px;
}

.settings-container {
  display: flex;
  gap: 24px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.settings-sidebar {
  width: 250px;
  background-color: #f9fafb;
  border-right: 1px solid #e5e7eb;
  padding: 16px 0;
}

.settings-nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  color: #4b5563;
  transition: background-color 0.2s;
}

.settings-nav-item:hover {
  background-color: #f3f4f6;
}

.settings-nav-item.active {
  background-color: #e5e7eb;
  color: #111827;
  font-weight: 500;
}

.settings-nav-item i {
  width: 20px;
  text-align: center;
}

.settings-content {
  flex: 1;
  padding: 24px;
  min-width: 0;
}

.settings-section h2 {
  margin-top: 0;
  margin-bottom: 24px;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #374151;
}

.form-group input[type="text"],
.form-group input[type="email"],
.form-group input[type="password"],
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.form-group input[disabled] {
  background-color: #f3f4f6;
  cursor: not-allowed;
}

.form-actions {
  margin-top: 24px;
}

.btn {
  padding: 10px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: background-color 0.2s;
}

.btn.primary {
  background-color: #4338ca;
  color: white;
}

.btn.primary:hover {
  background-color: #3730a3;
}

.btn.icon {
  padding: 8px;
  background-color: transparent;
  color: #6b7280;
}

.btn.icon:hover {
  background-color: #f3f4f6;
}

.theme-options {
  display: flex;
  gap: 16px;
}

.theme-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.theme-preview {
  width: 80px;
  height: 60px;
  border-radius: 6px;
  border: 2px solid #e5e7eb;
  transition: border-color 0.2s;
}

.theme-option.active .theme-preview {
  border-color: #4338ca;
}

.theme-preview.light {
  background-color: #ffffff;
}

.theme-preview.dark {
  background-color: #1f2937;
}

.theme-preview.system {
  background: linear-gradient(to right, #ffffff 50%, #1f2937 50%);
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.api-key-input {
  display: flex;
  gap: 8px;
}

.api-key-input input {
  flex: 1;
}
</style>
