<template>
  <div class="reset-password-container">
    <div class="reset-password-card">
      <h1 class="reset-password-title">Reset Password</h1>

      <div
        v-if="error"
        class="error-message"
      >
        {{ error }}
      </div>

      <div
        v-if="success"
        class="success-message"
      >
        {{ success }}
        <div class="redirect-message">
          Redirecting to login page in {{ countdown }} seconds...
        </div>
      </div>

      <form
        @submit.prevent="handleSubmit"
        class="reset-password-form"
        v-if="!success"
      >
        <div class="form-group">
          <label for="password">New Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Enter your new password"
            required
            minlength="6"
          />
          <small class="password-hint">Password must be at least 6 characters</small>
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            placeholder="Confirm your new password"
            required
          />
        </div>

        <div class="form-actions">
          <button
            type="submit"
            class="reset-password-button"
            :disabled="loading || password !== confirmPassword"
          >
            {{ loading ? 'Resetting...' : 'Reset Password' }}
          </button>
        </div>
      </form>

      <div
        class="reset-password-footer"
        v-if="!success"
      >
        <p>Remember your password? <router-link to="/auth/login">Login</router-link></p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";

const route = useRoute();
const router = useRouter();

const password = ref("");
const confirmPassword = ref("");
const error = ref("");
const success = ref("");
const loading = ref(false);
const countdown = ref(5);
let countdownTimer: number | null = null;

const resetToken = computed(() => route.params.token as string);

const validateToken = async () => {
  try {
    await axios.get(`/api/auth/resetpassword/${resetToken.value}`);
  } catch (err: any) {
    error.value = "Invalid or expired password reset token";
  }
};

const handleSubmit = async () => {
  if (loading.value) return;

  if (password.value !== confirmPassword.value) {
    error.value = "Passwords do not match";
    return;
  }

  loading.value = true;
  error.value = "";

  try {
    const response = await axios.put(
      `/api/auth/resetpassword/${resetToken.value}`,
      {
        password: password.value,
      }
    );

    if (response.data.success) {
      success.value = "Your password has been reset successfully.";
      password.value = "";
      confirmPassword.value = "";

      // Start countdown to redirect
      countdownTimer = window.setInterval(() => {
        countdown.value--;
        if (countdown.value <= 0) {
          clearInterval(countdownTimer!);
          router.push("/auth/login");
        }
      }, 1000);
    } else {
      throw new Error(response.data.message || "Failed to reset password");
    }
  } catch (err: any) {
    error.value =
      err.response?.data?.message || err.message || "Failed to reset password";
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  validateToken();
});

onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
  }
});
</script>

<style scoped>
.reset-password-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 70px);
  padding: 2rem;
  background-color: #f5f7fa;
}

.reset-password-card {
  width: 100%;
  max-width: 450px;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.reset-password-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1.5rem;
  text-align: center;
}

.error-message {
  background-color: #fee2e2;
  color: #b91c1c;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
}

.success-message {
  background-color: #dcfce7;
  color: #166534;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
}

.redirect-message {
  margin-top: 0.5rem;
  font-style: italic;
}

.reset-password-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.form-group input {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #4c6ef5;
  box-shadow: 0 0 0 2px rgba(76, 110, 245, 0.1);
}

.password-hint {
  color: #6b7280;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.form-actions {
  margin-top: 0.75rem;
}

.reset-password-button {
  width: 100%;
  padding: 0.75rem;
  background-color: #4c6ef5;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.reset-password-button:hover {
  background-color: #3a56d4;
}

.reset-password-button:disabled {
  background-color: #a5b4fc;
  cursor: not-allowed;
}

.reset-password-footer {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.875rem;
  color: #6b7280;
}

.reset-password-footer a {
  color: #4c6ef5;
  text-decoration: none;
  font-weight: 500;
}

.reset-password-footer a:hover {
  text-decoration: underline;
}
</style> 