<template>
  <div class="email-template-manager">
    <div class="page-header">
      <h1>Email Templates</h1>
      <div class="header-actions">
        <button class="btn primary" @click="showCreateModal = true">
          <i class="fas fa-plus"></i> New Template
        </button>
      </div>
    </div>

    <div class="template-filters">
      <div class="search-box">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search templates..."
          @input="filterTemplates"
        />
        <i class="fas fa-search"></i>
      </div>

      <div class="filter-group">
        <label for="category-filter">Category:</label>
        <select id="category-filter" v-model="categoryFilter" @change="filterTemplates">
          <option value="">All Categories</option>
          <option v-for="category in categories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Loading templates...</p>
    </div>

    <div v-else-if="error" class="error-message">
      <i class="fas fa-exclamation-triangle"></i>
      <p>{{ error }}</p>
      <button class="btn secondary" @click="fetchTemplates">Retry</button>
    </div>

    <div v-else-if="filteredTemplates.length === 0" class="empty-state">
      <i class="fas fa-envelope"></i>
      <p v-if="hasFilters">No templates match your search criteria.</p>
      <p v-else>No email templates found. Create your first template to get started.</p>
      <button class="btn primary" @click="showCreateModal = true">
        <i class="fas fa-plus"></i> Create Template
      </button>
    </div>

    <div v-else class="templates-grid">
      <div
        v-for="template in filteredTemplates"
        :key="template._id"
        class="template-card"
        :class="{ 'selected': selectedTemplate?._id === template._id }"
        @click="selectTemplate(template)"
      >
        <div class="template-header">
          <h3 class="template-name">{{ template.name }}</h3>
          <span class="template-category">{{ template.category }}</span>
        </div>
        <div class="template-subject">{{ template.subject }}</div>
        <div class="template-preview" v-html="truncateHtml(template.body)"></div>
        <div class="template-footer">
          <div class="template-stats">
            <span class="stat" title="Sent Count">
              <i class="fas fa-paper-plane"></i> {{ template.usage?.sentCount || 0 }}
            </span>
            <span class="stat" title="Open Rate">
              <i class="fas fa-envelope-open"></i> {{ formatPercentage(template.usage?.openRate) }}
            </span>
            <span class="stat" title="Response Rate">
              <i class="fas fa-reply"></i> {{ formatPercentage(template.usage?.responseRate) }}
            </span>
          </div>
          <div class="template-actions">
            <button class="btn-icon edit-btn" @click.stop="editTemplate(template)" title="Edit">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn-icon delete-btn" @click.stop="confirmDeleteTemplate(template)" title="Delete">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Template Preview Panel -->
    <div v-if="selectedTemplate" class="template-preview-panel">
      <div class="preview-header">
        <h2>{{ selectedTemplate.name }}</h2>
        <button class="close-btn" @click="selectedTemplate = null">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="preview-content">
        <div class="preview-section">
          <h3>Subject</h3>
          <div class="preview-subject">{{ selectedTemplate.subject }}</div>
        </div>
        <div class="preview-section">
          <h3>Body</h3>
          <div class="preview-body" v-html="selectedTemplate.body"></div>
        </div>
        <div class="preview-section">
          <h3>Available Variables</h3>
          <div class="variables-list">
            <span v-for="variable in shortcodes" :key="variable.code" class="variable-tag">
              {{ variable.code }}
            </span>
          </div>
        </div>
      </div>
      <div class="preview-actions">
        <button class="btn secondary" @click="editTemplate(selectedTemplate)">
          <i class="fas fa-edit"></i> Edit
        </button>
        <button class="btn primary" @click="useTemplate(selectedTemplate)">
          <i class="fas fa-paper-plane"></i> Use Template
        </button>
      </div>
    </div>

    <!-- Create/Edit Template Modal -->
    <div v-if="showCreateModal || showEditModal" class="modal-overlay" @click.self="closeModals">
      <div class="modal-container">
        <div class="modal-header">
          <h3>{{ showEditModal ? 'Edit Template' : 'Create New Template' }}</h3>
          <button class="close-btn" @click="closeModals">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="template-name">Template Name</label>
            <input
              type="text"
              id="template-name"
              v-model="templateForm.name"
              placeholder="Enter template name"
              required
            />
          </div>
          <div class="form-group">
            <label for="template-category">Category</label>
            <select id="template-category" v-model="templateForm.category" required>
              <option value="">Select a category</option>
              <option value="introduction">Introduction</option>
              <option value="follow_up">Follow-up</option>
              <option value="proposal">Proposal</option>
              <option value="notification">Notification</option>
              <option value="marketing">Marketing</option>
              <option value="reporting">Reporting</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div class="form-group">
            <label for="template-subject">Subject</label>
            <input
              type="text"
              id="template-subject"
              v-model="templateForm.subject"
              placeholder="Enter email subject"
              required
            />
          </div>
          <div class="form-group">
            <label for="template-body">Email Body</label>
            <EmailEditor v-model="templateForm.body" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn secondary" @click="closeModals">Cancel</button>
          <button
            class="btn primary"
            @click="saveTemplate"
            :disabled="isSaving || !isFormValid"
          >
            <i :class="isSaving ? 'fas fa-spinner fa-spin' : 'fas fa-save'"></i>
            {{ isSaving ? 'Saving...' : 'Save Template' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal-container delete-modal">
        <div class="modal-header">
          <h3>Confirm Deletion</h3>
          <button class="close-btn" @click="showDeleteModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to delete the template <strong>{{ templateToDelete?.name }}</strong>?</p>
          <p class="warning-text">This action cannot be undone.</p>
        </div>
        <div class="modal-footer">
          <button class="btn secondary" @click="showDeleteModal = false">Cancel</button>
          <button
            class="btn danger"
            @click="deleteTemplate"
            :disabled="isDeleting"
          >
            <i :class="isDeleting ? 'fas fa-spinner fa-spin' : 'fas fa-trash'"></i>
            {{ isDeleting ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useEmailStore } from '@/stores/email';
import { useToast } from '@/composables/useToast';
import EmailEditor from '@/components/emails/EmailEditor.vue';

// Initialize router, store and toast
const router = useRouter();
const emailStore = useEmailStore();
const toast = useToast();

// State
const loading = ref(false);
const error = ref<string | null>(null);
const searchQuery = ref('');
const categoryFilter = ref('');
const selectedTemplate = ref<any>(null);
const showCreateModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const isSaving = ref(false);
const isDeleting = ref(false);
const templateToDelete = ref<any>(null);

// Template form
const templateForm = reactive({
  _id: '',
  name: '',
  category: '',
  subject: '',
  body: '',
});

// Available shortcodes
const shortcodes = [
  { code: '{business_name}', label: 'Business Name', description: 'Insert the business name' },
  { code: '{contact_name}', label: 'Contact Name', description: 'Insert the contact name' },
  { code: '{website_url}', label: 'Website URL', description: 'Insert the website URL' },
  { code: '{current_date}', label: 'Current Date', description: 'Insert the current date' },
  { code: '{sender_name}', label: 'Sender Name', description: 'Insert your name' },
  { code: '{company_name}', label: 'Company Name', description: 'Insert your company name' },
];

// Computed properties
const filteredTemplates = computed(() => {
  let result = [...emailStore.templates];
  
  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(template => 
      template.name.toLowerCase().includes(query) ||
      template.subject.toLowerCase().includes(query) ||
      template.category.toLowerCase().includes(query)
    );
  }
  
  // Apply category filter
  if (categoryFilter.value) {
    result = result.filter(template => template.category === categoryFilter.value);
  }
  
  return result;
});

const categories = computed(() => {
  const categorySet = new Set(emailStore.templates.map(template => template.category));
  return Array.from(categorySet);
});

const hasFilters = computed(() => {
  return searchQuery.value !== '' || categoryFilter.value !== '';
});

const isFormValid = computed(() => {
  return (
    templateForm.name.trim() !== '' &&
    templateForm.category.trim() !== '' &&
    templateForm.subject.trim() !== '' &&
    templateForm.body.trim() !== ''
  );
});

// Methods
const fetchTemplates = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    await emailStore.fetchTemplates();
  } catch (err: any) {
    error.value = err.message || 'Failed to load templates';
    toast.error(error.value);
  } finally {
    loading.value = false;
  }
};

