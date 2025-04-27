<template>
  <div class="kanban-view">
    <div class="kanban-header">
      <h2>Prospect Pipeline</h2>
      <div class="kanban-actions">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search prospects..."
          />
        </div>
        <button
          class="refresh-btn"
          @click="fetchBusinesses"
          :disabled="loading"
        >
          <i :class="loading ? 'fas fa-spinner fa-spin' : 'fas fa-sync'"></i>
          {{ loading ? 'Loading...' : 'Refresh' }}
        </button>
      </div>
    </div>

    <div
      v-if="loading && !hasProspects"
      class="loading-state"
    >
      <i class="fas fa-spinner fa-spin"></i>
      <p>Loading prospects...</p>
    </div>

    <div
      v-else-if="!hasProspects"
      class="empty-state"
    >
      <i class="fas fa-clipboard-list"></i>
      <h3>No prospects found</h3>
      <p>Start by adding prospects or running a scraping job.</p>
      <div class="empty-actions">
        <button
          class="action-btn"
          @click="$emit('add-prospect')"
        >
          <i class="fas fa-plus"></i> Add Prospect
        </button>
        <router-link
          to="/dashboard/scrapes"
          class="action-btn primary"
        >
          <i class="fas fa-search"></i> Run Scraping Job
        </router-link>
      </div>
    </div>

    <div
      v-else
      class="kanban-board"
      ref="kanbanBoard"
    >
      <div class="kanban-columns">
        <StatusColumn
          v-for="status in prospectStatuses"
          :key="status.id"
          :status="status"
          :prospects="getProspectsByStatus(status.id)"
          @prospect-click="onProspectClick"
          @prospect-edit="onProspectEdit"
          @prospect-more="onProspectMore"
          @add-prospect="onAddProspect"
          @drop="onProspectDrop"
        />
      </div>
    </div>

    <!-- Prospect Details Modal -->
    <Teleport to="body">
      <div
        v-if="showDetailsModal"
        class="modal"
        @click.self="closeDetailsModal"
      >
        <div class="modal-content">
          <div class="modal-header">
            <h2>Prospect Details</h2>
            <button
              class="close-btn"
              @click="closeDetailsModal"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div
            v-if="selectedProspect"
            class="modal-body"
          >
            <div class="detail-section">
              <h3>Basic Information</h3>
              <div class="detail-row">
                <div class="detail-label">Name:</div>
                <div>{{ selectedProspect.name }}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Status:</div>
                <div>
                  <select
                    v-model="selectedProspect.prospectStatus"
                    class="status-select"
                    @change="updateProspectStatus"
                  >
                    <option
                      v-for="status in prospectStatuses"
                      :key="status.id"
                      :value="status.id"
                    >
                      {{ status.name }}
                    </option>
                  </select>
                </div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Address:</div>
                <div>{{ formatAddress(selectedProspect.address) }}</div>
              </div>
            </div>

            <div class="detail-section">
              <h3>Contact Information</h3>
              <div class="detail-row">
                <div class="detail-label">Phone:</div>
                <div>{{ selectedProspect.contact?.phone || 'N/A' }}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Email:</div>
                <div>{{ selectedProspect.contact?.email || 'N/A' }}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Website:</div>
                <div>
                  <a
                    v-if="selectedProspect.contact?.website"
                    :href="selectedProspect.contact.website"
                    target="_blank"
                  >{{ selectedProspect.contact.website }}</a>
                  <span v-else>N/A</span>
                </div>
              </div>
            </div>

            <div
              v-if="selectedProspect.websiteGeneration && selectedProspect.websiteGeneration.previewLink"
              class="detail-section"
            >
              <h3>Website Preview</h3>
              <div class="detail-row">
                <div class="detail-label">Preview URL:</div>
                <div>
                  <a
                    :href="selectedProspect.websiteGeneration.previewLink"
                    target="_blank"
                  >{{ selectedProspect.websiteGeneration.previewLink }}</a>
                </div>
              </div>
              <div
                v-if="selectedProspect.websiteGeneration.previewScreenshot"
                class="preview-screenshot"
              >
                <img
                  :src="selectedProspect.websiteGeneration.previewScreenshot"
                  alt="Website Preview"
                />
              </div>
            </div>

            <div class="detail-section">
              <h3>Business Details</h3>
              <div class="detail-row">
                <div class="detail-label">Type:</div>
                <div>{{ selectedProspect.business?.type || 'N/A' }}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">SIRET:</div>
                <div>{{ selectedProspect.business?.siret || 'N/A' }}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">SIREN:</div>
                <div>{{ selectedProspect.business?.siren || 'N/A' }}</div>
              </div>
            </div>

            <div class="detail-section">
              <h3>Notes</h3>
              <div class="notes-editor">
                <textarea
                  v-model="prospectNotes"
                  placeholder="Add notes about this prospect..."
                  rows="4"
                ></textarea>
                <button
                  class="save-notes-btn"
                  @click="saveNotes"
                >
                  <i class="fas fa-save"></i> Save Notes
                </button>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button
              class="btn secondary"
              @click="closeDetailsModal"
            >Close</button>
            <button
              v-if="selectedProspect && canConvertToClient"
              class="btn primary"
              @click="convertToClient"
            >
              <i class="fas fa-user-check"></i> Convert to Client
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- We've replaced the global context menu with inline menus in each card -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useBusinessStore } from "@/stores/business";
import { useToast } from "@/composables/useToast";
import StatusColumn from "./StatusColumn.vue";
import prospectStatuses from "@/data/prospectStatuses";

