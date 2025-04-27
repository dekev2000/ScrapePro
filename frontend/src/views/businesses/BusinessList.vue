<template>
  <div class="business-list">
    <div class="page-header">
      <h1>Business Directory</h1>
      <div class="header-actions">
        <BaseButton 
          variant="outline-primary" 
          icon="fas fa-file-export"
          @click="exportData"
        >
          Export
        </BaseButton>
        <BaseButton 
          variant="primary" 
          icon="fas fa-plus"
          @click="showAddBusinessModal = true"
        >
          Add Business
        </BaseButton>
      </div>
    </div>

    <div class="filter-bar">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search businesses..."
          class="search-input"
          @input="debouncedSearch"
        />
      </div>
      <div class="filter-options">
        <div class="filter-group">
          <label>City:</label>
          <select v-model="cityFilter" class="filter-select" @change="applyFilters">
            <option value="">All Cities</option>
            <option v-for="city in cities" :key="city" :value="city">{{ city }}</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Type:</label>
          <select v-model="typeFilter" class="filter-select" @change="applyFilters">
            <option value="">All Types</option>
            <option v-for="type in businessTypes" :key="type" :value="type">{{ type }}</option>
          </select>
        </div>
      </div>
    </div>

    <BaseCard v-if="loading" class="loading-card">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
        <span>Loading businesses...</span>
      </div>
    </BaseCard>

    <div v-else-if="filteredBusinesses.length === 0" class="empty-state">
      <i class="fas fa-store-slash"></i>
      <h3>No businesses found</h3>
      <p v-if="hasFilters">Try adjusting your filters or search query.</p>
      <p v-else>Start by adding a business or running a scraping job.</p>
      <div class="empty-actions">
        <BaseButton 
          variant="outline-primary" 
          icon="fas fa-search"
          @click="navigateToScraping"
        >
          Run Scraping Job
        </BaseButton>
        <BaseButton 
          variant="primary" 
          icon="fas fa-plus"
          @click="showAddBusinessModal = true"
        >
          Add Business Manually
        </BaseButton>
      </div>
    </div>

    <div v-else class="business-grid">
      <BaseCard
        v-for="business in filteredBusinesses"
        :key="business._id"
        class="business-card"
      >
        <div class="business-header">
          <h3 class="business-name">{{ business.name }}</h3>
          <div class="business-actions">
            <button class="action-button" @click="viewBusinessDetails(business)">
              <i class="fas fa-eye"></i>
            </button>
            <button class="action-button" @click="editBusiness(business)">
              <i class="fas fa-edit"></i>
            </button>
          </div>
        </div>

        <div class="business-details">
          <div class="detail-item">
            <i class="fas fa-map-marker-alt"></i>
            <span>{{ formatAddress(business.address) }}</span>
          </div>
          <div class="detail-item" v-if="business.contact && business.contact.phone">
            <i class="fas fa-phone"></i>
            <span>{{ business.contact.phone }}</span>
          </div>
          <div class="detail-item" v-if="business.contact && business.contact.email">
            <i class="fas fa-envelope"></i>
            <span>{{ business.contact.email }}</span>
          </div>
          <div class="detail-item" v-if="business.contact && business.contact.website">
            <i class="fas fa-globe"></i>
            <a :href="business.contact.website" target="_blank" class="website-link">
              {{ formatWebsite(business.contact.website) }}
            </a>
          </div>
          <div class="detail-item" v-if="business.business && business.business.type">
            <i class="fas fa-tag"></i>
            <span>{{ business.business.type }}</span>
          </div>
        </div>

        <div class="business-footer">
          <div class="status-badges">
            <span 
              v-if="business.websiteGeneration && business.websiteGeneration.status" 
              class="status-badge website-status"
              :class="getWebsiteStatusClass(business.websiteGeneration.status)"
            >
              <i class="fas fa-globe"></i>
              {{ formatWebsiteStatus(business.websiteGeneration.status) }}
            </span>
            <span 
              v-if="business.emailOutreach && business.emailOutreach.status" 
              class="status-badge email-status"
              :class="getEmailStatusClass(business.emailOutreach.status)"
            >
              <i class="fas fa-envelope"></i>
              {{ formatEmailStatus(business.emailOutreach.status) }}
            </span>
          </div>
          <div class="action-buttons">
            <BaseButton 
              v-if="!business.websiteGeneration || business.websiteGeneration.status !== 'generated'"
              variant="outline-info" 
              size="sm"
              @click="generateWebsitePreview(business)"
            >
              Generate Preview
            </BaseButton>
            <BaseButton 
              v-else
              variant="info" 
              size="sm"
              @click="viewWebsitePreview(business)"
            >
              View Preview
            </BaseButton>
            <BaseButton 
              variant="outline-primary" 
              size="sm"
              @click="sendEmail(business)"
            >
              Send Email
            </BaseButton>
          </div>
        </div>
      </BaseCard>
    </div>

    <div class="pagination" v-if="totalPages > 1">
      <button 
        class="pagination-button" 
        :disabled="currentPage === 1"
        @click="changePage(currentPage - 1)"
      >
        <i class="fas fa-chevron-left"></i>
      </button>
      <button 
        v-for="page in paginationPages" 
        :key="page"
        class="pagination-button"
        :class="{ active: currentPage === page }"
        @click="changePage(page)"
      >
        {{ page }}
      </button>
      <button 
        class="pagination-button" 
        :disabled="currentPage === totalPages"
        @click="changePage(currentPage + 1)"
      >
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>

    <!-- Add Business Modal -->
    <BaseModal
      v-model="showAddBusinessModal"
      title="Add New Business"
      size="lg"
    >
      <BusinessForm 
        :business="newBusiness"
        @submit="addBusiness"
        @cancel="showAddBusinessModal = false"
      />
    </BaseModal>

    <!-- Edit Business Modal -->
    <BaseModal
      v-model="showEditBusinessModal"
      title="Edit Business"
      size="lg"
    >
      <BusinessForm 
        v-if="selectedBusiness"
        :business="selectedBusiness"
        :is-edit="true"
        @submit="updateBusiness"
        @cancel="showEditBusinessModal = false"
      />
    </BaseModal>

    <!-- Business Details Modal -->
    <BaseModal
      v-model="showDetailsModal"
      title="Business Details"
      size="lg"
    >
      <BusinessDetails 
        v-if="selectedBusiness"
        :business="selectedBusiness"
        @edit="editBusiness(selectedBusiness)"
        @generate-preview="generateWebsitePreview(selectedBusiness)"
        @view-preview="viewWebsitePreview(selectedBusiness)"
        @send-email="sendEmail(selectedBusiness)"
      />
    </BaseModal>

    <!-- Website Preview Modal -->
    <BaseModal
      v-model="showPreviewModal"
      title="Website Preview"
      size="xl"
    >
      <WebsitePreview 
        v-if="selectedBusiness"
        :business="selectedBusiness"
        @send-email="sendEmail(selectedBusiness)"
      />
    </BaseModal>

    <!-- Email Modal -->
    <BaseModal
      v-model="showEmailModal"
      title="Send Email"
      size="lg"
    >
      <EmailForm 
        v-if="selectedBusiness"
        :business="selectedBusiness"
        @submit="submitEmail"
        @cancel="showEmailModal = false"
      />
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from '@/composables/useToast';
import BaseCard from '@/components/ui/BaseCard.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseModal from '@/components/ui/BaseModal.vue';
import BusinessForm from '@/components/businesses/BusinessForm.vue';
import BusinessDetails from '@/components/businesses/BusinessDetails.vue';
import WebsitePreview from '@/components/businesses/WebsitePreview.vue';
import EmailForm from '@/components/emails/EmailForm.vue';
import { useBusinessStore } from '@/stores/business';
import { useAuthStore } from '@/stores/auth';
import debounce from 'lodash/debounce';

