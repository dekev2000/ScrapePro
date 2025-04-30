<template>
  <div class="clients-list">
    <div class="clients-header">
      <h1>Clients</h1>
      <div class="header-actions">
        <button
          class="refresh-btn"
          @click="fetchBusinesses"
        >
          <i class="fas fa-sync"></i>
          Refresh
        </button>
        <button
          class="add-btn"
          @click="showAddClientModal = true"
        >
          <i class="fas fa-plus"></i>
          Add Client
        </button>
      </div>
    </div>

    <div class="filters">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search clients..."
          @input="filterClients"
        />
      </div>

      <div class="filter-group">
        <label for="cityFilter">City:</label>
        <select
          id="cityFilter"
          v-model="cityFilter"
          @change="filterClients"
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
          @change="filterClients"
        >
          <option value="">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    </div>

    <div
      v-if="loading"
      class="loading-state"
    >
      <i class="fas fa-spinner fa-spin"></i>
      <p>Loading clients...</p>
    </div>

    <div
      v-else-if="filteredBusinesses.length === 0"
      class="empty-state"
    >
      <i class="fas fa-users"></i>
      <h3>No clients found</h3>
      <p v-if="hasFilters">Try adjusting your filters or search query.</p>
      <p v-else>Start by adding a client or running a scraping job.</p>
      <div class="empty-actions">
        <router-link
          to="/dashboard/scrapes"
          class="action-btn"
        >
          <i class="fas fa-search"></i>
          Run Scraping Job
        </router-link>
        <button
          class="action-btn primary"
          @click="showAddClientModal = true"
        >
          <i class="fas fa-plus"></i>
          Add Client Manually
        </button>
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
              <span :class="['status-badge', business.active ? 'active' : 'inactive']">
                {{ business.active ? 'Active' : 'Inactive' }}
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
                {{ formatWebsite(business.contact.website) }}
              </a>
              <span v-else>N/A</span>
            </td>
            <td>
              <a
                v-if="business.websiteGeneration && business.websiteGeneration.status === 'generated' && business.websiteGeneration.previewUrl"
                :href="business.websiteGeneration.previewUrl"
                target="_blank"
                class="preview-link"
              >
                <i class="fas fa-external-link-alt"></i>
                View
              </a>
              <span
                v-else
                class="no-preview"
              >No preview</span>
            </td>
            <td class="actions-cell">
              <div class="table-actions">
                <button
                  class="action-btn details-btn"
                  @click="viewClientDetails(business)"
                  title="Details"
                >
                  <i class="fas fa-info-circle"></i>
                </button>

                <button
                  class="action-btn edit-btn"
                  @click="editClient(business)"
                  title="Edit"
                >
                  <i class="fas fa-edit"></i>
                </button>

                <button
                  v-if="!business.websiteGeneration || business.websiteGeneration.status !== 'generated'"
                  class="action-btn generate-btn"
                  @click="generatePreview(business)"
                  title="Generate Preview"
                >
                  <i class="fas fa-magic"></i>
                </button>

                <button
                  v-if="business.contact && business.contact.email"
                  class="action-btn email-btn"
                  @click="sendEmail(business)"
                  title="Send Email"
                >
                  <i class="fas fa-paper-plane"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useBusinessStore } from "@/stores/business";
import { useToast } from "@/composables/useToast";

const router = useRouter();
const route = useRoute();
const businessStore = useBusinessStore();
const toast = useToast();

// State
const loading = ref(true);
const searchQuery = ref("");
const cityFilter = ref("");
const statusFilter = ref("");
const showAddClientModal = ref(false);

// Computed properties
const filteredBusinesses = computed(() => {
  // Only include businesses with status 'client'
  let businesses = businessStore.businesses.filter(
    (business) => business.status === "client"
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
      (business) => business.active === (statusFilter.value === "active")
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
const filterClients = () => {
  // This function is just a placeholder for the input/select change events
  // The actual filtering is done by the computed property
};

const fetchBusinesses = async () => {
  try {
    loading.value = true;
    await businessStore.fetchBusinesses();
  } catch (error) {
    console.error("Failed to fetch businesses:", error);
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

  return parts.join(", ");
};

const formatWebsite = (website: string) => {
  if (!website) return "N/A";
  return website.replace(/^https?:\/\/(www\.)?/, "");
};

const viewClientDetails = (business: any) => {
  // Open a modal with client details
  toast.info(`Viewing details for ${business.name}`);
  // In a real implementation, this would open a modal with client details
};

const editClient = (business: any) => {
  // Open a modal to edit client information
  toast.info(`Editing client ${business.name}`);
  // In a real implementation, this would open a modal with a form to edit client information
};

const generatePreview = async (business: any) => {
  try {
    toast.info(`Generating preview for ${business.name}...`);
    // In a real implementation, this would call the API to generate a preview
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
    toast.success(`Preview generated for ${business.name}`);

    // Update the business in the store
    await businessStore.updateBusiness(business._id, {
      websiteGeneration: {
        status: "generated",
        previewUrl: `https://example.com/${business._id}`,
        generatedAt: new Date().toISOString(),
      },
    });

    // Refresh the businesses list
    await fetchBusinesses();
  } catch (error) {
    console.error("Failed to generate preview:", error);
    toast.error(`Failed to generate preview: ${(error as Error).message}`);
  }
};

const sendEmail = (business: any) => {
  // Open a modal to send an email to the client
  toast.info(`Sending email to ${business.name}`);
  // In a real implementation, this would open a modal with an email form
};

// Lifecycle hooks
onMounted(async () => {
  await fetchBusinesses();

  // Check for query params
  if (route.query.scrapeJob) {
    // In a real app, we would filter businesses by scrape job
    console.log(
      `Showing businesses from scraping job: ${route.query.scrapeJob}`
    );
  }
});
</script>

<style scoped>
.clients-list {
  width: 100%;
  padding: 20px;
}

.clients-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.refresh-btn,
.add-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 6px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.refresh-btn {
  background-color: #e5e7eb;
  color: #374151;
}

.refresh-btn:hover {
  background-color: #d1d5db;
}

.add-btn {
  background-color: #4338ca;
  color: white;
}

.add-btn:hover {
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

.empty-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 6px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  text-decoration: none;
  background-color: #e5e7eb;
  color: #374151;
}

.action-btn:hover {
  background-color: #d1d5db;
}

.action-btn.primary {
  background-color: #4338ca;
  color: white;
}

.action-btn.primary:hover {
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

.data-table .business-name {
  font-weight: 500;
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

.status-badge.active {
  background-color: #d1fae5;
  color: #065f46;
}

.status-badge.inactive {
  background-color: #f3f4f6;
  color: #6b7280;
}

.website-link {
  color: #4338ca;
  text-decoration: none;
  font-weight: 500;
}

.website-link:hover {
  text-decoration: underline;
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

.no-preview {
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
</style>