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
          <label id="contact-info-label">Informations de contact</label>
          <div
            class="checkbox-group"
            aria-labelledby="contact-info-label"
          >
            <div class="checkbox-item">
              <input
                type="checkbox"
                id="has-phone"
                v-model="filters.hasPhone"
              />
              <label for="has-phone">A un téléphone</label>
            </div>
            <div class="checkbox-item">
              <input
                type="checkbox"
                id="has-email"
                v-model="filters.hasEmail"
              />
              <label for="has-email">A un email</label>
            </div>
            <div class="checkbox-item">
              <input
                type="checkbox"
                id="has-website"
                v-model="filters.hasWebsite"
              />
              <label for="has-website">A un site web</label>
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
              :disabled="isExporting"
            >
              <i :class="isExporting ? 'fas fa-spinner fa-spin' : 'fas fa-file-csv'"></i>
              {{ isExporting ? 'Exportation...' : 'Export CSV' }}
            </button>
            <button
              class="btn secondary"
              @click="exportData('excel')"
              :disabled="isExporting"
            >
              <i :class="isExporting ? 'fas fa-spinner fa-spin' : 'fas fa-file-excel'"></i>
              {{ isExporting ? 'Exportation...' : 'Export Excel' }}
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

    <!-- Details Modal -->
    <div
      v-if="showDetailsModal"
      class="modal-overlay"
      @click.self="closeDetailsModal"
    >
      <div class="modal-container">
        <div class="modal-header">
          <h3>{{ currentItem?.name }}</h3>
          <button
            class="close-btn"
            @click="closeDetailsModal"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div
          class="modal-body"
          v-if="currentItem"
        >
          <div class="detail-section">
            <h4>Informations générales</h4>
            <div class="detail-row">
              <div class="detail-label">Type d'entreprise</div>
              <div class="detail-value">{{ currentItem.businessType }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Localisation</div>
              <div class="detail-value">{{ currentItem.location }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Source</div>
              <div class="detail-value">{{ formatSource(currentItem.source) }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Date de scraping</div>
              <div class="detail-value">{{ new Date(currentItem.scrapedAt).toLocaleString() }}</div>
            </div>
          </div>

          <div class="detail-section">
            <h4>Coordonnées</h4>
            <div
              class="detail-row"
              v-if="currentItem.contact.phone"
            >
              <div class="detail-label">Téléphone</div>
              <div class="detail-value">
                <a :href="`tel:${currentItem.contact.phone}`">{{ currentItem.contact.phone }}</a>
              </div>
            </div>
            <div
              class="detail-row"
              v-if="currentItem.contact.email"
            >
              <div class="detail-label">Email</div>
              <div class="detail-value">
                <a :href="`mailto:${currentItem.contact.email}`">{{ currentItem.contact.email }}</a>
              </div>
            </div>
            <div
              class="detail-row"
              v-if="currentItem.contact.website"
            >
              <div class="detail-label">Site web</div>
              <div class="detail-value">
                <a
                  :href="currentItem.contact.website"
                  target="_blank"
                >{{ currentItem.contact.website }}</a>
              </div>
            </div>
            <div
              class="detail-row"
              v-if="!currentItem.contact.phone && !currentItem.contact.email && !currentItem.contact.website"
            >
              <div class="detail-value empty">Aucune coordonnée disponible</div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button
            class="btn secondary"
            @click="closeDetailsModal"
          >Fermer</button>
          <button
            class="btn primary"
            @click="editItem(currentItem)"
          >Modifier</button>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div
      v-if="showEditModal"
      class="modal-overlay"
      @click.self="closeEditModal"
    >
      <div class="modal-container">
        <div class="modal-header">
          <h3>Modifier {{ currentItem?.name }}</h3>
          <button
            class="close-btn"
            @click="closeEditModal"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div
          class="modal-body"
          v-if="currentItem"
        >
          <div class="form-group">
            <label for="edit-name">Nom</label>
            <input
              type="text"
              id="edit-name"
              v-model="currentItem.name"
            />
          </div>
          <div class="form-group">
            <label for="edit-business-type">Type d'entreprise</label>
            <input
              type="text"
              id="edit-business-type"
              v-model="currentItem.businessType"
            />
          </div>
          <div class="form-group">
            <label for="edit-location">Localisation</label>
            <input
              type="text"
              id="edit-location"
              v-model="currentItem.location"
            />
          </div>
          <div class="form-group">
            <label for="edit-phone">Téléphone</label>
            <input
              type="text"
              id="edit-phone"
              v-model="currentItem.contact.phone"
            />
          </div>
          <div class="form-group">
            <label for="edit-email">Email</label>
            <input
              type="email"
              id="edit-email"
              v-model="currentItem.contact.email"
            />
          </div>
          <div class="form-group">
            <label for="edit-website">Site web</label>
            <input
              type="url"
              id="edit-website"
              v-model="currentItem.contact.website"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button
            class="btn secondary"
            @click="closeEditModal"
          >Annuler</button>
          <button
            class="btn primary"
            @click="saveEditedItem"
          >Enregistrer</button>
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

// State for modals
const showDetailsModal = ref(false);
const showEditModal = ref(false);
const currentItem = ref<any>(null);
const isExporting = ref(false);

// Helper function to show toast notifications
const showToast = (
  type: "filter" | "reset" | "save" | "export",
  message: string
) => {
  // Create toast element
  const toast = document.createElement("div");
  toast.className =
    type === "save" || type === "export"
      ? "data-explorer-toast success"
      : "data-explorer-toast";

  // Set icon based on type
  let icon = "fa-info-circle";
  if (type === "filter") icon = "fa-filter";
  if (type === "reset") icon = "fa-undo";
  if (type === "save") icon = "fa-check";
  if (type === "export") icon = "fa-file-download";

  // Set content
  toast.innerHTML = `
    <div class="toast-icon"><i class="fas ${icon}"></i></div>
    <div class="toast-message">${message}</div>
  `;

  // Add to DOM
  document.body.appendChild(toast);

  // Show toast
  setTimeout(() => {
    toast.classList.add("show");
  }, 100);

  // Hide toast after delay
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3100);

  // Remove from DOM after animation
  setTimeout(() => {
    document.body.removeChild(toast);
  }, 3400);
};

// Methods
const applyFilters = () => {
  // This function is now more interactive
  console.log("Filters applied:", filters);

  // Show a toast notification
  const message =
    filteredData.value.length > 0
      ? `Filtres appliqués : ${filteredData.value.length} résultats trouvés`
      : `Aucun résultat ne correspond à vos critères`;

  showToast("filter", message);
};

const resetFilters = () => {
  // Reset all filters
  filters.source = "";
  filters.location = "";
  filters.businessType = "";
  filters.dateFrom = "";
  filters.dateTo = "";
  filters.hasPhone = false;
  filters.hasEmail = false;
  filters.hasWebsite = false;

  // Show a toast notification
  showToast("reset", "Filtres réinitialisés");
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
  currentItem.value = item;
  showDetailsModal.value = true;
};

const closeDetailsModal = () => {
  showDetailsModal.value = false;
  setTimeout(() => {
    currentItem.value = null;
  }, 300);
};

const editItem = (item: any) => {
  console.log("Edit item:", item.name);
  currentItem.value = { ...item }; // Clone to avoid direct mutation
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
  setTimeout(() => {
    currentItem.value = null;
  }, 300);
};

const saveEditedItem = () => {
  if (!currentItem.value) return;

  // Find the item in the mockData array
  const index = mockData.findIndex((item) => item.id === currentItem.value.id);
  if (index !== -1) {
    // Update the item
    mockData[index] = { ...currentItem.value };

    // Show a success toast
    showToast("save", "Modifications enregistrées");

    // Close the modal
    closeEditModal();
  }
};

const exportData = (format: "csv" | "excel") => {
  console.log(`Exporting data as ${format}`);
  isExporting.value = true;

  // Simulate export process
  setTimeout(() => {
    // Create a CSV or Excel content
    let content = "";

    if (format === "csv") {
      // CSV header
      content =
        "Name,Business Type,Location,Phone,Email,Website,Source,Scraped At\n";

      // CSV rows
      filteredData.value.forEach((item) => {
        content += `"${item.name}","${item.businessType}","${item.location}","${
          item.contact.phone || ""
        }","${item.contact.email || ""}","${item.contact.website || ""}","${
          item.source
        }","${item.scrapedAt}"\n`;
      });

      // Create a Blob and download link
      const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `data-export-${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === "excel") {
      // For Excel, we'd normally use a library like SheetJS/xlsx
      // But for this demo, we'll just create a CSV with a different extension
      content =
        "Name\tBusiness Type\tLocation\tPhone\tEmail\tWebsite\tSource\tScraped At\n";

      // Excel rows (tab-separated)
      filteredData.value.forEach((item) => {
        content += `${item.name}\t${item.businessType}\t${item.location}\t${
          item.contact.phone || ""
        }\t${item.contact.email || ""}\t${item.contact.website || ""}\t${
          item.source
        }\t${item.scrapedAt}\n`;
      });

      // Create a Blob and download link
      const blob = new Blob([content], { type: "application/vnd.ms-excel" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `data-export-${new Date().toISOString().split("T")[0]}.xls`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    isExporting.value = false;

    // Show a success toast
    showToast("export", `Données exportées au format ${format.toUpperCase()}`);
  }, 1000); // Simulate a delay for the export process
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

/* Modal Styles */
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
  animation: fadeIn 0.3s ease;
}

.modal-container {
  background-color: white;
  border-radius: 8px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  animation: slideIn 0.3s ease;
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

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  color: #6b7280;
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

/* Detail Styles */
.detail-section {
  margin-bottom: 24px;
}

.detail-section h4 {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 8px;
}

.detail-row {
  display: flex;
  margin-bottom: 12px;
}

.detail-label {
  width: 150px;
  font-weight: 500;
  color: #6b7280;
}

.detail-value {
  flex: 1;
  color: #111827;
}

.detail-value a {
  color: #4f46e5;
  text-decoration: none;
}

.detail-value a:hover {
  text-decoration: underline;
}

.detail-value.empty {
  color: #9ca3af;
  font-style: italic;
}

/* Form Styles for Edit Modal */
.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #374151;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

/* Toast Notifications */
.data-explorer-toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  transform: translateY(100px);
  opacity: 0;
  transition: transform 0.3s ease, opacity 0.3s ease;
  z-index: 1100;
}

.data-explorer-toast.show {
  transform: translateY(0);
  opacity: 1;
}

.data-explorer-toast.success {
  border-left: 4px solid #10b981;
}

.data-explorer-toast.success .toast-icon {
  color: #10b981;
}

.toast-icon {
  font-size: 18px;
  color: #4f46e5;
}

.toast-message {
  font-size: 14px;
  color: #374151;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    transform: translateY(-50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .explorer-container {
    flex-direction: column;
  }

  .filters-panel {
    width: 100%;
  }

  .modal-container {
    width: 90%;
    max-height: 80vh;
  }

  .detail-row {
    flex-direction: column;
  }

  .detail-label {
    width: 100%;
    margin-bottom: 4px;
  }
}
</style>