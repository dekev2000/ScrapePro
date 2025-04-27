<template>
  <div class="data-explorer">
    <div class="explorer-header">
      <h1>Data Explorer</h1>
      <p class="subtitle">Explore and analyze your scraped data</p>
    </div>

    <div class="explorer-container">
      <div class="filters-panel">
        <h2>Filters</h2>

        <div class="filter-group">
          <label for="data-source">Data Source</label>
          <select
            id="data-source"
            v-model="filters.source"
          >
            <option value="">All Sources</option>
            <option value="google_maps">Google Maps</option>
            <option value="linkedin">LinkedIn</option>
            <option value="insee">INSEE</option>
            <option value="website">Website</option>
          </select>
        </div>

        <div class="filter-group">
          <label for="location">Location</label>
          <select
            id="location"
            v-model="filters.location"
          >
            <option value="">All Locations</option>
            <option
              v-for="location in locations"
              :key="location"
              :value="location"
            >
              {{ location }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label for="business-type">Business Type</label>
          <select
            id="business-type"
            v-model="filters.businessType"
          >
            <option value="">All Types</option>
            <option
              v-for="type in businessTypes"
              :key="type"
              :value="type"
            >
              {{ type }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label for="date-range">Date Range</label>
          <div class="date-inputs">
            <input
              type="date"
              id="date-from"
              v-model="filters.dateFrom"
              placeholder="From"
            />
            <input
              type="date"
              id="date-to"
              v-model="filters.dateTo"
              placeholder="To"
            />
          </div>
        </div>

        <div class="filter-group">
          <label>Has Contact Info</label>
          <div class="checkbox-group">
            <div class="checkbox-item">
              <input
                type="checkbox"
                id="has-phone"
                v-model="filters.hasPhone"
              />
              <label for="has-phone">Phone</label>
            </div>
            <div class="checkbox-item">
              <input
                type="checkbox"
                id="has-email"
                v-model="filters.hasEmail"
              />
              <label for="has-email">Email</label>
            </div>
            <div class="checkbox-item">
              <input
                type="checkbox"
                id="has-website"
                v-model="filters.hasWebsite"
              />
              <label for="has-website">Website</label>
            </div>
          </div>
        </div>

        <div class="filter-actions">
          <button
            class="btn primary"
            @click="applyFilters"
          >
            <i class="fas fa-filter"></i>
            Apply Filters
          </button>
          <button
            class="btn secondary"
            @click="resetFilters"
          >
            <i class="fas fa-undo"></i>
            Reset
          </button>
        </div>
      </div>

      <div class="data-panel">
        <div class="data-header">
          <div class="data-stats">
            <div class="stat">
              <span class="stat-value">{{ filteredData.length }}</span>
              <span class="stat-label">Results</span>
            </div>
            <div class="stat">
              <span class="stat-value">{{ uniqueLocations }}</span>
              <span class="stat-label">Locations</span>
            </div>
            <div class="stat">
              <span class="stat-value">{{ uniqueBusinessTypes }}</span>
              <span class="stat-label">Business Types</span>
            </div>
          </div>

          <div class="data-actions">
            <button
              class="btn secondary"
              @click="exportData('csv')"
            >
              <i class="fas fa-file-csv"></i>
              Export CSV
            </button>
            <button
              class="btn secondary"
              @click="exportData('excel')"
            >
              <i class="fas fa-file-excel"></i>
              Export Excel
            </button>
          </div>
        </div>

        <div class="data-view-options">
          <button
            :class="['view-option', { active: viewMode === 'table' }]"
            @click="viewMode = 'table'"
          >
            <i class="fas fa-table"></i>
            Table View
          </button>
          <button
            :class="['view-option', { active: viewMode === 'cards' }]"
            @click="viewMode = 'cards'"
          >
            <i class="fas fa-th-large"></i>
            Card View
          </button>
          <button
            :class="['view-option', { active: viewMode === 'map' }]"
            @click="viewMode = 'map'"
          >
            <i class="fas fa-map-marked-alt"></i>
            Map View
          </button>
        </div>

        <!-- Table View -->
        <div
          v-if="viewMode === 'table'"
          class="table-view"
        >
          <table class="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Location</th>
                <th>Contact</th>
                <th>Source</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in filteredData"
                :key="item.id"
              >
                <td>{{ item.name }}</td>
                <td>{{ item.businessType }}</td>
                <td>{{ item.location }}</td>
                <td>
                  <div class="contact-icons">
                    <i
                      v-if="item.contact.phone"
                      class="fas fa-phone"
                      title="Has phone"
                    ></i>
                    <i
                      v-if="item.contact.email"
                      class="fas fa-envelope"
                      title="Has email"
                    ></i>
                    <i
                      v-if="item.contact.website"
                      class="fas fa-globe"
                      title="Has website"
                    ></i>
                  </div>
                </td>
                <td>{{ formatSource(item.source) }}</td>
                <td>
                  <div class="table-actions">
                    <button
                      class="action-btn"
                      @click="viewDetails(item)"
                      title="View Details"
                    >
                      <i class="fas fa-info-circle"></i>
                    </button>
                    <button
                      class="action-btn"
                      @click="editItem(item)"
                      title="Edit"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Card View -->
        <div
          v-if="viewMode === 'cards'"
          class="card-view"
        >
          <div
            v-for="item in filteredData"
            :key="item.id"
            class="data-card"
          >
            <div class="card-header">
              <h3>{{ item.name }}</h3>
              <span class="source-badge">{{ formatSource(item.source) }}</span>
            </div>
            <div class="card-body">
              <div class="card-detail">
                <i class="fas fa-briefcase"></i>
                <span>{{ item.businessType }}</span>
              </div>
              <div class="card-detail">
                <i class="fas fa-map-marker-alt"></i>
                <span>{{ item.location }}</span>
              </div>
              <div
                class="card-detail"
                v-if="item.contact.phone"
              >
                <i class="fas fa-phone"></i>
                <span>{{ item.contact.phone }}</span>
              </div>
              <div
                class="card-detail"
                v-if="item.contact.email"
              >
                <i class="fas fa-envelope"></i>
                <span>{{ item.contact.email }}</span>
              </div>
              <div
                class="card-detail"
                v-if="item.contact.website"
              >
                <i class="fas fa-globe"></i>
                <a
                  :href="item.contact.website"
                  target="_blank"
                >{{ item.contact.website }}</a>
              </div>
            </div>
            <div class="card-actions">
              <button
                class="btn small"
                @click="viewDetails(item)"
              >
                <i class="fas fa-info-circle"></i>
                Details
              </button>
              <button
                class="btn small"
                @click="editItem(item)"
              >
                <i class="fas fa-edit"></i>
                Edit
              </button>
            </div>
          </div>
        </div>

        <!-- Map View -->
        <div
          v-if="viewMode === 'map'"
          class="map-view"
        >
          <div class="map-container">
            <div class="map-placeholder">
              <i class="fas fa-map-marked-alt"></i>
              <p>Map view would display here with markers for each business location</p>
              <p class="map-note">This is a placeholder for the actual map implementation</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue";

// Mock data
const mockData = [
  {
    id: "1",
    name: "Le Petit Bistro",
    businessType: "Restaurant",
    location: "Paris, France",
    contact: {
      phone: "+33 1 23 45 67 89",
      email: "contact@lepetitbistro.fr",
      website: "https://www.lepetitbistro.fr",
    },
    source: "google_maps",
    scrapedAt: "2023-06-15T11:30:00Z",
  },
  {
    id: "2",
    name: "Digital Marketing Pro",
    businessType: "Marketing Agency",
    location: "London, UK",
    contact: {
      phone: "+44 20 1234 5678",
      email: "info@digitalmarketingpro.co.uk",
      website: "https://www.digitalmarketingpro.co.uk",
    },
    source: "linkedin",
    scrapedAt: "2023-06-20T14:30:00Z",
  },
  {
    id: "3",
    name: "TechSolutions Lyon",
    businessType: "Software Development",
    location: "Lyon, France",
    contact: {
      phone: "+33 4 56 78 90 12",
      email: "contact@techsolutions-lyon.fr",
      website: "https://www.techsolutions-lyon.fr",
    },
    source: "insee",
    scrapedAt: "2023-06-22T09:30:00Z",
  },
  {
    id: "4",
    name: "Hôtel Azur",
    businessType: "Hotel",
    location: "Nice, France",
    contact: {
      phone: "+33 4 93 12 34 56",
      email: "reservations@hotel-azur.fr",
      website: "https://www.hotel-azur.fr",
    },
    source: "google_maps",
    scrapedAt: "2023-06-18T16:30:00Z",
  },
  {
    id: "5",
    name: "Café Lumière",
    businessType: "Café",
    location: "Paris, France",
    contact: {
      phone: "+33 1 87 65 43 21",
      email: "bonjour@cafelumiere.fr",
      website: "https://www.cafelumiere.fr",
    },
    source: "google_maps",
    scrapedAt: "2023-06-15T11:40:00Z",
  },
  {
    id: "6",
    name: "London Web Design",
    businessType: "Web Design",
    location: "London, UK",
    contact: {
      phone: "+44 20 9876 5432",
      email: "hello@londonwebdesign.co.uk",
      website: "https://www.londonwebdesign.co.uk",
    },
    source: "linkedin",
    scrapedAt: "2023-06-21T10:15:00Z",
  },
  {
    id: "7",
    name: "Boulangerie Artisanale",
    businessType: "Bakery",
    location: "Lyon, France",
    contact: {
      phone: "+33 4 32 10 98 76",
      email: null,
      website: null,
    },
    source: "google_maps",
    scrapedAt: "2023-06-19T08:45:00Z",
  },
  {
    id: "8",
    name: "Tech Innovations Ltd",
    businessType: "Technology",
    location: "Manchester, UK",
    contact: {
      phone: null,
      email: "info@techinnovations.co.uk",
      website: "https://www.techinnovations.co.uk",
    },
    source: "linkedin",
    scrapedAt: "2023-06-17T13:20:00Z",
  },
];

// Extract unique locations and business types
const locations = [...new Set(mockData.map((item) => item.location))];
const businessTypes = [...new Set(mockData.map((item) => item.businessType))];

// State
const viewMode = ref("table");
const filters = reactive({
  source: "",
  location: "",
  businessType: "",
  dateFrom: "",
  dateTo: "",
  hasPhone: false,
  hasEmail: false,
  hasWebsite: false,
});

// Computed properties
const filteredData = computed(() => {
  let result = [...mockData];

  // Apply source filter
  if (filters.source) {
    result = result.filter((item) => item.source === filters.source);
  }

  // Apply location filter
  if (filters.location) {
    result = result.filter((item) => item.location === filters.location);
  }

  // Apply business type filter
  if (filters.businessType) {
    result = result.filter(
      (item) => item.businessType === filters.businessType
    );
  }

  // Apply date range filter
  if (filters.dateFrom) {
    const fromDate = new Date(filters.dateFrom);
    result = result.filter((item) => new Date(item.scrapedAt) >= fromDate);
  }

  if (filters.dateTo) {
    const toDate = new Date(filters.dateTo);
    toDate.setHours(23, 59, 59, 999); // End of day
    result = result.filter((item) => new Date(item.scrapedAt) <= toDate);
  }

  // Apply contact info filters
  if (filters.hasPhone) {
    result = result.filter((item) => item.contact.phone);
  }

  if (filters.hasEmail) {
    result = result.filter((item) => item.contact.email);
  }

  if (filters.hasWebsite) {
    result = result.filter((item) => item.contact.website);
  }

  return result;
});

const uniqueLocations = computed(() => {
  return new Set(filteredData.value.map((item) => item.location)).size;
});

const uniqueBusinessTypes = computed(() => {
  return new Set(filteredData.value.map((item) => item.businessType)).size;
});

// Methods
const applyFilters = () => {
  // This function is just a placeholder for the button click
  // The actual filtering is done by the computed property
  console.log("Filters applied:", filters);
};

const resetFilters = () => {
  filters.source = "";
  filters.location = "";
  filters.businessType = "";
  filters.dateFrom = "";
  filters.dateTo = "";
  filters.hasPhone = false;
  filters.hasEmail = false;
  filters.hasWebsite = false;
};

const formatSource = (source: string) => {
  switch (source) {
    case "google_maps":
      return "Google Maps";
    case "linkedin":
      return "LinkedIn";
    case "insee":
      return "INSEE";
    case "website":
      return "Website";
    default:
      return source;
  }
};

const viewDetails = (item: any) => {
  console.log("View details for:", item.name);
  // In a real app, this would open a modal with details
  alert(`Details for ${item.name}`);
};

const editItem = (item: any) => {
  console.log("Edit item:", item.name);
  // In a real app, this would open a modal with a form
  alert(`Edit ${item.name}`);
};

const exportData = (format: "csv" | "excel") => {
  console.log(`Exporting data as ${format}`);
  // In a real app, this would generate and download a file
  alert(`Data exported as ${format.toUpperCase()}`);
};
</script>

<style scoped>
.data-explorer {
  width: 100%;
  padding: 20px;
}

.explorer-header {
  margin-bottom: 24px;
}

.explorer-header h1 {
  margin-bottom: 8px;
  font-size: 24px;
  font-weight: 600;
  color: #111827;
}

.subtitle {
  color: #6b7280;
  font-size: 16px;
}

.explorer-container {
  display: flex;
  gap: 24px;
}

.filters-panel {
  width: 300px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 16px;
}

.filters-panel h2 {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.filter-group {
  margin-bottom: 16px;
}

.filter-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #374151;
}

.filter-group select,
.filter-group input[type="date"] {
  width: 100%;
  padding: 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background-color: white;
  font-size: 14px;
}

.date-inputs {
  display: flex;
  gap: 8px;
}

.date-inputs input {
  flex: 1;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.checkbox-item input[type="checkbox"] {
  width: 16px;
  height: 16px;
}

.filter-actions {
  display: flex;
  gap: 8px;
  margin-top: 24px;
}

.btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
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

.btn.small {
  padding: 6px 12px;
  font-size: 12px;
}

.data-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.data-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 16px;
}

.data-stats {
  display: flex;
  gap: 24px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #111827;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
}

.data-actions {
  display: flex;
  gap: 8px;
}

.data-view-options {
  display: flex;
  gap: 8px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 8px;
}

.view-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 6px;
  background: none;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.view-option:hover {
  background-color: #f3f4f6;
}

.view-option.active {
  background-color: #e5e7eb;
  font-weight: 500;
}

.table-view {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
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
}

.contact-icons {
  display: flex;
  gap: 8px;
}

.contact-icons i {
  color: #4f46e5;
}

.table-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  background-color: #e5e7eb;
  color: #374151;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.action-btn:hover {
  background-color: #d1d5db;
}

.card-view {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.data-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.source-badge {
  padding: 4px 8px;
  border-radius: 4px;
  background-color: #e5e7eb;
  color: #374151;
  font-size: 12px;
  font-weight: 500;
}

.card-body {
  padding: 16px;
}

.card-detail {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.card-detail i {
  width: 16px;
  color: #6b7280;
}

.card-detail a {
  color: #4f46e5;
  text-decoration: none;
}

.card-detail a:hover {
  text-decoration: underline;
}

.card-actions {
  display: flex;
  gap: 8px;
  padding: 16px;
  border-top: 1px solid #e5e7eb;
}

.map-view {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.map-container {
  height: 500px;
  background-color: #f9fafb;
}

.map-placeholder {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
}

.map-placeholder i {
  font-size: 48px;
  margin-bottom: 16px;
}

.map-note {
  font-style: italic;
  font-size: 14px;
}

/* Responsive */
@media (max-width: 768px) {
  .explorer-container {
    flex-direction: column;
  }

  .filters-panel {
    width: 100%;
  }
}
</style>