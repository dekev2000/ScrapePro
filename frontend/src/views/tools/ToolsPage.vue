<template>
  <div class="tools-page">
    <div class="tools-header">
      <h1>Tools</h1>
      <p class="subtitle">Useful tools to help you manage your business</p>
    </div>

    <div class="tools-grid">
      <div class="tool-card" @click="navigateTo('/dashboard/tools/email-builder')">
        <div class="tool-icon">
          <i class="fas fa-envelope"></i>
        </div>
        <div class="tool-info">
          <h3>Email Builder</h3>
          <p>Create and customize email templates for your outreach campaigns</p>
        </div>
      </div>

      <div class="tool-card" @click="navigateTo('/dashboard/tools/website-builder')">
        <div class="tool-icon">
          <i class="fas fa-desktop"></i>
        </div>
        <div class="tool-info">
          <h3>Website Builder</h3>
          <p>Create and customize website templates for your clients</p>
        </div>
      </div>

      <div class="tool-card" @click="navigateTo('/dashboard/tools/data-import')">
        <div class="tool-icon">
          <i class="fas fa-file-import"></i>
        </div>
        <div class="tool-info">
          <h3>Data Import</h3>
          <p>Import client data from CSV, Excel, or other sources</p>
        </div>
      </div>

      <div class="tool-card" @click="navigateTo('/dashboard/tools/data-export')">
        <div class="tool-icon">
          <i class="fas fa-file-export"></i>
        </div>
        <div class="tool-info">
          <h3>Data Export</h3>
          <p>Export your client data and reports to various formats</p>
        </div>
      </div>

      <div class="tool-card" @click="navigateTo('/dashboard/tools/api-keys')">
        <div class="tool-icon">
          <i class="fas fa-key"></i>
        </div>
        <div class="tool-info">
          <h3>API Keys</h3>
          <p>Manage your API keys for third-party integrations</p>
        </div>
      </div>

      <div class="tool-card" @click="navigateTo('/dashboard/tools/bulk-actions')">
        <div class="tool-icon">
          <i class="fas fa-tasks"></i>
        </div>
        <div class="tool-info">
          <h3>Bulk Actions</h3>
          <p>Perform actions on multiple clients at once</p>
        </div>
      </div>
    </div>

    <!-- Placeholder for tool content -->
    <div v-if="selectedTool" class="tool-content">
      <h2>{{ selectedTool }}</h2>
      <p>This tool is coming soon!</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const selectedTool = ref('');

const navigateTo = (path: string) => {
  selectedTool.value = path.split('/').pop() || '';
  console.log(`Navigating to ${path}`);
  // In a real app, this would navigate to the tool page
  // router.push(path);
};
</script>

<style scoped>
.tools-page {
  width: 100%;
  padding: 20px;
}

.tools-header {
  margin-bottom: 24px;
}

.tools-header h1 {
  margin-bottom: 8px;
  font-size: 24px;
  font-weight: 600;
  color: #111827;
}

.subtitle {
  color: #6b7280;
  font-size: 16px;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.tool-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.tool-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.tool-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background-color: #4338ca;
  color: white;
  border-radius: 8px;
  font-size: 20px;
}

.tool-info {
  flex: 1;
}

.tool-info h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.tool-info p {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

.tool-content {
  margin-top: 40px;
  padding: 24px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.tool-content h2 {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}
</style>
