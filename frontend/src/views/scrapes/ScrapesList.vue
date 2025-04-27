<template>
  <div class="scrapes-list">
    <div class="scrapes-header">
      <h1>Scraping Jobs</h1>
      <router-link
        to="/dashboard/scrape-builder"
        class="new-scrape-btn"
      >
        <i class="fas fa-plus"></i>
        New Scrape
      </router-link>
    </div>

    <div class="filters">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search scraping jobs..."
          @input="filterJobs"
        />
      </div>

      <div class="filter-group">
        <label>Status:</label>
        <select
          v-model="statusFilter"
          @change="filterJobs"
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="paused">Paused</option>
        </select>
      </div>

      <div class="filter-group">
        <label>Source:</label>
        <select
          v-model="sourceFilter"
          @change="filterJobs"
        >
          <option value="">All</option>
          <option value="google_maps">Google Maps</option>
          <option value="insee">INSEE</option>
          <option value="other">Other</option>
        </select>
      </div>
    </div>

    <div
      v-if="loading"
      class="loading-state"
    >
      <i class="fas fa-spinner fa-spin"></i>
      <p>Loading scraping jobs...</p>
    </div>

    <div
      v-else-if="filteredJobs.length === 0"
      class="empty-state"
    >
      <i class="fas fa-search"></i>
      <h3>No scraping jobs found</h3>
      <p v-if="hasFilters">Try adjusting your filters or search query.</p>
      <p v-else>Start by creating a new scraping job.</p>
      <router-link
        to="/dashboard/scrape-builder"
        class="create-btn"
      >
        Create Scraping Job
      </router-link>
    </div>

    <div
      v-else
      class="table-container"
    >
      <table class="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Source</th>
            <th>Locations</th>
            <th>Search Terms</th>
            <th>Results</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="job in filteredJobs"
            :key="job._id"
          >
            <td class="job-name">{{ job.name }}</td>
            <td>
              <span :class="['status-badge', job.status]">{{ formatStatus(job.status) }}</span>
            </td>
            <td>{{ formatSource(job.source) }}</td>
            <td>{{ formatLocations(job.locations) }}</td>
            <td>{{ formatSearchTerms(job.searchTerms) }}</td>
            <td>{{ job.resultsCount || 0 }}</td>
            <td>{{ formatDate(job.createdAt) }}</td>
            <td class="actions-cell">
              <div class="table-actions">
                <button
                  v-if="job.status === 'pending'"
                  class="action-btn run-btn"
                  @click="runJob(job)"
                  :disabled="isJobRunning(job._id)"
                  title="Run"
                >
                  <i class="fas fa-play"></i>
                </button>

                <button
                  v-if="job.status === 'in_progress'"
                  class="action-btn pause-btn"
                  @click="pauseJob(job)"
                  title="Pause"
                >
                  <i class="fas fa-pause"></i>
                </button>

                <button
                  v-if="job.status === 'paused'"
                  class="action-btn resume-btn"
                  @click="resumeJob(job)"
                  title="Resume"
                >
                  <i class="fas fa-play"></i>
                </button>

                <button
                  v-if="job.status === 'completed'"
                  class="action-btn view-btn"
                  @click="viewResults(job)"
                  title="View Results"
                >
                  <i class="fas fa-eye"></i>
                </button>

                <button
                  class="action-btn details-btn"
                  @click="viewJobDetails(job)"
                  title="Details"
                >
                  <i class="fas fa-info-circle"></i>
                </button>

                <button
                  class="action-btn delete-btn"
                  @click="confirmDeleteJob(job)"
                  title="Delete"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Job Details Modal -->
    <div
      v-if="showJobDetailsModal"
      class="modal"
    >
      <div class="modal-content">
        <div class="modal-header">
          <h2>Job Details</h2>
          <button
            class="close-btn"
            @click="showJobDetailsModal = false"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div
          v-if="selectedJob"
          class="modal-body"
        >
          <div class="detail-section">
            <h3>Basic Information</h3>
            <div class="detail-row">
              <span class="detail-label">Name:</span>
              <span class="detail-value">{{ selectedJob.name }}</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Status:</span>
              <span :class="['status-badge', selectedJob.status]">
                {{ formatStatus(selectedJob.status) }}
              </span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Source:</span>
              <span class="detail-value">{{ formatSource(selectedJob.source) }}</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Created:</span>
              <span class="detail-value">{{ formatDateTime(selectedJob.createdAt) }}</span>
            </div>

            <div
              v-if="selectedJob.startedAt"
              class="detail-row"
            >
              <span class="detail-label">Started:</span>
              <span class="detail-value">{{ formatDateTime(selectedJob.startedAt) }}</span>
            </div>

            <div
              v-if="selectedJob.completedAt"
              class="detail-row"
            >
              <span class="detail-label">Completed:</span>
              <span class="detail-value">{{ formatDateTime(selectedJob.completedAt) }}</span>
            </div>
          </div>

          <div class="detail-section">
            <h3>Search Parameters</h3>
            <div class="detail-row">
              <span class="detail-label">Search Terms:</span>
              <span class="detail-value">{{ formatSearchTerms(selectedJob.searchTerms) }}</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Locations:</span>
              <span class="detail-value">{{ formatLocations(selectedJob.locations) }}</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Filters:</span>
              <span class="detail-value">{{ formatFilters(selectedJob.filters) }}</span>
            </div>
          </div>

          <div
            v-if="selectedJob.logs && selectedJob.logs.length > 0"
            class="detail-section"
          >
            <h3>Logs</h3>
            <div class="logs-container">
              <div
                v-for="(log, index) in selectedJob.logs"
                :key="index"
                :class="['log-entry', log.level]"
              >
                <span class="log-time">{{ formatTime(log.timestamp) }}</span>
                <span class="log-level">{{ log.level.toUpperCase() }}</span>
                <span class="log-message">{{ log.message }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button
            class="btn secondary"
            @click="showJobDetailsModal = false"
          >Close</button>
          <button
            v-if="selectedJob && selectedJob.status === 'completed'"
            class="btn primary"
            @click="viewResults(selectedJob)"
          >
            View Results
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteModal"
      class="modal"
    >
      <div class="modal-content">
        <div class="modal-header">
          <h2>Confirm Delete</h2>
          <button
            class="close-btn"
            @click="showDeleteModal = false"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <p>Are you sure you want to delete the scraping job "{{ selectedJob?.name }}"?</p>
          <p class="warning">This action cannot be undone.</p>
        </div>

        <div class="modal-footer">
          <button
            class="btn secondary"
            @click="showDeleteModal = false"
          >Cancel</button>
          <button
            class="btn danger"
            @click="deleteJob"
          >Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useScrapeStore } from "@/stores/scrape";