const filterTemplates = () => {
  // This function is called when filters change
  // The actual filtering is done by the computed property
};

const selectTemplate = (template: any) => {
  selectedTemplate.value = template;
};

const editTemplate = (template: any) => {
  // Clone the template to avoid direct mutation
  templateForm._id = template._id;
  templateForm.name = template.name;
  templateForm.category = template.category;
  templateForm.subject = template.subject;
  templateForm.body = template.body;
  
  showEditModal.value = true;
  selectedTemplate.value = null;
};

const confirmDeleteTemplate = (template: any) => {
  templateToDelete.value = template;
  showDeleteModal.value = true;
};

const deleteTemplate = async () => {
  if (!templateToDelete.value) return;
  
  isDeleting.value = true;
  
  try {
    await emailStore.deleteTemplate(templateToDelete.value._id);
    toast.success('Template deleted successfully');
    showDeleteModal.value = false;
    templateToDelete.value = null;
    
    // If the deleted template was selected, clear the selection
    if (selectedTemplate.value && selectedTemplate.value._id === templateToDelete.value._id) {
      selectedTemplate.value = null;
    }
  } catch (err: any) {
    toast.error(err.message || 'Failed to delete template');
  } finally {
    isDeleting.value = false;
  }
};

const saveTemplate = async () => {
  if (!isFormValid.value) {
    toast.error('Please fill in all required fields');
    return;
  }
  
  isSaving.value = true;
  
  try {
    if (showEditModal.value) {
      // Update existing template
      await emailStore.updateTemplate(templateForm._id, {
        name: templateForm.name,
        category: templateForm.category,
        subject: templateForm.subject,
        body: templateForm.body,
      });
      toast.success('Template updated successfully');
    } else {
      // Create new template
      await emailStore.createTemplate({
        name: templateForm.name,
        category: templateForm.category,
        subject: templateForm.subject,
        body: templateForm.body,
      });
      toast.success('Template created successfully');
    }
    
    closeModals();
  } catch (err: any) {
    toast.error(err.message || 'Failed to save template');
  } finally {
    isSaving.value = false;
  }
};