const businessStore = useBusinessStore();
const toast = useToast();

// State
const loading = ref(false);
const searchQuery = ref("");
const showDetailsModal = ref(false);
const selectedProspect = ref<any>(null);
const prospectNotes = ref("");
// We no longer need these variables as we're using inline menus in each card
const kanbanBoard = ref<HTMLElement | null>(null);

// Computed properties
const hasProspects = computed(() => {
  return filteredProspects.value.length > 0;
});

const filteredProspects = computed(() => {
  // Only include businesses that are not clients
  let prospects = businessStore.businesses.filter(
    (business) => business.status !== "client"
  );

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    prospects = prospects.filter(
      (prospect) =>
        prospect.name.toLowerCase().includes(query) ||
        (prospect.address.city &&
          prospect.address.city.toLowerCase().includes(query)) ||
        (prospect.business?.type &&
          prospect.business.type.toLowerCase().includes(query))
    );
  }

  return prospects;
});

const canConvertToClient = computed(() => {
  if (!selectedProspect.value) return false;

  return (
    selectedProspect.value.websiteGeneration &&
    selectedProspect.value.websiteGeneration.status === "generated"
  );
});

// We no longer need this computed property as we're using inline menus in each card

// Methods
const getProspectsByStatus = (statusId: string) => {
  return filteredProspects.value.filter(
    (prospect) => prospect.prospectStatus === statusId
  );
};