import { useBusinessStore } from "@/stores/business";

const router = useRouter();
const scrapeStore = useScrapeStore();
const businessStore = useBusinessStore();

// State
const loading = ref(true);
const searchQuery = ref("");
const statusFilter = ref("");
const sourceFilter = ref("");
const showJobDetailsModal = ref(false);
const showDeleteModal = ref(false);
const selectedJob = ref(null);
const runningJobs = ref<string[]>([]);

// Computed
const filteredJobs = computed(() => {
  let jobs = [...scrapeStore.scrapingJobs];

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    jobs = jobs.filter(
      (job) =>
        job.name.toLowerCase().includes(query) ||
        (job.description && job.description.toLowerCase().includes(query))
    );
  }

  // Apply status filter
  if (statusFilter.value) {
    jobs = jobs.filter((job) => job.status === statusFilter.value);
  }

  // Apply source filter
  if (sourceFilter.value) {
    jobs = jobs.filter((job) => job.source === sourceFilter.value);
  }

  return jobs;
});

const hasFilters = computed(() => {
  return searchQuery.value || statusFilter.value || sourceFilter.value;
});

// Methods
const filterJobs = () => {
  // This function is just a placeholder for the input/select change events
  // The actual filtering is done by the computed property
};

const formatStatus = (status: string) => {
  switch (status) {
    case "pending":
      return "Pending";
    case "in_progress":
      return "In Progress";
    case "completed":
      return "Completed";
    case "failed":
      return "Failed";
    case "paused":
      return "Paused";
    default:
      return status;
  }
};