const router = useRouter();
const route = useRoute();
const toast = useToast();
const businessStore = useBusinessStore();
const authStore = useAuthStore();

// State
const loading = ref(true);
const searchQuery = ref('');
const cityFilter = ref('');
const typeFilter = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(12);
const showAddBusinessModal = ref(false);
const showEditBusinessModal = ref(false);
const showDetailsModal = ref(false);
const showPreviewModal = ref(false);
const showEmailModal = ref(false);
const selectedBusiness = ref(null);
const newBusiness = ref({
  name: '',
  address: {
    street: '',
    city: '',
    postalCode: '',
    country: 'France'
  },
  contact: {
    phone: '',
    email: '',
    website: ''
  },
  business: {
    type: '',
    nafCode: ''
  }
});

// Computed properties
const filteredBusinesses = computed(() => {
  let result = businessStore.businesses;

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(business => 
      business.name.toLowerCase().includes(query) ||
      (business.address.city && business.address.city.toLowerCase().includes(query)) ||
      (business.business.type && business.business.type.toLowerCase().includes(query))
    );
  }

  // Apply city filter
  if (cityFilter.value) {
    result = result.filter(business => 
      business.address.city === cityFilter.value
    );
  }

  // Apply type filter
  if (typeFilter.value) {
    result = result.filter(business => 
      business.business.type === typeFilter.value
    );
  }

  // Apply pagination
  const startIndex = (currentPage.value - 1) * itemsPerPage.value;
  const endIndex = startIndex + itemsPerPage.value;
  
  return result.slice(startIndex, endIndex);
});

