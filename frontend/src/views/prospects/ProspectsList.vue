<template>
  <div class="prospects-list">
    <div class="prospects-header">
      <h1>Prospects</h1>
      <div class="header-actions">
        <div class="view-toggle">
          <button
            class="view-btn"
            :class="{ active: viewMode === 'list' }"
            @click="viewMode = 'list'"
            title="List View"
          >
            <i class="fas fa-list"></i>
          </button>
          <button
            class="view-btn"
            :class="{ active: viewMode === 'kanban' }"
            @click="viewMode = 'kanban'"
            title="Kanban View"
          >
            <i class="fas fa-columns"></i>
          </button>
        </div>
        <button
          class="refresh-btn"
          @click="fetchBusinesses"
        >
          <i class="fas fa-sync"></i>
          Refresh
        </button>
      </div>
    </div>

    <!-- Kanban View -->
    <div
      v-if="viewMode === 'kanban'"
      class="kanban-view-container"
    >
      <KanbanView @add-prospect="addProspect" />
    </div>

    <!-- List View -->
    <div v-else>
      <div class="filters">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search prospects..."
            @input="filterProspects"
          />
        </div>

        <div class="filter-group">
          <label for="cityFilter">City:</label>
          <select
            id="cityFilter"
            v-model="cityFilter"
            @change="filterProspects"
          >
            <option value="">All</option>
            <option
              v-for="city in cities"
              :key="city"
              :value="city"
            >{{ city }}</option>
          </select>
        </div>

        <div class="filter-group">
          <label for="statusFilter">Status:</label>
          <select
            id="statusFilter"
            v-model="statusFilter"
            @change="filterProspects"
          >
            <option value="">All</option>
            <option value="generated">Generated</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div
        v-if="loading"
        class="loading-state"
      >
        <i class="fas fa-spinner fa-spin"></i>
        <p>Loading prospects...</p>
      </div>

      <div
        v-else-if="filteredBusinesses.length === 0"
        class="empty-state"
      >
        <i class="fas fa-building"></i>
        <h3>No prospects found</h3>
        <p v-if="hasFilters">Try adjusting your filters or search query.</p>
        <p v-else>Start by running a scraping job or using the Site Designer.</p>
        <div class="empty-actions">
          <router-link
            to="/dashboard/scrapes"
            class="action-btn"
          >
            <i class="fas fa-search"></i>
            Run Scraping Job
          </router-link>
          <router-link
            to="/dashboard/site-designer"
            class="action-btn primary"
          >
            <i class="fas fa-edit"></i>
            Use Site Designer
          </router-link>
        </div>
      </div>

      <div
        v-else
        class="table-container"
      >
        <table class="data-table">
          <thead>
            <tr>
              <th>Business Name</th>
              <th>Status</th>
              <th>Location</th>
              <th>Contact</th>
              <th>Website</th>
              <th>Preview</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="business in filteredBusinesses"
              :key="business._id"
            >
              <td class="business-name">{{ business.name }}</td>
              <td>
                <span :class="['status-badge', getStatusClass(business.websiteGeneration.status)]">
                  {{ formatStatus(business.websiteGeneration.status) }}
                </span>
              </td>
              <td>{{ formatAddress(business.address) }}</td>
              <td>
                <div v-if="business.contact && business.contact.phone">
                  <i class="fas fa-phone"></i> {{ business.contact.phone }}
                </div>
                <div v-if="business.contact && business.contact.email">
                  <i class="fas fa-envelope"></i> {{ business.contact.email }}
                </div>
              </td>
              <td>
                <a
                  v-if="business.contact && business.contact.website"
                  :href="business.contact.website"
                  target="_blank"
                  class="website-link"
                >
                  <i class="fas fa-external-link-alt"></i> Visit Website
                </a>
                <span
                  v-else
                  class="no-website"
                >No website</span>
              </td>
              <td>
                <a
                  v-if="business.websiteGeneration && business.websiteGeneration.previewLink"
                  :href="business.websiteGeneration.previewLink"
                  target="_blank"
                  class="preview-link"
                >
                  <i class="fas fa-external-link-alt"></i> View Preview
                </a>
                <span
                  v-else
                  class="no-preview"
                >No preview</span>
              </td>
              <td class="actions-cell">
                <div class="table-actions">
                  <button
                    class="action-btn info"
                    @click="viewBusinessDetails(business)"
                    title="View Details"
                  >
                    <i class="fas fa-info-circle"></i>
                  </button>
                  <button
                    v-if="business.websiteGeneration && business.websiteGeneration.status === 'generated'"
                    class="action-btn success"
                    @click="convertToClient(business)"
                    title="Convert to Client"
                  >
                    <i class="fas fa-user-check"></i>
                  </button>
                  <router-link
                    :to="`/dashboard/site-designer?id=${business._id}`"
                    class="action-btn primary"
                    title="Edit in Site Designer"
                  >
                    <i class="fas fa-edit"></i>
                  </router-link>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Business Details Modal -->
    <Teleport to="body">
      <div
        v-if="showDetailsModal"
        class="modal"
        @click.self="closeDetailsModal"
      >
        <div class="modal-content">
          <div class="modal-header">
            <h2>Business Details</h2>
            <button
              class="close-btn"
              @click="closeDetailsModal"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div
            v-if="selectedBusiness"
            class="modal-body"
          >
            <div class="detail-section">
              <h3>Basic Information</h3>
              <div class="detail-row">
                <div class="detail-label">Name:</div>
                <div>{{ selectedBusiness.name }}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Status:</div>
                <div>
                  <span :class="['status-badge', getStatusClass(selectedBusiness.websiteGeneration.status)]">
                    {{ formatStatus(selectedBusiness.websiteGeneration.status) }}
                  </span>
                </div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Address:</div>
                <div>{{ formatAddress(selectedBusiness.address) }}</div>
              </div>
            </div>

            <div class="detail-section">
              <h3>Contact Information</h3>
              <div class="detail-row">
                <div class="detail-label">Phone:</div>
                <div>{{ selectedBusiness.contact?.phone || 'N/A' }}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Email:</div>
                <div>{{ selectedBusiness.contact?.email || 'N/A' }}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Website:</div>
                <div>
                  <a
                    v-if="selectedBusiness.contact?.website"
                    :href="selectedBusiness.contact.website"
                    target="_blank"
                  >{{ selectedBusiness.contact.website }}</a>
                  <span v-else>N/A</span>
                </div>
              </div>
            </div>

            <div
              v-if="selectedBusiness.websiteGeneration && selectedBusiness.websiteGeneration.previewLink"
              class="detail-section"
            >
              <h3>Website Preview</h3>
              <div class="detail-row">
                <div class="detail-label">Preview URL:</div>
                <div>
                  <a
                    :href="selectedBusiness.websiteGeneration.previewLink"
                    target="_blank"
                  >{{ selectedBusiness.websiteGeneration.previewLink }}</a>
                </div>
              </div>
              <div
                v-if="selectedBusiness.websiteGeneration.previewScreenshot"
                class="preview-screenshot"
              >
                <img
                  :src="selectedBusiness.websiteGeneration.previewScreenshot"
                  alt="Website Preview"
                />
              </div>
            </div>

            <div class="detail-section">
              <h3>Business Details</h3>
              <div class="detail-row">
                <div class="detail-label">Type:</div>
                <div>{{ selectedBusiness.business?.type || 'N/A' }}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">SIRET:</div>
                <div>{{ selectedBusiness.business?.siret || 'N/A' }}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">SIREN:</div>
                <div>{{ selectedBusiness.business?.siren || 'N/A' }}</div>
              </div>
            </div>

            <div class="detail-section">
              <h3>Scraping Data</h3>
              <div class="detail-row">
                <div class="detail-label">Source:</div>
                <div>{{ selectedBusiness.scrapingData?.source || 'N/A' }}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Scraped At:</div>
                <div>{{ formatDate(selectedBusiness.scrapingData?.scrapedAt) }}</div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button
              class="btn secondary"
              @click="closeDetailsModal"
            >Close</button>
            <button
              v-if="selectedBusiness && selectedBusiness.websiteGeneration && selectedBusiness.websiteGeneration.status === 'generated'"
              class="btn primary"
              @click="convertToClient(selectedBusiness)"
            >
              <i class="fas fa-user-check"></i> Convert to Client
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Convert to Client Confirmation Modal -->
    <Teleport to="body">
      <div
        v-if="showConvertModal"
        class="modal"
        @click.self="closeConvertModal"
      >
        <div class="modal-content modal-sm">
          <div class="modal-header">
            <h2>Convert to Client</h2>
            <button
              class="close-btn"
              @click="closeConvertModal"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="modal-body">
            <p>Are you sure you want to convert <strong>{{ selectedBusiness?.name }}</strong> to a client?</p>
            <p>This will move the business to the Clients section and mark it as approved.</p>
          </div>

          <div class="modal-footer">
            <button
              class="btn secondary"
              @click="closeConvertModal"
            >Cancel</button>
            <button
              class="btn primary"
              @click="confirmConvertToClient"
            >
              <i class="fas fa-user-check"></i> Convert
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useBusinessStore } from "@/stores/business";
import { useToast } from "@/composables/useToast";
import KanbanView from "@/components/prospects/KanbanView.vue";