const formatSource = (source: string) => {
  switch (source) {
    case "google_maps":
      return "Google Maps";
    case "insee":
      return "INSEE";
    case "linkedin":
      return "LinkedIn";
    case "website":
      return "Website";
    case "other":
      return "Other";
    default:
      return source;
  }
};

const formatSearchTerms = (terms: string[]) => {
  if (!terms || terms.length === 0) return "None";
  return terms.join(", ");
};

const formatLocations = (locations: string[]) => {
  if (!locations || locations.length === 0) return "None";
  return locations.join(", ");
};

const formatFilters = (filters: Record<string, any>) => {
  if (!filters || Object.keys(filters).length === 0) return "None";

  return Object.entries(filters)
    .map(([key, value]) => `${key}: ${value}`)
    .join(", ");
};

const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";

  const date = new Date(dateString);
  return date.toLocaleDateString();
};

const formatDateTime = (dateString: string) => {
  if (!dateString) return "N/A";

  const date = new Date(dateString);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
};

const formatTime = (dateString: string) => {
  if (!dateString) return "N/A";

  const date = new Date(dateString);
  return date.toLocaleTimeString();
};

const formatDuration = (startDateString: string, endDateString: string) => {
  if (!startDateString || !endDateString) return "N/A";

  const startDate = new Date(startDateString);
  const endDate = new Date(endDateString);

  const durationMs = endDate.getTime() - startDate.getTime();
  const durationMinutes = Math.floor(durationMs / (1000 * 60));

  if (durationMinutes < 60) {
    return `${durationMinutes} min`;
  } else {
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    return `${hours}h ${minutes}m`;
  }
};

const isJobRunning = (jobId: string) => {
  return runningJobs.value.includes(jobId);
};

const viewJobDetails = (job: any) => {
  selectedJob.value = job;
  showJobDetailsModal.value = true;
};

const confirmDeleteJob = (job: any) => {
  selectedJob.value = job;
  showDeleteModal.value = true;
};

const deleteJob = async () => {
  if (!selectedJob.value) return;

  try {
    await scrapeStore.deleteScrapeJob(selectedJob.value._id);
    showDeleteModal.value = false;
    selectedJob.value = null;
  } catch (error) {
    console.error("Failed to delete job:", error);
  }
};

const runJob = async (job: any) => {
  try {
    runningJobs.value.push(job._id);
    await scrapeStore.runScrapeJob(job._id);

    // Start polling for updates
    scrapeStore.startPollingJob(job._id);
  } catch (error) {
    console.error("Failed to run job:", error);
  } finally {
    runningJobs.value = runningJobs.value.filter((id) => id !== job._id);
  }
};

const pauseJob = async (job: any) => {
  try {
    await scrapeStore.pauseScrapeJob(job._id);
  } catch (error) {
    console.error("Failed to pause job:", error);
  }
};

const resumeJob = async (job: any) => {
  try {
    await scrapeStore.resumeScrapeJob(job._id);
  } catch (error) {
    console.error("Failed to resume job:", error);
  }
};

const viewResults = (job: any) => {
  router.push({
    path: "/dashboard/clients",
    query: { scrapeJob: job._id },
  });
};

// Lifecycle hooks
onMounted(async () => {
  try {
    loading.value = true;
    await scrapeStore.fetchScrapingJobs();
  } catch (error) {
    console.error("Failed to fetch scraping jobs:", error);
  } finally {
    loading.value = false;
  }
});

onUnmounted(() => {
  // Clean up any polling intervals
  scrapeStore.cleanup();
});
</script>

<style scoped>
.scrapes-list {
  width: 100%;
  padding: 20px;
}

.scrapes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.new-scrape-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #4338ca;
  color: white;
  padding: 10px 16px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.2s;
}

.new-scrape-btn:hover {
  background-color: #3730a3;
}

.filters {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 200px;
}

.search-box i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
}

