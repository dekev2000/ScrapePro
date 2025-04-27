<template>
  <div class="email-form">
    <div class="business-info">
      <h3>Client Information</h3>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">Name:</span>
          <span class="info-value">{{ business.name }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Email:</span>
          <span class="info-value">{{ business.contact?.email || 'N/A' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Phone:</span>
          <span class="info-value">{{ business.contact?.phone || 'N/A' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Address:</span>
          <span class="info-value">{{ formatAddress(business.address) }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Website:</span>
          <span class="info-value">
            <a v-if="business.contact?.website" :href="business.contact.website" target="_blank">
              {{ business.contact.website }}
            </a>
            <span v-else>N/A</span>
          </span>
        </div>
        <div class="info-item">
          <span class="info-label">Preview URL:</span>
          <span class="info-value">
            <a v-if="business.websiteGeneration?.previewLink" :href="business.websiteGeneration.previewLink" target="_blank">
              {{ business.websiteGeneration.previewLink }}
            </a>
            <span v-else>N/A</span>
          </span>
        </div>
      </div>
    </div>

    <div class="preview-screenshot" v-if="business.websiteGeneration?.previewScreenshot">
      <h3>Website Preview</h3>
      <img :src="business.websiteGeneration.previewScreenshot" alt="Website Preview" />
    </div>

    <form @submit.prevent="submitForm">
      <div class="form-section">
        <h3>Email Details</h3>
        
        <div class="form-group">
          <label for="recipient">Recipient Email</label>
          <input
            id="recipient"
            v-model="formData.recipient"
            type="email"
            placeholder="Enter recipient email"
            required
          />
        </div>

        <div class="form-group">
          <label for="template">Email Template</label>
          <select
            id="template"
            v-model="formData.templateId"
            @change="handleTemplateChange"
          >
            <option value="">-- Select a template --</option>
            <option v-for="template in templates" :key="template._id" :value="template._id">
              {{ template.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="subject">Subject</label>
          <input
            id="subject"
            v-model="formData.subject"
            type="text"
            placeholder="Enter email subject"
            required
          />
        </div>

        <div class="form-group">
          <label for="body">Email Body</label>
          <textarea
            id="body"
            v-model="formData.body"
            rows="10"
            placeholder="Enter email content"
            required
          ></textarea>
          <div class="shortcode-help">
            <p>Available shortcodes:</p>
            <ul>
              <li><code>{{business.name}}</code> - Business name</li>
              <li><code>{{business.address.city}}</code> - Business city</li>
              <li><code>{{business.contact.phone}}</code> - Business phone</li>
              <li><code>{{business.contact.email}}</code> - Business email</li>
              <li><code>{{preview.link}}</code> - Preview website URL</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button type="button" class="btn secondary" @click="$emit('cancel')">Cancel</button>
        <button type="submit" class="btn primary" :disabled="loading">
          {{ loading ? 'Sending...' : 'Send Email' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useEmailStore } from '@/stores/email';

const props = defineProps({
  business: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['submit', 'cancel']);

const emailStore = useEmailStore();
const loading = ref(false);
const templates = ref([]);

const formData = ref({
  recipient: '',
  templateId: '',
  subject: '',
  body: '',
  variables: {}
});

// Initialize form data with business information
onMounted(async () => {
  // Set default recipient if available
  if (props.business.contact && props.business.contact.email) {
    formData.value.recipient = props.business.contact.email;
  }

  // Fetch email templates
  try {
    loading.value = true;
    templates.value = await emailStore.fetchTemplates();
  } catch (error) {
    console.error('Failed to fetch email templates:', error);
  } finally {
    loading.value = false;
  }
});

// Format address for display
const formatAddress = (address) => {
  if (!address) return 'N/A';
  
  const parts = [];
  if (address.street) parts.push(address.street);
  if (address.city) parts.push(address.city);
  if (address.postalCode) parts.push(address.postalCode);
  if (address.country) parts.push(address.country);
  
  return parts.join(', ') || 'N/A';
};

// Handle template selection
const handleTemplateChange = async () => {
  if (!formData.value.templateId) {
    formData.value.subject = '';
    formData.value.body = '';
    return;
  }

  try {
    loading.value = true;
    const template = await emailStore.fetchTemplateById(formData.value.templateId);
    
    if (template) {
      // Process template variables
      formData.value.subject = processTemplateVariables(template.subject);
      formData.value.body = processTemplateVariables(template.body);
    }
  } catch (error) {
    console.error('Failed to fetch template:', error);
  } finally {
    loading.value = false;
  }
};

// Process template variables
const processTemplateVariables = (content) => {
  if (!content) return '';
  
  let processedContent = content;
  
  // Replace business variables
  processedContent = processedContent.replace(/{{business.name}}/g, props.business.name || '');
  processedContent = processedContent.replace(/{{business.address.city}}/g, props.business.address?.city || '');
  processedContent = processedContent.replace(/{{business.address.street}}/g, props.business.address?.street || '');
  processedContent = processedContent.replace(/{{business.contact.phone}}/g, props.business.contact?.phone || '');
  processedContent = processedContent.replace(/{{business.contact.email}}/g, props.business.contact?.email || '');
  
  // Replace website preview variables
  if (props.business.websiteGeneration && props.business.websiteGeneration.previewLink) {
    processedContent = processedContent.replace(/{{preview.link}}/g, props.business.websiteGeneration.previewLink);
  } else {
    processedContent = processedContent.replace(/{{preview.link}}/g, 'Preview not available');
  }
  
  return processedContent;
};

// Submit form
const submitForm = async () => {
  try {
    loading.value = true;
    
    // Prepare email data
    const emailData = {
      templateId: formData.value.templateId,
      recipientEmail: formData.value.recipient,
      subject: formData.value.subject,
      body: formData.value.body,
      variables: formData.value.variables
    };
    
    // Emit submit event with email data
    emit('submit', emailData);
  } catch (error) {
    console.error('Error submitting form:', error);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.email-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.business-info {
  background-color: #f9fafb;
  border-radius: 8px;
  padding: 16px;
}

.business-info h3 {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 18px;
  color: #111827;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-weight: 500;
  color: #6b7280;
  font-size: 14px;
}

.info-value {
  color: #111827;
  font-size: 15px;
}

.info-value a {
  color: #4f46e5;
  text-decoration: none;
}

.info-value a:hover {
  text-decoration: underline;
}

.preview-screenshot {
  margin-top: 16px;
}

.preview-screenshot h3 {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 18px;
  color: #111827;
}

.preview-screenshot img {
  max-width: 100%;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-section h3 {
  margin-top: 0;
  margin-bottom: 8px;
  font-size: 18px;
  color: #111827;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  width: 100%;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
}

.shortcode-help {
  margin-top: 8px;
  padding: 12px;
  background-color: #f9fafb;
  border-radius: 6px;
  font-size: 14px;
}

.shortcode-help p {
  margin-top: 0;
  margin-bottom: 8px;
  font-weight: 500;
}

.shortcode-help ul {
  margin: 0;
  padding-left: 20px;
}

.shortcode-help code {
  background-color: #e5e7eb;
  padding: 2px 4px;
  border-radius: 4px;
  font-family: monospace;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.btn {
  padding: 10px 16px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn.primary {
  background-color: #4f46e5;
  color: white;
}

.btn.primary:hover {
  background-color: #4338ca;
}

.btn.primary:disabled {
  background-color: #a5b4fc;
  cursor: not-allowed;
}

.btn.secondary {
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn.secondary:hover {
  background-color: #e5e7eb;
}
</style>