const router = useRouter();
const route = useRoute();
const businessStore = useBusinessStore();
const toast = useToast();
const viewMode = ref("list"); // 'list' or 'kanban'

// State
const loading = ref(true);
const searchQuery = ref("");
const cityFilter = ref("");
const statusFilter = ref("");
const showDetailsModal = ref(false);
const showConvertModal = ref(false);
const selectedBusiness = ref(null);

// Computed properties
const filteredBusinesses = computed(() => {
  // Only include businesses that are not clients (status is not 'client')
  // and have websiteGeneration data
  let businesses = businessStore.businesses.filter(
    (business) => business.status !== "client" && business.websiteGeneration
  );

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    businesses = businesses.filter(
      (business) =>
        business.name.toLowerCase().includes(query) ||
        (business.address.city &&
          business.address.city.toLowerCase().includes(query))
    );
  }

  // Apply city filter
  if (cityFilter.value) {
    businesses = businesses.filter(
      (business) => business.address.city === cityFilter.value
    );
  }

  // Apply status filter
  if (statusFilter.value) {
    businesses = businesses.filter(
      (business) => business.websiteGeneration.status === statusFilter.value
    );
  }

  return businesses;
});

const cities = computed(() => {
  const citySet = new Set<string>();

  businessStore.businesses.forEach((business) => {
    if (business.address && business.address.city) {
      citySet.add(business.address.city);
    }
  });

  return Array.from(citySet).sort();
});

