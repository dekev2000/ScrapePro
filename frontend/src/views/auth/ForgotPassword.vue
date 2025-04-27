<template>
  <div class="forgot-password-container">
    <div class="forgot-password-card">
      <h1 class="forgot-password-title">Forgot Password</h1>

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
      </div>

      <form
        @submit.prevent="handleSubmit"
        class="forgot-password-form"
        v-if="!success"
      >
        <div class="form-group">
          <label for="email">Email Address</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="Enter your email address"
            required
          />
        </div>

        <div class="form-actions">
          <button
            type="submit"
            class="forgot-password-button"
            :disabled="loading"
          >
            {{ loading ? 'Sending...' : 'Reset Password' }}
          </button>
        </div>
      </form>

      <div class="forgot-password-footer">
        <p>Remember your password? <router-link to="/auth/login">Login</router-link></p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import axios from "axios";

const email = ref("");
const error = ref("");
const success = ref("");
const loading = ref(false);

const handleSubmit = async () => {
  if (loading.value) return;

  loading.value = true;
  error.value = "";
  success.value = "";

  try {
    const response = await axios.post("/api/auth/forgotpassword", {
      email: email.value,
    });

    if (response.data.success) {
      success.value =
        "An email has been sent with instructions to reset your password.";
      email.value = "";
    } else {
      throw new Error(response.data.message || "Failed to process request");
    }
  } catch (err: any) {
    error.value =
      err.response?.data?.message ||
      err.message ||
      "Failed to send reset email";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.forgot-password-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 70px);
  padding: 2rem;
  background-color: #f5f7fa;
}

.forgot-password-card {
  width: 100%;
  max-width: 450px;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.forgot-password-title {
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

.forgot-password-form {
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

.form-actions {
  margin-top: 0.75rem;
}

.forgot-password-button {
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

.forgot-password-button:hover {
  background-color: #3a56d4;
}

.forgot-password-button:disabled {
  background-color: #a5b4fc;
  cursor: not-allowed;
}

.forgot-password-footer {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.875rem;
  color: #6b7280;
}

.forgot-password-footer a {
  color: #4c6ef5;
  text-decoration: none;
  font-weight: 500;
}

.forgot-password-footer a:hover {
  text-decoration: underline;
}
</style> 