const totalBusinesses = computed(() => {
  return businessStore.businesses.length;
});

const totalPages = computed(() => {
  return Math.ceil(totalBusinesses.value / itemsPerPage.value);
});

const paginationPages = computed(() => {
  const pages = [];
  const maxVisiblePages = 5;
  
  if (totalPages.value <= maxVisiblePages) {
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i);
    }
  } else {
    // Always show first page
    pages.push(1);
    
    // Calculate start and end of middle pages
    let startPage = Math.max(2, currentPage.value - 1);
    let endPage = Math.min(totalPages.value - 1, startPage + 2);
    
    // Adjust if we're near the end
    if (endPage === totalPages.value - 1) {
      startPage = Math.max(2, endPage - 2);
    }
    
    // Add ellipsis if needed
    if (startPage > 2) {
      pages.push('...');
    }
    
    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    // Add ellipsis if needed
    if (endPage < totalPages.value - 1) {
      pages.push('...');
    }
    
    // Always show last page
    pages.push(totalPages.value);
  }
  
  return pages;
});

const cities = computed(() => {
  const citySet = new Set();
  businessStore.businesses.forEach(business => {
    if (business.address && business.address.city) {
      citySet.add(business.address.city);
    }
  });
  return Array.from(citySet).sort();
});

const businessTypes = computed(() => {
  const typeSet = new Set();
  businessStore.businesses.forEach(business => {
    if (business.business && business.business.type) {
      typeSet.add(business.business.type);
    }
  });
  return Array.from(typeSet).sort();
});

const hasFilters = computed(() => {
  return searchQuery.value !== '' || cityFilter.value !== '' || typeFilter.value !== '';
});

// Methods
const debouncedSearch = debounce(() => {
  currentPage.value = 1;
}, 300);

function applyFilters() {
  currentPage.value = 1;
}

function changePage(page) {
  currentPage.value = page;
  window.scrollTo(0, 0);
}

function formatAddress(address) {
  if (!address) return 'No address';
  
  const parts = [];
  if (address.street) parts.push(address.street);
  if (address.postalCode && address.city) {
    parts.push(`${address.postalCode} ${address.city}`);
  } else if (address.city) {
    parts.push(address.city);
  }
  
  return parts.join(', ');
}

function formatWebsite(website) {
  if (!website) return '';
  return website.replace(/^https?:\/\/(www\.)?/, '');
}

function getWebsiteStatusClass(status) {
  switch (status) {
    case 'pending':
      return 'status-pending';
    case 'generated':
      return 'status-success';
    case 'failed':
      return 'status-error';
    default:
      return '';
  }
}

function getEmailStatusClass(status) {
  switch (status) {
    case 'pending':
      return 'status-pending';
    case 'sent':
      return 'status-info';
    case 'opened':
      return 'status-success';
    case 'clicked':
      return 'status-success';
    case 'responded':
      return 'status-success';
    case 'failed':
      return 'status-error';
    default:
      return '';
  }
}

function formatWebsiteStatus(status) {
  switch (status) {
    case 'pending':
      return 'Preview Pending';
    case 'generated':
      return 'Preview Ready';
    case 'failed':
      return 'Preview Failed';
    default:
      return status;
  }
}

function formatEmailStatus(status) {
  switch (status) {
    case 'pending':
      return 'Email Pending';
    case 'sent':
      return 'Email Sent';
    case 'opened':
      return 'Email Opened';
    case 'clicked':
      return 'Email Clicked';
    case 'responded':
      return 'Email Responded';
    case 'failed':
      return 'Email Failed';
    default:
      return status;
  }
}

function navigateToScraping() {
  router.push('/scraping/builder');
}

function viewBusinessDetails(business) {
  selectedBusiness.value = { ...business };
  showDetailsModal.value = true;
}

function editBusiness(business) {
  selectedBusiness.value = { ...business };
  showEditBusinessModal.value = true;
}

async function addBusiness(businessData) {
  try {
    await businessStore.createBusiness(businessData);
    showAddBusinessModal.value = false;
    toast.success('Business added successfully');
  } catch (error) {
    toast.error('Failed to add business: ' + error.message);
  }
}

async function updateBusiness(businessData) {
  try {
    await businessStore.updateBusiness(businessData._id, businessData);
    showEditBusinessModal.value = false;
    toast.success('Business updated successfully');
  } catch (error) {
    toast.error('Failed to update business: ' + error.message);
  }
}

async function generateWebsitePreview(business) {
  try {
    await businessStore.generateWebsitePreview(business._id);
    toast.success('Website preview generated successfully');
    
    // Refresh business data
    await businessStore.fetchBusinessById(business._id);
    
    // Update selected business if needed
    if (selectedBusiness.value && selectedBusiness.value._id === business._id) {
      selectedBusiness.value = businessStore.getBusinessById(business._id);
    }
    
    // Show preview modal
    viewWebsitePreview(businessStore.getBusinessById(business._id));
  } catch (error) {
    toast.error('Failed to generate website preview: ' + error.message);
  }
}