.search-box input {
  width: 100%;
  padding: 10px 10px 10px 36px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-group label {
  font-weight: 500;
  color: #374151;
}

.filter-group select {
  padding: 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background-color: white;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 0;
  text-align: center;
}

.loading-state i,
.empty-state i {
  font-size: 48px;
  color: #9ca3af;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin-bottom: 8px;
  color: #374151;
}

.empty-state p {
  color: #6b7280;
  margin-bottom: 24px;
}

.create-btn {
  display: inline-block;
  background-color: #4338ca;
  color: white;
  padding: 10px 16px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.2s;
}

.create-btn:hover {
  background-color: #3730a3;
}

.table-container {
  width: 100%;
  overflow-x: auto;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.data-table th,
.data-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.data-table th {
  background-color: #f9fafb;
  font-weight: 600;
  color: #374151;
  position: sticky;
  top: 0;
  z-index: 10;
}

.data-table tbody tr:hover {
  background-color: #f9fafb;
}

.data-table .job-name {
  font-weight: 500;
  color: #111827;
}

.actions-cell {
  width: 1%;
  white-space: nowrap;
}

.table-actions {
  display: flex;
  gap: 8px;
}

.job-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.job-header h3 {
  margin: 0;
  font-size: 18px;
  color: #111827;
}

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}

.status-badge.pending {
  background-color: #f3f4f6;
  color: #6b7280;
}

.status-badge.in_progress {
  background-color: #dbeafe;
  color: #1e40af;
}

.status-badge.completed {
  background-color: #d1fae5;
  color: #065f46;
}

.status-badge.failed {
  background-color: #fee2e2;
  color: #b91c1c;
}

.status-badge.paused {
  background-color: #fef3c7;
  color: #92400e;
}

.job-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-item i {
  width: 16px;
  color: #6b7280;
}

.progress-bar {
  height: 8px;
  background-color: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background-color: #4338ca;
  border-radius: 4px;
}

.progress-text {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 10px;
  font-weight: 500;
  color: #4b5563;
}

.job-stats {
  display: flex;
  gap: 16px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
}

.job-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: background-color 0.2s;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.run-btn {
  background-color: #4338ca;
  color: white;
}

.run-btn:hover:not(:disabled) {
  background-color: #3730a3;
}

.pause-btn {
  background-color: #fef3c7;
  color: #92400e;
}

.pause-btn:hover:not(:disabled) {
  background-color: #fde68a;
}

.resume-btn {
  background-color: #4338ca;
  color: white;
}

.resume-btn:hover:not(:disabled) {
  background-color: #3730a3;
}

.view-btn {
  background-color: #e5e7eb;
  color: #374151;
}

.view-btn:hover:not(:disabled) {
  background-color: #d1d5db;
}

.details-btn {
  background-color: #e5e7eb;
  color: #374151;
}

.details-btn:hover:not(:disabled) {
  background-color: #d1d5db;
}

.delete-btn {
  background-color: #fee2e2;
  color: #b91c1c;
}

.delete-btn:hover:not(:disabled) {
  background-color: #fecaca;
}

/* Modal styles */
.modal {
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

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  color: #111827;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #6b7280;
}

.modal-body {
  padding: 16px;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section h3 {
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 16px;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 8px;
}

.detail-row {
  display: flex;
  margin-bottom: 8px;
}

.detail-label {
  width: 120px;
  font-weight: 500;
  color: #6b7280;
}

.logs-container {
  max-height: 200px;
  overflow-y: auto;
  background-color: #f9fafb;
  border-radius: 4px;
  padding: 8px;
}

.log-entry {
  font-family: monospace;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 2px;
  margin-bottom: 4px;
}

.log-entry.info {
  background-color: #dbeafe;
}

.log-entry.warning {
  background-color: #fef3c7;
}

.log-entry.error {
  background-color: #fee2e2;
}

.log-time {
  color: #6b7280;
  margin-right: 8px;
}

.log-level {
  font-weight: bold;
  margin-right: 8px;
}

.log-message {
  color: #111827;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px;
  border-top: 1px solid #e5e7eb;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: background-color 0.2s;
}

.btn.primary {
  background-color: #4338ca;
  color: white;
}

.btn.primary:hover {
  background-color: #3730a3;
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

.warning {
  color: #b91c1c;
  font-weight: 500;
}
</style>