<template>
  <div class="test-container">
    <h1>API Connection Test</h1>

    <div class="status-box">
      <div class="status-item">
        <span class="label">Backend Status:</span>
        <span
          class="value"
          :class="backendStatus.ok ? 'success' : 'error'"
        >
          {{ backendStatus.message }}
        </span>
      </div>
    </div>

    <div class="controls">
      <button
        @click="testConnection"
        :disabled="loading"
      >
        {{ loading ? 'Testing...' : 'Test Connection' }}
      </button>
    </div>

    <div
      v-if="log.length"
      class="log-box"
    >
      <h3>Test Log:</h3>
      <pre><code>{{ log.join('\n') }}</code></pre>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const loading = ref(false);
const backendStatus = ref({ ok: false, message: "Not tested" });
const log = ref([]);

const addLog = (message) => {
  log.value.push(`[${new Date().toLocaleTimeString()}] ${message}`);
};

const testConnection = async () => {
  loading.value = true;
  log.value = [];
  backendStatus.value = { ok: false, message: "Testing..." };

  try {
    addLog(
      "Testing backend connection to: http://localhost:3000/api/auth/register"
    );

    // First try a fetch for basic connectivity
    try {
      const fetchResponse = await fetch(
        "http://localhost:3000/api/auth/register",
        {
          method: "OPTIONS",
        }
      );
      addLog(`Fetch response status: ${fetchResponse.status}`);
    } catch (error) {
      addLog(`Fetch test failed: ${error.message}`);
    }

    // Then try Axios for complete test
    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/register",
        {
          name: `Test User ${Date.now()}`,
          email: `test-${Date.now()}@example.com`,
          password: "password123",
        }
      );

      addLog(`Axios test succeeded! Status: ${response.status}`);
      addLog(`Response data: ${JSON.stringify(response.data, null, 2)}`);

      backendStatus.value = {
        ok: true,
        message: "Connected! Backend is running and accepting requests.",
      };
    } catch (error) {
      addLog(`Axios test failed: ${error.message}`);

      if (error.response) {
        // The server responded with a status code outside the 2xx range
        addLog(`Status code: ${error.response.status}`);
        addLog(
          `Response data: ${JSON.stringify(error.response.data, null, 2)}`
        );
      } else if (error.request) {
        // The request was made but no response was received
        addLog("No response received from server");
      }

      backendStatus.value = {
        ok: false,
        message: `Connection failed: ${error.message}`,
      };
    }
  } catch (e) {
    addLog(`Test failed with error: ${e.message}`);
    backendStatus.value = {
      ok: false,
      message: `Test failed: ${e.message}`,
    };
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  testConnection();
});
</script>

<style scoped>
.test-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 1.5rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h1 {
  color: #333;
  margin-bottom: 1.5rem;
}

.status-box {
  background-color: white;
  padding: 1rem;
  border-radius: 4px;
  border: 1px solid #dee2e6;
  margin-bottom: 1.5rem;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.label {
  font-weight: 500;
  min-width: 150px;
}

.value {
  font-weight: 600;
}

.success {
  color: #28a745;
}

.error {
  color: #dc3545;
}

.controls {
  margin-bottom: 1.5rem;
}

button {
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

button:hover {
  background-color: #0069d9;
}

button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.log-box {
  background-color: #272822;
  color: #f8f8f2;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
}

pre {
  margin: 0;
  font-family: monospace;
  white-space: pre-wrap;
}
</style> 