function viewWebsitePreview(business) {
  selectedBusiness.value = business;
  showPreviewModal.value = true;
}

function sendEmail(business) {
  selectedBusiness.value = business;
  showEmailModal.value = true;
}

async function submitEmail(emailData) {
  try {
    await businessStore.sendBusinessEmail(selectedBusiness.value._id, emailData);
    showEmailModal.value = false;
    toast.success('Email sent successfully');
    
    // Refresh business data
    await businessStore.fetchBusinessById(selectedBusiness.value._id);
  } catch (error) {
    toast.error('Failed to send email: ' + error.message);
  }
}

async function exportData() {
  try {
    // In a real app, this would call an API to generate a CSV/Excel file
    toast.info('Export functionality will be implemented in a future update');
  } catch (error) {
    toast.error('Failed to export data: ' + error.message);
  }
}

// Lifecycle hooks
onMounted(async () => {
  try {
    // Check if user is authenticated
    if (!authStore.isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    
    // Load businesses
    await businessStore.fetchBusinesses();
    
    // Check for query params
    if (route.query.scrapeJob) {
      // Filter businesses by scrape job
      // This would be implemented in a real app
      toast.info(`Showing businesses from scraping job: ${route.query.scrapeJob}`);
    }
  } catch (error) {
    toast.error('Failed to load businesses: ' + error.message);
  } finally {
    loading.value = false;
  }
});

// Watch for route changes
watch(() => route.query, (newQuery) => {
  if (newQuery.scrapeJob) {
    // Filter businesses by scrape job
    // This would be implemented in a real app
    toast.info(`Showing businesses from scraping job: ${newQuery.scrapeJob}`);
  }
}, { immediate: true });
</script>

<style scoped>
.business-list {
  padding: 1rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.page-header h1 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 600;
  color: #1f2937;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 0.75rem 1rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 300px;
}

.search-box i {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
}

.search-input {
  width: 100%;
  padding: 0.5rem 0.75rem 0.5rem 2rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.filter-options {
  display: flex;
  gap: 1rem;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-group label {
  font-size: 0.875rem;
  color: #4b5563;
}

.filter-select {
  padding: 0.375rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background-color: #fff;
}

.business-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.business-card {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.business-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.business-name {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.business-actions {
  display: flex;
  gap: 0.25rem;
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: none;
  background-color: #f3f4f6;
  color: #4b5563;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.action-button:hover {
  background-color: #e5e7eb;
  color: #1f2937;
}

.business-details {
  flex: 1;
  margin-bottom: 1rem;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: #4b5563;
}

.detail-item i {
  width: 1.25rem;
  margin-right: 0.5rem;
  color: #6b7280;
}

.website-link {
  color: #4f46e5;
  text-decoration: none;
}

.website-link:hover {
  text-decoration: underline;
}

.business-footer {
  margin-top: auto;
  border-top: 1px solid #e5e7eb;
  padding-top: 1rem;
}

.status-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge i {
  margin-right: 0.25rem;
}

.status-pending {
  background-color: #e5e7eb;
  color: #4b5563;
}

.status-info {
  background-color: #dbeafe;
  color: #1d4ed8;
}

.status-success {
  background-color: #d1fae5;
  color: #047857;
}

.status-error {
  background-color: #fee2e2;
  color: #b91c1c;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.loading-card {
  grid-column: 1 / -1;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #6b7280;
}

.loading-spinner i {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #4f46e5;
}

.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  background-color: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #d1d5db;
}

.empty-state h3 {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.empty-state p {
  margin: 0 0 1.5rem;
  text-align: center;
  color: #6b7280;
}

.empty-actions {
  display: flex;
  gap: 0.75rem;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.pagination-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  height: 2rem;
  padding: 0 0.5rem;
  margin: 0 0.125rem;
  border: 1px solid #e5e7eb;
  background-color: #fff;
  color: #4b5563;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-button:hover:not(:disabled) {
  background-color: #f3f4f6;
  border-color: #d1d5db;
}

.pagination-button.active {
  background-color: #4f46e5;
  border-color: #4f46e5;
  color: #fff;
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .filter-bar {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .search-box {
    max-width: 100%;
    width: 100%;
  }
  
  .filter-options {
    width: 100%;
    flex-wrap: wrap;
  }
  
  .filter-group {
    flex: 1;
    min-width: 150px;
  }
  
  .business-grid {
    grid-template-columns: 1fr;
  }
}
</style>
