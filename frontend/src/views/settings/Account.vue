<template>
  <div class="account-settings">
    <div class="settings-header">
      <h1>Account Settings</h1>
      <p class="subtitle">Manage your account information and preferences</p>
    </div>

    <div class="settings-container">
      <div class="settings-sidebar">
        <div
          v-for="(section, index) in sections"
          :key="index"
          :class="['sidebar-item', { active: activeSection === index }]"
          @click="activeSection = index"
        >
          <i :class="section.icon"></i>
          <span>{{ section.title }}</span>
        </div>
      </div>

      <div class="settings-content">
        <!-- Profile Section -->
        <div
          v-if="activeSection === 0"
          class="settings-section"
        >
          <h2>Profile Information</h2>
          <p>Update your personal information and profile details</p>

          <form
            @submit.prevent="saveProfile"
            class="settings-form"
          >
            <div class="form-group">
              <label for="profile-name">Full Name</label>
              <input
                type="text"
                id="profile-name"
                v-model="profile.name"
                placeholder="Your full name"
              />
            </div>

            <div class="form-group">
              <label for="profile-email">Email Address</label>
              <input
                type="email"
                id="profile-email"
                v-model="profile.email"
                placeholder="Your email address"
                disabled
              />
              <span class="help-text">Email address cannot be changed</span>
            </div>

            <div class="form-group">
              <label for="profile-phone">Phone Number</label>
              <input
                type="tel"
                id="profile-phone"
                v-model="profile.phone"
                placeholder="Your phone number"
              />
            </div>

            <div class="form-group">
              <label for="profile-company">Company</label>
              <input
                type="text"
                id="profile-company"
                v-model="profile.company"
                placeholder="Your company name"
              />
            </div>

            <div class="form-group">
              <label for="profile-position">Position</label>
              <input
                type="text"
                id="profile-position"
                v-model="profile.position"
                placeholder="Your job title"
              />
            </div>

            <div class="form-actions">
              <button
                type="submit"
                class="btn primary"
              >
                <i class="fas fa-save"></i>
                Save Changes
              </button>
            </div>
          </form>
        </div>

        <!-- Password Section -->
        <div
          v-if="activeSection === 1"
          class="settings-section"
        >
          <h2>Change Password</h2>
          <p>Update your password to keep your account secure</p>

          <form
            @submit.prevent="changePassword"
            class="settings-form"
          >
            <div class="form-group">
              <label for="current-password">Current Password</label>
              <input
                type="password"
                id="current-password"
                v-model="passwordForm.currentPassword"
                placeholder="Enter your current password"
                required
              />
            </div>

            <div class="form-group">
              <label for="new-password">New Password</label>
              <input
                type="password"
                id="new-password"
                v-model="passwordForm.newPassword"
                placeholder="Enter your new password"
                required
              />
              <span class="help-text">Password must be at least 8 characters long</span>
            </div>

            <div class="form-group">
              <label for="confirm-password">Confirm New Password</label>
              <input
                type="password"
                id="confirm-password"
                v-model="passwordForm.confirmPassword"
                placeholder="Confirm your new password"
                required
              />
            </div>

            <div class="form-actions">
              <button
                type="submit"
                class="btn primary"
              >
                <i class="fas fa-key"></i>
                Update Password
              </button>
            </div>
          </form>
        </div>

        <!-- Notifications Section -->
        <div
          v-if="activeSection === 2"
          class="settings-section"
        >
          <h2>Notification Preferences</h2>
          <p>Manage how and when you receive notifications</p>

          <div class="settings-form">
            <div class="notification-group">
              <h3>Email Notifications</h3>

              <div class="notification-item">
                <div class="notification-info">
                  <h4>Scrape Completion</h4>
                  <p>Receive an email when a scraping job is completed</p>
                </div>
                <label class="toggle-switch">
                  <input
                    type="checkbox"
                    v-model="notifications.scrapeCompletion"
                  />
                  <span class="toggle-slider"></span>
                </label>
              </div>

              <div class="notification-item">
                <div class="notification-info">
                  <h4>Preview Site Updates</h4>
                  <p>Receive an email when a preview site is updated</p>
                </div>
                <label class="toggle-switch">
                  <input
                    type="checkbox"
                    v-model="notifications.previewUpdates"
                  />
                  <span class="toggle-slider"></span>
                </label>
              </div>

              <div class="notification-item">
                <div class="notification-info">
                  <h4>Client Feedback</h4>
                  <p>Receive an email when a client provides feedback</p>
                </div>
                <label class="toggle-switch">
                  <input
                    type="checkbox"
                    v-model="notifications.clientFeedback"
                  />
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div class="notification-group">
              <h3>System Notifications</h3>

              <div class="notification-item">
                <div class="notification-info">
                  <h4>Account Updates</h4>
                  <p>Receive notifications about account changes</p>
                </div>
                <label class="toggle-switch">
                  <input
                    type="checkbox"
                    v-model="notifications.accountUpdates"
                  />
                  <span class="toggle-slider"></span>
                </label>
              </div>

              <div class="notification-item">
                <div class="notification-info">
                  <h4>Billing Alerts</h4>
                  <p>Receive notifications about billing and payments</p>
                </div>
                <label class="toggle-switch">
                  <input
                    type="checkbox"
                    v-model="notifications.billingAlerts"
                  />
                  <span class="toggle-slider"></span>
                </label>
              </div>

              <div class="notification-item">
                <div class="notification-info">
                  <h4>New Features</h4>
                  <p>Receive notifications about new features and updates</p>
                </div>
                <label class="toggle-switch">
                  <input
                    type="checkbox"
                    v-model="notifications.newFeatures"
                  />
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div class="form-actions">
              <button
                type="button"
                class="btn primary"
                @click="saveNotifications"
              >
                <i class="fas fa-save"></i>
                Save Preferences
              </button>
            </div>
          </div>
        </div>

        <!-- API Keys Section -->
        <div
          v-if="activeSection === 3"
          class="settings-section"
        >
          <h2>API Keys</h2>
          <p>Manage your API keys for programmatic access to your data</p>

          <div class="settings-form">
            <div class="api-keys-header">
              <h3>Your API Keys</h3>
              <button
                type="button"
                class="btn secondary"
                @click="generateApiKey"
              >
                <i class="fas fa-plus"></i>
                Generate New Key
              </button>
            </div>

            <div class="api-keys-list">
              <div
                v-if="apiKeys.length === 0"
                class="no-keys"
              >
                <p>You don't have any API keys yet. Generate one to get started.</p>
              </div>

              <div
                v-for="(key, index) in apiKeys"
                :key="index"
                class="api-key-item"
              >
                <div class="api-key-info">
                  <div class="api-key-name">{{ key.name }}</div>
                  <div class="api-key-value">{{ maskApiKey(key.value) }}</div>
                  <div class="api-key-created">Created: {{ formatDate(key.created) }}</div>
                </div>
                <div class="api-key-actions">
                  <button
                    type="button"
                    class="action-btn"
                    @click="copyApiKey(key.value)"
                    title="Copy API Key"
                  >
                    <i class="fas fa-copy"></i>
                  </button>
                  <button
                    type="button"
                    class="action-btn delete"
                    @click="deleteApiKey(index)"
                    title="Delete API Key"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>

            <div class="api-keys-info">
              <h4>Using API Keys</h4>
              <p>Include your API key in the <code>X-API-Key</code> header when making requests to our API.</p>
              <p>Example:</p>
              <pre><code>curl -H "X-API-Key: your_api_key" https://api.scrapepro.com/v1/scrapes</code></pre>
              <p class="warning">
                <i class="fas fa-exclamation-triangle"></i>
                Never share your API keys. They provide full access to your account.
              </p>
            </div>
          </div>
        </div>

        <!-- Delete Account Section -->
        <div
          v-if="activeSection === 4"
          class="settings-section"
        >
          <h2>Delete Account</h2>
          <p>Permanently delete your account and all associated data</p>

          <div class="settings-form">
            <div class="danger-zone">
              <h3>Danger Zone</h3>
              <p>Once you delete your account, there is no going back. Please be certain.</p>

              <div class="form-group">
                <label for="delete-confirmation">Type "DELETE" to confirm</label>
                <input
                  type="text"
                  id="delete-confirmation"
                  v-model="deleteConfirmation"
                  placeholder="Type DELETE to confirm"
                />
              </div>

              <button
                type="button"
                class="btn danger"
                @click="deleteAccount"
                :disabled="deleteConfirmation !== 'DELETE'"
              >
                <i class="fas fa-trash-alt"></i>
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "@/composables/useToast";

