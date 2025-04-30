<template>
  <div class="login-container">
    <div class="login-card">
      <h1 class="login-title">Login</h1>

      <div
        v-if="error"
        class="error-message"
      >
        {{ error }}
      </div>

      <form
        @submit.prevent="handleLogin"
        class="login-form"
      >
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="Enter your email"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Enter your password"
            required
          />
        </div>

        <div class="form-actions">
          <button
            type="submit"
            class="login-button"
            :disabled="loading"
          >
            {{ loading ? 'Logging in...' : 'Login' }}
          </button>
        </div>
      </form>

      <div class="login-footer">
        <p>Don't have an account? <router-link to="/auth/register">Register</router-link></p>
        <p><router-link to="/auth/forgot-password">Forgot password?</router-link></p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/auth";

const router = useRouter();
const authStore = useAuthStore();

const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);

const handleLogin = async () => {
  if (loading.value) return;

  loading.value = true;
  error.value = "";

  try {
    await authStore.login({
      email: email.value,
      password: password.value,
    });

    // Redirect to dashboard on successful login
    router.push("/dashboard");
  } catch (err: any) {
    error.value = err.toString();
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 70px);
  padding: 2rem;
  background-color: #f5f7fa;
}

.login-card {
  width: 100%;
  max-width: 450px;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.login-title {
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

.login-form {
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

.login-button {
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

.login-button:hover {
  background-color: #3a56d4;
}

.login-button:disabled {
  background-color: #a5b4fc;
  cursor: not-allowed;
}

.login-footer {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.875rem;
  color: #6b7280;
}

.login-footer a {
  color: #4c6ef5;
  text-decoration: none;
  font-weight: 500;
}

.login-footer a:hover {
  text-decoration: underline;
}

.login-footer p {
  margin: 0.5rem 0;
}
</style>