const fetchBusinesses = async () => {
  try {
    loading.value = true;
    await businessStore.fetchBusinesses();

    // Initialize prospect status for businesses that don't have it
    businessStore.businesses.forEach((business) => {
      if (!business.prospectStatus) {
        // Set default status based on website generation status
        if (
          business.websiteGeneration &&
          business.websiteGeneration.status === "generated"
        ) {
          business.prospectStatus = "site_generated";
        } else {
          business.prospectStatus = "new";
        }

        // Update the business in the store
        businessStore.updateBusiness(business._id, {
          prospectStatus: business.prospectStatus,
        });
      }
    });

    toast.success("Prospects loaded successfully");
  } catch (error) {
    console.error("Failed to fetch businesses:", error);
    toast.error("Failed to load prospects");
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

const onProspectClick = (prospect: any) => {
  selectedProspect.value = { ...prospect };
  prospectNotes.value = prospect.notes || "";
  showDetailsModal.value = true;
};

const onProspectEdit = (prospect: any) => {
  // Emit event to parent component to handle editing
  // This could open a form in a modal or navigate to an edit page
  console.log("Edit prospect:", prospect);
};

// We no longer need this method as we're using inline menus in each card
const onProspectMore = () => {
  // This method is kept for backward compatibility but is no longer used
};

const onAddProspect = (statusId: string) => {
  // Emit event to parent component to handle adding a new prospect
  console.log("Add prospect with status:", statusId);
};

const onProspectDrop = async (prospect: any, newStatusId: string) => {
  try {
    // Update prospect status
    await businessStore.updateBusiness(prospect._id, {
      prospectStatus: newStatusId,
    });

    toast.success(`Moved ${prospect.name} to ${getStatusName(newStatusId)}`);
  } catch (error) {
    console.error("Failed to update prospect status:", error);
    toast.error("Failed to update prospect status");
  }
};

const getStatusName = (statusId: string) => {
  const status = prospectStatuses.find((s) => s.id === statusId);
  return status ? status.name : "Unknown";
};

const updateProspectStatus = async () => {
  if (!selectedProspect.value) return;

  try {
    await businessStore.updateBusiness(selectedProspect.value._id, {
      prospectStatus: selectedProspect.value.prospectStatus,
    });

    toast.success(
      `Updated status to ${getStatusName(
        selectedProspect.value.prospectStatus
      )}`
    );
  } catch (error) {
    console.error("Failed to update prospect status:", error);
    toast.error("Failed to update prospect status");
  }
};

const saveNotes = async () => {
  if (!selectedProspect.value) return;

  try {
    await businessStore.updateBusiness(selectedProspect.value._id, {
      notes: prospectNotes.value,
    });

    toast.success("Notes saved successfully");
  } catch (error) {
    console.error("Failed to save notes:", error);
    toast.error("Failed to save notes");
  }
};

const convertToClient = async () => {
  if (!selectedProspect.value) return;

  try {
    await businessStore.updateBusiness(selectedProspect.value._id, {
      status: "client",
      websiteGeneration: {
        ...selectedProspect.value.websiteGeneration,
        status: "approved",
      },
    });

    toast.success(
      `${selectedProspect.value.name} has been converted to a client`
    );
    closeDetailsModal();

    // Refresh businesses list
    await fetchBusinesses();
  } catch (error) {
    console.error("Failed to convert to client:", error);
    toast.error("Failed to convert to client");
  }
};

const closeDetailsModal = () => {
  showDetailsModal.value = false;
  selectedProspect.value = null;
  prospectNotes.value = "";
};

// New methods for direct actions from the card menu
const onProspectEmail = (prospect: any) => {
  // Implement email form functionality
  console.log("Show email form for:", prospect);
};

const onProspectConvert = async (prospect: any) => {
  try {
    await businessStore.updateBusiness(prospect._id, {
      status: "client",
      websiteGeneration: {
        ...prospect.websiteGeneration,
        status: "approved",
      },
    });

    toast.success(`${prospect.name} has been converted to a client`);

    // Refresh businesses list
    await fetchBusinesses();
  } catch (error) {
    console.error("Failed to convert to client:", error);
    toast.error("Failed to convert to client");
  }
};

const onProspectDelete = async (prospect: any) => {
  if (confirm(`Are you sure you want to delete ${prospect.name}?`)) {
    try {
      await businessStore.deleteBusiness(prospect._id);
      toast.success(`${prospect.name} has been deleted`);

      // Refresh businesses list
      await fetchBusinesses();
    } catch (error) {
      console.error("Failed to delete prospect:", error);
      toast.error("Failed to delete prospect");
    }
  }
};

// Lifecycle hooks
onMounted(async () => {
  await fetchBusinesses();
});
</script>

<style scoped>
.kanban-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.kanban-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.kanban-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #1f2937;
}

.kanban-actions {
  display: flex;
  gap: 16px;
}

.search-box {
  position: relative;
  width: 300px;
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

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background-color: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  color: #4b5563;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.refresh-btn:hover:not(:disabled) {
  background-color: #e5e7eb;
}

.refresh-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-state,
.empty-state {
  flex: 1;
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
  padding: 10px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  border: 1px solid #d1d5db;
  background-color: white;
  color: #4b5563;
  transition: all 0.2s;
}

.action-btn:hover {
  background-color: #f3f4f6;
}

.action-btn.primary {
  background-color: #4f46e5;
  color: white;
  border-color: #4f46e5;
}

.action-btn.primary:hover {
  background-color: #4338ca;
}

.kanban-board {
  flex: 1;
  overflow-x: auto;
  padding: 20px;
  /* Allow menus to overflow */
  overflow-y: visible;
}

.kanban-columns {
  display: flex;
  height: 100%;
  min-height: 500px;
  /* Allow menus to overflow */
  overflow: visible;
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

.status-select {
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background-color: white;
  color: #1f2937;
  font-size: 14px;
}

.preview-screenshot {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 12px;
}

.preview-screenshot img {
  width: 100%;
  display: block;
}

.notes-editor {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.notes-editor textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 14px;
  resize: vertical;
}

.save-notes-btn {
  align-self: flex-end;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: #10b981;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.save-notes-btn:hover {
  background-color: #059669;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px;
  border-top: 1px solid #e5e7eb;
}

.btn {
  padding: 10px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn.primary {
  background-color: #4f46e5;
  color: white;
}

.btn.primary:hover {
  background-color: #4338ca;
}

.btn.secondary {
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #d1d5db;
}

.btn.secondary:hover {
  background-color: #e5e7eb;
}

/* Context Menu */
.context-menu {
  position: fixed;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1001;
  min-width: 200px;
  max-width: 250px;
  overflow: hidden;
  max-height: calc(100vh - 20px);
}

.context-menu-item {
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.2s;
  color: #1f2937;
}

.context-menu-item:hover {
  background-color: #f3f4f6;
}

.context-menu-item i {
  width: 16px;
  color: #6b7280;
}

.context-menu-item.danger {
  color: #ef4444;
}

.context-menu-item.danger i {
  color: #ef4444;
}

.context-menu-item.danger:hover {
  background-color: #fee2e2;
}

.context-menu-divider {
  height: 1px;
  background-color: #e5e7eb;
  margin: 4px 0;
}
</style>