const authStore = useAuthStore();

// Sidebar sections
const sections = [
  { title: "Profile", icon: "fas fa-user" },
  { title: "Password", icon: "fas fa-lock" },
  { title: "Notifications", icon: "fas fa-bell" },
  { title: "API Keys", icon: "fas fa-key" },
  { title: "Delete Account", icon: "fas fa-trash-alt" },
];

// Active section
const activeSection = ref(0);

// Profile form
const profile = reactive({
  name: authStore.user?.name || "",
  email: authStore.user?.email || "",
  phone: authStore.user?.phone || "",
  company: authStore.user?.company || "",
  position: authStore.user?.position || "",
});

// Password form
const passwordForm = reactive({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

// Notification preferences
const notifications = reactive({
  scrapeCompletion: true,
  previewUpdates: true,
  clientFeedback: true,
  accountUpdates: true,
  billingAlerts: true,
  newFeatures: false,
});

// API Keys
const apiKeys = ref([
  {
    name: "Default Key",
    value: "sk_live_51JKj7nKG8JfJ2pX9qZ3vY5tW8mN6bD2cR4sL1pV7",
    created: new Date("2023-01-15T10:30:00Z"),
  },
]);

// Delete account confirmation
const deleteConfirmation = ref("");

// Methods
const saveProfile = async () => {
  try {
    // In a real app, this would call an API to update the profile
    // await authStore.updateProfile(profile);

    // For now, just show a success message
    alert("Profile updated successfully!");
  } catch (error) {
    console.error("Failed to update profile:", error);
    alert("Failed to update profile. Please try again.");
  }
};

const changePassword = async () => {
  const toast = useToast();
  try {
    // Validate passwords
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long!");
      return;
    }

    // In a real app, this would call an API to change the password
    // await authStore.updatePassword(passwordForm);

    // Reset form
    passwordForm.currentPassword = "";
    passwordForm.newPassword = "";
    passwordForm.confirmPassword = "";

    // Show success message
    toast.success("Password updated successfully!");
  } catch (error) {
    console.error("Failed to update password:", error);
    toast.error("Failed to update password. Please try again.");
  }
};

const saveNotifications = () => {
  // In a real app, this would call an API to update notification preferences
  const toast = useToast();
  toast.success("Notification preferences saved!");
};

const generateApiKey = () => {
  // In a real app, this would call an API to generate a new API key
  const toast = useToast();
  const newKey = {
    name: `API Key ${apiKeys.value.length + 1}`,
    value: `sk_live_${Math.random()
      .toString(36)
      .substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
    created: new Date(),
  };

  apiKeys.value.push(newKey);
  toast.success("New API key generated!");
};

const copyApiKey = (key: string) => {
  const toast = useToast();
  navigator.clipboard
    .writeText(key)
    .then(() => {
      toast.success("API key copied to clipboard!");
    })
    .catch((err) => {
      console.error("Failed to copy API key:", err);
      toast.error("Failed to copy API key. Please try again.");
    });
};

const deleteApiKey = (index: number) => {
  const toast = useToast();
  if (
    confirm(
      "Are you sure you want to delete this API key? This action cannot be undone."
    )
  ) {
    apiKeys.value.splice(index, 1);
    toast.success("API key deleted!");
  }
};

const maskApiKey = (key: string) => {
  return `${key.substring(0, 8)}...${key.substring(key.length - 4)}`;
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const deleteAccount = () => {
  const toast = useToast();
  if (deleteConfirmation.value !== "DELETE") {
    return;
  }

  if (
    confirm(
      "Are you absolutely sure you want to delete your account? This action CANNOT be undone."
    )
  ) {
    // In a real app, this would call an API to delete the account
    // await authStore.deleteAccount();

    // For now, just show a success message and redirect to login
    toast.success("Account deleted successfully!");
    authStore.logout();
    window.location.href = "/auth/login";
  }
};
</script>

<style scoped>
.account-settings {
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
}

.settings-sidebar {
  width: 250px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.sidebar-item {
  display: flex;
  align-items: center;
  padding: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.sidebar-item:hover {
  background-color: #f3f4f6;
}

.sidebar-item.active {
  background-color: #f3f4f6;
  border-left: 3px solid #4f46e5;
}

.sidebar-item i {
  width: 20px;
  margin-right: 12px;
  color: #6b7280;
}

.sidebar-item.active i {
  color: #4f46e5;
}

.settings-content {
  flex: 1;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 24px;
}

.settings-section h2 {
  margin-top: 0;
  margin-bottom: 8px;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.settings-section > p {
  margin-top: 0;
  margin-bottom: 24px;
  color: #6b7280;
}

.settings-form {
  max-width: 600px;
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

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.form-group input:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
}

.help-text {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #6b7280;
}

.form-actions {
  margin-top: 24px;
}

.btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: background-color 0.2s;
}

.btn.primary {
  background-color: #4f46e5;
  color: white;
}

.btn.primary:hover {
  background-color: #4338ca;
}

.btn.secondary {
  background-color: #e5e7eb;
  color: #374151;
}

.btn.secondary:hover {
  background-color: #d1d5db;
}

.btn.danger {
  background-color: #ef4444;
  color: white;
}

.btn.danger:hover:not(:disabled) {
  background-color: #dc2626;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Notification styles */
.notification-group {
  margin-bottom: 24px;
}

.notification-group h3 {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 8px;
}

.notification-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.notification-info h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 500;
  color: #111827;
}

.notification-info p {
  margin: 0;
  font-size: 12px;
  color: #6b7280;
}

/* Toggle switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #e5e7eb;
  transition: 0.4s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: #4f46e5;
}

input:checked + .toggle-slider:before {
  transform: translateX(24px);
}

/* API Keys styles */
.api-keys-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.api-keys-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.api-keys-list {
  margin-bottom: 24px;
}

.no-keys {
  padding: 16px;
  background-color: #f9fafb;
  border-radius: 6px;
  text-align: center;
  color: #6b7280;
}

.api-key-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  margin-bottom: 12px;
}

.api-key-name {
  font-weight: 500;
  color: #111827;
  margin-bottom: 4px;
}

.api-key-value {
  font-family: monospace;
  background-color: #f3f4f6;
  padding: 4px 8px;
  border-radius: 4px;
  margin-bottom: 4px;
}

.api-key-created {
  font-size: 12px;
  color: #6b7280;
}

.api-key-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  background-color: #e5e7eb;
  color: #374151;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.action-btn:hover {
  background-color: #d1d5db;
}

.action-btn.delete {
  color: #ef4444;
}

.action-btn.delete:hover {
  background-color: #fee2e2;
}

.api-keys-info {
  background-color: #f9fafb;
  border-radius: 6px;
  padding: 16px;
}

.api-keys-info h4 {
  margin-top: 0;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #111827;
}

.api-keys-info p {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #4b5563;
}

.api-keys-info code {
  font-family: monospace;
  background-color: #e5e7eb;
  padding: 2px 4px;
  border-radius: 4px;
}

.api-keys-info pre {
  background-color: #1f2937;
  color: #f9fafb;
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 8px 0;
}

.warning {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #b91c1c;
  margin-top: 16px;
}

/* Danger zone */
.danger-zone {
  border: 1px solid #ef4444;
  border-radius: 6px;
  padding: 16px;
}

.danger-zone h3 {
  margin-top: 0;
  margin-bottom: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #ef4444;
}

.danger-zone p {
  margin-top: 0;
  margin-bottom: 16px;
  color: #4b5563;
}

/* Responsive */
@media (max-width: 768px) {
  .settings-container {
    flex-direction: column;
  }

  .settings-sidebar {
    width: 100%;
  }
}
</style>