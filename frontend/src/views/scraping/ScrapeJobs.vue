<template>
  <div class="scrape-jobs">
    <div class="page-header">
      <h1>Scraping Jobs</h1>
      <BaseButton variant="primary" icon="fas fa-plus" @click="navigateToBuilder">
        New Scraping Job
      </BaseButton>
    </div>

    <div class="filter-bar">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search jobs..."
          class="search-input"
        />
      </div>
      <div class="filter-options">
        <div class="filter-group">
          <label>Status:</label>
          <select v-model="statusFilter" class="filter-select">
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Source:</label>
          <select v-model="sourceFilter" class="filter-select">
            <option value="">All</option>
            <option value="google_maps">Google Maps</option>
            <option value="insee">INSEE</option>
          </select>
        </div>
      </div>
    </div>

    <div class="jobs-grid">
      <BaseCard v-if="loading" class="loading-card">
        <div class="loading-spinner">
          <i class="fas fa-spinner fa-spin"></i>
          <span>Loading scraping jobs...</span>
        </div>
      </BaseCard>

      <div v-else-if="filteredJobs.length === 0" class="empty-state">
        <i class="fas fa-search"></i>
        <h3>No scraping jobs found</h3>
        <p v-if="hasFilters">Try adjusting your filters or create a new scraping job.</p>
        <p v-else>Get started by creating your first scraping job.</p>
        <BaseButton variant="primary" icon="fas fa-plus" @click="navigateToBuilder">
          Create Scraping Job
        </BaseButton>
      </div>

      <BaseCard
        v-for="job in filteredJobs"
        :key="job._id"
        class="job-card"
        :class="{ 'job-active': job.status === 'in_progress' }"
      >
        <template #header>
          <div class="job-status">
            <span class="status-badge" :class="getStatusClass(job.status)">
              {{ getStatusLabel(job.status) }}
            </span>
          </div>
        </template>

        <h3 class="job-name">{{ job.name }}</h3>
        
        <div class="job-details">
          <div class="job-detail">
            <i class="fas fa-database"></i>
            <span>{{ getSourceLabel(job.source) }}</span>
          </div>
          <div class="job-detail">
            <i class="fas fa-map-marker-alt"></i>
            <span>{{ job.locations.length }} location(s)</span>
          </div>
          <div class="job-detail" v-if="job.source === 'google_maps'">
            <i class="fas fa-search"></i>
            <span>{{ job.searchTerms.length }} search term(s)</span>
          </div>
          <div class="job-detail">
            <i class="fas fa-calendar-alt"></i>
            <span>{{ formatDate(job.createdAt) }}</span>
          </div>
        </div>

        <div v-if="job.status === 'in_progress'" class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${job.progress}%` }"></div>
          </div>
          <span class="progress-text">{{ job.progress }}%</span>
        </div>

        <div v-if="job.status === 'completed'" class="results-summary">
          <i class="fas fa-check-circle"></i>
          <span>{{ job.resultsCount || 0 }} businesses found</span>
        </div>

        <template #footer>
          <div class="job-actions">
            <BaseButton
              v-if="job.status === 'pending'"
              variant="primary"
              size="sm"
              icon="fas fa-play"
              :loading="runningJobs.includes(job._id)"
              @click="runJob(job)"
            >
              Run
            </BaseButton>
            <BaseButton
              v-if="job.status === 'completed'"
              variant="info"
              size="sm"
              icon="fas fa-eye"
              @click="viewResults(job)"
            >
              View Results
            </BaseButton>
            <BaseButton
              variant="secondary"
              size="sm"
              icon="fas fa-info-circle"
              @click="viewJobDetails(job)"
            >
              Details
            </BaseButton>
          </div>
        </template>
      </BaseCard>
    </div>

    <!-- Job Details Modal -->
    <BaseModal
      v-model="showJobDetailsModal"
      title="Scraping Job Details"
      size="lg"
    >
      <div v-if="selectedJob" class="job-details-modal">
        <div class="detail-section">
          <h4>Basic Information</h4>
          <div class="detail-row">
            <div class="detail-label">Name:</div>
            <div class="detail-value">{{ selectedJob.name }}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Status:</div>
            <div class="detail-value">
              <span class="status-badge" :class="getStatusClass(selectedJob.status)">
                {{ getStatusLabel(selectedJob.status) }}
              </span>
            </div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Source:</div>
            <div class="detail-value">{{ getSourceLabel(selectedJob.source) }}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Created:</div>
            <div class="detail-value">{{ formatDate(selectedJob.createdAt, true) }}</div>
          </div>
          <div class="detail-row" v-if="selectedJob.startedAt">
            <div class="detail-label">Started:</div>
            <div class="detail-value">{{ formatDate(selectedJob.startedAt, true) }}</div>
          </div>
          <div class="detail-row" v-if="selectedJob.completedAt">
            <div class="detail-label">Completed:</div>
            <div class="detail-value">{{ formatDate(selectedJob.completedAt, true) }}</div>
          </div>
        </div>

        <div class="detail-section">
          <h4>Search Parameters</h4>
          <div class="detail-row" v-if="selectedJob.source === 'google_maps'">
            <div class="detail-label">Search Terms:</div>
            <div class="detail-value">
              <div class="tag-list">
                <span v-for="(term, index) in selectedJob.searchTerms" :key="index" class="detail-tag">
                  {{ term }}
                </span>
              </div>
            </div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Locations:</div>
            <div class="detail-value">
              <div class="tag-list">
                <span v-for="(location, index) in selectedJob.locations" :key="index" class="detail-tag">
                  {{ location }}
                </span>
              </div>
            </div>
          </div>
          <div class="detail-row" v-if="selectedJob.filters && selectedJob.filters.nafCode">
            <div class="detail-label">NAF Code:</div>
            <div class="detail-value">{{ selectedJob.filters.nafCode }}</div>
          </div>
        </div>

        <div class="detail-section" v-if="selectedJob.logs && selectedJob.logs.length > 0">
          <h4>Logs</h4>
          <div class="logs-container">
            <div
              v-for="(log, index) in selectedJob.logs"
              :key="index"
              class="log-entry"
              :class="{ 'log-error': log.level === 'error' }"
            >
              <div class="log-time">{{ formatTime(log.timestamp) }}</div>
              <div class="log-message">{{ log.message }}</div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <BaseButton
          v-if="selectedJob && selectedJob.status === 'pending'"
          variant="primary"
          icon="fas fa-play"
          :loading="runningJobs.includes(selectedJob._id)"
          @click="runJob(selectedJob)"
        >
          Run Job
        </BaseButton>
        <BaseButton
          v-if="selectedJob && selectedJob.status === 'completed'"
          variant="info"
          icon="fas fa-eye"
          @click="viewResults(selectedJob)"
        >
          View Results
        </BaseButton>
        <BaseButton variant="secondary" @click="showJobDetailsModal = false">
          Close
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from '@/composables/useToast';
import BaseCard from '@/components/ui/BaseCard.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseModal from '@/components/ui/BaseModal.vue';
import { useScrapeStore } from '@/stores/scrape';
import { useBusinessStore } from '@/stores/business';

const router = useRouter();
const toast = useToast();
const scrapeStore = useScrapeStore();
const businessStore = useBusinessStore();

// State
const loading = ref(true);
const searchQuery = ref('');
const statusFilter = ref('');
const sourceFilter = ref('');
const showJobDetailsModal = ref(false);
const selectedJob = ref(null);
const runningJobs = ref<string[]>([]);

// Computed
const filteredJobs = computed(() => {
  let result = scrapeStore.scrapeJobs;

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(job => 
      job.name.toLowerCase().includes(query) ||
      job.locations.some(location => location.toLowerCase().includes(query)) ||
      (job.searchTerms && job.searchTerms.some(term => term.toLowerCase().includes(query)))
    );
  }

  // Apply status filter
  if (statusFilter.value) {
    result = result.filter(job => job.status === statusFilter.value);
  }

  // Apply source filter
  if (sourceFilter.value) {
    result = result.filter(job => job.source === sourceFilter.value);
  }

  return result;
});

const hasFilters = computed(() => {
  return searchQuery.value !== '' || statusFilter.value !== '' || sourceFilter.value !== '';
});

// Methods
function navigateToBuilder() {
  router.push('/scraping/builder');
}

function getStatusClass(status: string) {
  switch (status) {
    case 'pending':
      return 'status-pending';
    case 'in_progress':
      return 'status-progress';
    case 'completed':
      return 'status-completed';
    case 'failed':
      return 'status-failed';
    default:
      return '';
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'in_progress':
      return 'In Progress';
    case 'completed':
      return 'Completed';
    case 'failed':
      return 'Failed';
    default:
      return status;
  }
}

function getSourceLabel(source: string) {
  switch (source) {
    case 'google_maps':
      return 'Google Maps';
    case 'insee':
      return 'INSEE';
    default:
      return source;
  }
}

function formatDate(dateString: string, includeTime = false) {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric'
  };
  
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  
  return new Intl.DateTimeFormat('en-US', options).format(date);
}

function formatTime(timestamp: number) {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  });
}

function viewJobDetails(job: any) {
  selectedJob.value = job;
  showJobDetailsModal.value = true;
}

async function runJob(job: any) {
  try {
    runningJobs.value.push(job._id);
    await scrapeStore.runScrapeJob(job._id);
    toast.success(`Scraping job "${job.name}" started successfully`);
    
    // Start polling for updates
    scrapeStore.startPollingJob(job._id);
  } catch (error: any) {
    toast.error(error.message || 'Failed to run scraping job');
  } finally {
    runningJobs.value = runningJobs.value.filter(id => id !== job._id);
  }
}

function viewResults(job: any) {
  router.push({
    path: '/businesses',
    query: { scrapeJob: job._id }
  });
}

// Lifecycle hooks
onMounted(async () => {
  try {
    await scrapeStore.fetchScrapeJobs();
  } catch (error: any) {
    toast.error(error.message || 'Failed to fetch scraping jobs');
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.scrape-jobs {
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

.jobs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.job-card {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.job-active {
  border-left: 4px solid #3b82f6;
}

.job-status {
  display: flex;
  align-items: center;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-pending {
  background-color: #e5e7eb;
  color: #4b5563;
}

.status-progress {
  background-color: #dbeafe;
  color: #1d4ed8;
}

.status-completed {
  background-color: #d1fae5;
  color: #047857;
}

.status-failed {
  background-color: #fee2e2;
  color: #b91c1c;
}

.job-name {
  margin: 0.5rem 0 1rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.job-details {
  margin-bottom: 1rem;
}

.job-detail {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: #4b5563;
}

.job-detail i {
  width: 1.25rem;
  margin-right: 0.5rem;
  color: #6b7280;
}

.progress-container {
  display: flex;
  align-items: center;
  margin: 0.5rem 0;
}

.progress-bar {
  flex: 1;
  height: 0.5rem;
  background-color: #e5e7eb;
  border-radius: 9999px;
  overflow: hidden;
  margin-right: 0.5rem;
}

.progress-fill {
  height: 100%;
  background-color: #3b82f6;
  border-radius: 9999px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.75rem;
  font-weight: 500;
  color: #4b5563;
  min-width: 2.5rem;
  text-align: right;
}

.results-summary {
  display: flex;
  align-items: center;
  margin: 0.5rem 0;
  font-size: 0.875rem;
  color: #047857;
}

.results-summary i {
  margin-right: 0.5rem;
}

.job-actions {
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

/* Job Details Modal */
.job-details-modal {
  max-height: 60vh;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 1.5rem;
}

.detail-section h4 {
  margin: 0 0 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.5rem;
}

.detail-row {
  display: flex;
  margin-bottom: 0.5rem;
}

.detail-label {
  width: 120px;
  font-weight: 500;
  color: #4b5563;
}

.detail-value {
  flex: 1;
  color: #1f2937;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.detail-tag {
  display: inline-block;
  background-color: #f3f4f6;
  color: #4b5563;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
}

.logs-container {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-family: monospace;
  font-size: 0.875rem;
}

.log-entry {
  display: flex;
  padding: 0.5rem;
  border-bottom: 1px solid #f3f4f6;
}

.log-entry:last-child {
  border-bottom: none;
}

.log-time {
  width: 100px;
  color: #6b7280;
  font-size: 0.75rem;
}

.log-message {
  flex: 1;
}

.log-error {
  background-color: #fee2e2;
  color: #b91c1c;
}
</style>