const hasFilters = computed(() => {
  return searchQuery.value || cityFilter.value || statusFilter.value;
});

// Methods
const filterProspects = () => {
  // This function is just a placeholder for the input/select change events
  // The actual filtering is done by the computed property
};

const fetchBusinesses = async () => {
  try {
    loading.value = true;
    await businessStore.fetchBusinesses();
  } catch (error) {
    console.error("Failed to fetch businesses:", error);
    toast.error("Failed to fetch businesses");
  } finally {
    loading.value = false;
  }
};

const formatAddress = (address: any) => {
  if (!address) return "N/A";

  const parts = [];
  if (address.street) parts.push(address.street);
  if (address.city) parts.push(address.city);
  if (address.postalCode) parts.push(address.postalCode);
  if (address.country) parts.push(address.country);

  return parts.join(", ") || "N/A";
};

const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  } catch (error) {
    return dateString;
  }
};

const formatStatus = (status: string) => {
  switch (status) {
    case "generated":
      return "Generated";
    case "pending":
      return "Pending";
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
    case "not_generated":
      return "Not Generated";
    default:
      return status;
  }
};

const getStatusClass = (status: string) => {
  switch (status) {
    case "generated":
      return "success";
    case "pending":
      return "warning";
    case "approved":
      return "primary";
    case "rejected":
      return "danger";
    case "not_generated":
      return "secondary";
    default:
      return "secondary";
  }
};