const useTemplate = (template: any) => {
  // Navigate to email composer with this template
  router.push({
    path: '/dashboard/tools/email-composer',
    query: { template: template._id }
  });
};

const closeModals = () => {
  showCreateModal.value = false;
  showEditModal.value = false;
  
  // Reset form
  templateForm._id = '';
  templateForm.name = '';
  templateForm.category = '';
  templateForm.subject = '';
  templateForm.body = '';
};

// Helper functions
const truncateHtml = (html: string) => {
  // Create a temporary div to parse the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Get the text content
  let text = tempDiv.textContent || tempDiv.innerText || '';
  
  // Truncate the text
  if (text.length > 100) {
    text = text.substring(0, 100) + '...';
  }
  
  return text;
};

const formatPercentage = (value: number | undefined) => {
  if (value === undefined) return '0%';
  return `${Math.round(value * 100)}%`;
};

// Lifecycle hooks
onMounted(() => {
  fetchTemplates();
});
</script>

<style scoped>
.email-template-manager {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  position: relative;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.template-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
  background-color: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 200px;
}

.search-box input {
  width: 100%;
  padding: 10px 16px 10px 40px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.search-box i {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 180px;
}

.filter-group label {
  font-size: 12px;
  font-weight: 500;
  color: #4b5563;
}

.filter-group select {
  padding: 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background-color: white;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #4f46e5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  background-color: #fee2e2;
  border-radius: 8px;
  color: #b91c1c;
  text-align: center;
}

.error-message i {
  font-size: 24px;
  margin-bottom: 12px;
}

.error-message button {
  margin-top: 16px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.empty-state i {
  font-size: 48px;
  color: #9ca3af;
  margin-bottom: 16px;
}

.empty-state p {
  color: #4b5563;
  margin-bottom: 24px;
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.template-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 16px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.template-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.template-card.selected {
  border-color: #4f46e5;
}

.template-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.template-name {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.template-category {
  font-size: 12px;
  padding: 2px 8px;
  background-color: #e5e7eb;
  border-radius: 12px;
  color: #4b5563;
}

.template-subject {
  font-size: 14px;
  font-weight: 500;
  color: #4b5563;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.template-preview {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 16px;
  flex-grow: 1;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.template-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.template-stats {
  display: flex;
  gap: 12px;
}

.stat {
  font-size: 12px;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 4px;
}

.template-actions {
  display: flex;
  gap: 8px;
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.edit-btn {
  background-color: #e0f7fa;
  color: #06b6d4;
}

.edit-btn:hover {
  background-color: #b2ebf2;
}

.delete-btn {
  background-color: #fee2e2;
  color: #ef4444;
}

.delete-btn:hover {
  background-color: #fecaca;
}

.template-preview-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 40%;
  height: 100vh;
  background-color: white;
  box-shadow: -4px 0 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
  display: flex;
  flex-direction: column;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.preview-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  color: #6b7280;
  cursor: pointer;
}

.preview-content {
  flex-grow: 1;
  overflow-y: auto;
  padding: 24px;
}

.preview-section {
  margin-bottom: 24px;
}

.preview-section h3 {
  font-size: 16px;
  font-weight: 600;
  color: #4b5563;
  margin-top: 0;
  margin-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 8px;
}

.preview-subject {
  font-size: 16px;
  color: #111827;
  padding: 12px;
  background-color: #f9fafb;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.preview-body {
  padding: 16px;
  background-color: #f9fafb;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  min-height: 200px;
  max-height: 400px;
  overflow-y: auto;
}

.variables-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.variable-tag {
  display: inline-block;
  padding: 4px 8px;
  background-color: #e0f2fe;
  color: #0284c7;
  border-radius: 4px;
  font-size: 12px;
  font-family: monospace;
}

.preview-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background-color: white;
  border-radius: 8px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.delete-modal {
  max-width: 500px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.modal-body {
  padding: 24px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
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

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.warning-text {
  color: #ef4444;
  font-weight: 500;
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

.btn.danger:hover {
  background-color: #dc2626;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .templates-grid {
    grid-template-columns: 1fr;
  }
  
  .template-preview-panel {
    width: 100%;
  }
}
</style>