const viewBusinessDetails = (business: any) => {
  selectedBusiness.value = business;
  showDetailsModal.value = true;
};

const closeDetailsModal = () => {
  showDetailsModal.value = false;
  selectedBusiness.value = null;
};

const convertToClient = (business: any) => {
  selectedBusiness.value = business;
  showConvertModal.value = true;
};

const closeConvertModal = () => {
  showConvertModal.value = false;
};

const confirmConvertToClient = async () => {
  if (!selectedBusiness.value) return;

  try {
    // Update business status to move it to Clients section
    await businessStore.updateBusiness(selectedBusiness.value._id, {
      status: "client",
      websiteGeneration: {
        ...selectedBusiness.value.websiteGeneration,
        status: "approved",
      },
    });

    toast.success(
      `${selectedBusiness.value.name} has been moved to Clients section.`
    );

    // Close modals
    closeConvertModal();
    closeDetailsModal();

    // Refresh businesses list
    await fetchBusinesses();
  } catch (error) {
    console.error("Failed to convert to client:", error);
    toast.error("Failed to convert to client: " + (error as Error).message);
  }
};

// Function to add a new prospect
const addProspect = (statusId: string) => {
  // This could open a modal to add a new prospect
  toast.info(`Add a new prospect with status: ${statusId}`);
  // In a real implementation, you would open a modal with a form
};

// Lifecycle hooks
onMounted(async () => {
  await fetchBusinesses();
});
</script>

<style scoped>
.prospects-list {
  width: 100%;
  padding: 20px;
}

.prospects-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.view-toggle {
  display: flex;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  overflow: hidden;
}

.view-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: white;
  color: #6b7280;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.view-btn:hover {
  background-color: #f3f4f6;
  color: #4b5563;
}

.view-btn.active {
  background-color: #4f46e5;
  color: white;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #e5e7eb;
  color: #374151;
  padding: 10px 16px;
  border-radius: 6px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.refresh-btn:hover {
  background-color: #d1d5db;
}

.kanban-view-container {
  height: calc(100vh - 180px);
  overflow: hidden;
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

.empty-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  border: none;
  transition: background-color 0.2s;
}

.action-btn.primary {
  background-color: #4f46e5;
  color: white;
}

.action-btn.primary:hover {
  background-color: #4338ca;
}

.action-btn.success {
  background-color: #10b981;
  color: white;
}

.action-btn.success:hover {
  background-color: #059669;
}

.action-btn.info {
  background-color: #3b82f6;
  color: white;
}

.action-btn.info:hover {
  background-color: #2563eb;
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

.data-table .business-name {
  font-weight: 500;
  color: #111827;
}

.preview-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #4338ca;
  text-decoration: none;
  font-weight: 500;
}

.preview-link:hover {
  text-decoration: underline;
}

.website-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #4338ca;
  text-decoration: none;
}

.website-link:hover {
  text-decoration: underline;
}

.no-preview,
.no-website {
  color: #9ca3af;
  font-style: italic;
}

.actions-cell {
  width: 1%;
  white-space: nowrap;
}

.table-actions {
  display: flex;
  gap: 8px;
}

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}

.status-badge.success {
  background-color: #d1fae5;
  color: #065f46;
}

.status-badge.warning {
  background-color: #fef3c7;
  color: #92400e;
}

.status-badge.danger {
  background-color: #fee2e2;
  color: #b91c1c;
}

.status-badge.primary {
  background-color: #e0e7ff;
  color: #4338ca;
}

.status-badge.secondary {
  background-color: #f3f4f6;
  color: #4b5563;
}

/* Modal Styles */
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
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.modal-content.modal-sm {
  max-width: 500px;
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

.preview-screenshot {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.preview-screenshot img {
  width: 100%;
  display: block;
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
  text-decoration: none;
  display: inline-block;
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
</style>
