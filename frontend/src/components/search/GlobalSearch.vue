<template>
  <div class="global-search">
    <!-- Search Icon Button -->
    <button
      class="search-icon"
      @click="toggleSearch"
    >
      <i class="fas fa-search"></i>
    </button>

    <!-- Search Modal -->
    <transition name="fade">
      <div
        v-if="showSearch"
        class="search-modal"
      >
        <div
          class="search-overlay"
          @click="closeSearch"
        ></div>
        <div class="search-container">
          <div class="search-header">
            <div class="search-input-container">
              <i class="fas fa-search"></i>
              <input
                type="text"
                v-model="searchQuery"
                placeholder="Search for anything..."
                ref="searchInput"
                @keyup.enter="performSearch"
                @keyup.esc="closeSearch"
              />
              <button
                v-if="searchQuery"
                class="clear-button"
                @click="clearSearch"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
            <button
              class="close-button"
              @click="closeSearch"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="search-body">
            <!-- Loading State -->
            <div
              v-if="isLoading"
              class="search-loading"
            >
              <div
                v-for="i in 5"
                :key="i"
                class="skeleton-item"
              >
                <div class="skeleton-icon"></div>
                <div class="skeleton-content">
                  <div class="skeleton-title"></div>
                  <div class="skeleton-description"></div>
                </div>
              </div>
            </div>

            <!-- No Results State -->
            <div
              v-else-if="searchPerformed && results.length === 0"
              class="no-results"
            >
              <i class="fas fa-search"></i>
              <p>No results found for "{{ searchQuery }}"</p>
              <p class="suggestion">Try different keywords or check your spelling</p>
            </div>

            <!-- Results State -->
            <div
              v-else-if="results.length > 0"
              class="search-results"
            >
              <div
                class="results-section"
                v-if="scrapeResults.length > 0"
              >
                <h3 class="section-title">
                  <i class="fas fa-globe"></i>
                  Scrapes
                </h3>
                <div
                  v-for="result in scrapeResults"
                  :key="result.id"
                  class="result-item"
                  @click="navigateTo('/dashboard/scrapes', result.id)"
                >
                  <div class="result-icon">
                    <i class="fas fa-globe"></i>
                  </div>
                  <div class="result-content">
                    <div class="result-title">{{ result.name }}</div>
                    <div class="result-description">{{ result.status }} • {{ formatDate(result.createdAt) }}</div>
                  </div>
                </div>
              </div>

              <div
                class="results-section"
                v-if="previewResults.length > 0"
              >
                <h3 class="section-title">
                  <i class="fas fa-desktop"></i>
                  Preview Sites
                </h3>
                <div
                  v-for="result in previewResults"
                  :key="result.id"
                  class="result-item"
                  @click="navigateTo('/dashboard/preview-sites', result.id)"
                >
                  <div class="result-icon">
                    <i class="fas fa-desktop"></i>
                  </div>
                  <div class="result-content">
                    <div class="result-title">{{ result.name }}</div>
                    <div class="result-description">{{ result.status }} • {{ formatDate(result.createdAt) }}</div>
                  </div>
                </div>
              </div>

              <div
                class="results-section"
                v-if="clientResults.length > 0"
              >
                <h3 class="section-title">
                  <i class="fas fa-users"></i>
                  Clients
                </h3>
                <div
                  v-for="result in clientResults"
                  :key="result.id"
                  class="result-item"
                  @click="navigateTo('/dashboard/clients', result.id)"
                >
                  <div class="result-icon">
                    <i class="fas fa-user"></i>
                  </div>
                  <div class="result-content">
                    <div class="result-title">{{ result.name }}</div>
                    <div class="result-description">{{ result.email }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Initial State -->
            <div
              v-else
              class="initial-state"
            >
              <div class="search-suggestions">
                <h3>Try searching for</h3>
                <div class="suggestion-tags">
                  <span
                    class="suggestion-tag"
                    @click="setSearchQuery('scrape')"
                  >Scrapes</span>
                  <span
                    class="suggestion-tag"
                    @click="setSearchQuery('preview')"
                  >Preview Sites</span>
                  <span
                    class="suggestion-tag"
                    @click="setSearchQuery('client')"
                  >Clients</span>
                  <span
                    class="suggestion-tag"
                    @click="setSearchQuery('completed')"
                  >Completed Jobs</span>
                  <span
                    class="suggestion-tag"
                    @click="setSearchQuery('pending')"
                  >Pending Jobs</span>
                </div>
              </div>
            </div>
          </div>

          <div class="search-footer">
            <div class="search-tips">
              <span><kbd>Enter</kbd> to search</span>
              <span><kbd>Esc</kbd> to close</span>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";

// Mock data service imports (in a real app, these would be actual services)
import { useScrapeStore } from "../../stores/scrape";
import { usePreviewStore } from "../../stores/preview";
import { useClientStore } from "../../stores/client";

const router = useRouter();
const scrapeStore = useScrapeStore();
const previewStore = usePreviewStore();
const clientStore = useClientStore();

// State
const showSearch = ref(false);
const searchQuery = ref("");
const isLoading = ref(false);
const searchPerformed = ref(false);
const searchInput = ref<HTMLInputElement | null>(null);
const results = ref<any[]>([]);

// Toggle search modal
const toggleSearch = () => {
  showSearch.value = !showSearch.value;
  if (showSearch.value) {
    // Focus the search input after the modal is shown
    nextTick(() => {
      searchInput.value?.focus();
    });
    // Add event listener to handle keyboard shortcuts
    document.addEventListener("keydown", handleKeyDown);
  } else {
    // Remove event listener when modal is closed
    document.removeEventListener("keydown", handleKeyDown);
  }
};

// Close search modal
const closeSearch = () => {
  showSearch.value = false;
  document.removeEventListener("keydown", handleKeyDown);
};

// Clear search query
const clearSearch = () => {
  searchQuery.value = "";
  searchPerformed.value = false;
  results.value = [];
  searchInput.value?.focus();
};

// Set search query from suggestion
const setSearchQuery = (query: string) => {
  searchQuery.value = query;
  performSearch();
};

// Perform search
const performSearch = async () => {
  if (!searchQuery.value.trim()) return;

  isLoading.value = true;
  searchPerformed.value = true;

  try {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Get data from stores
    const scrapes = scrapeStore.scrapingJobs;
    const previews = previewStore.previews;
    const clients = clientStore.clients;

    // Filter data based on search query
    const query = searchQuery.value.toLowerCase();

    const filteredScrapes = scrapes.filter(
      (scrape) =>
        scrape.name.toLowerCase().includes(query) ||
        scrape.status.toLowerCase().includes(query) ||
        scrape.sourceUrl?.toLowerCase().includes(query)
    );

    const filteredPreviews = previews.filter(
      (preview) =>
        preview.name.toLowerCase().includes(query) ||
        preview.status.toLowerCase().includes(query) ||
        preview.url?.toLowerCase().includes(query)
    );

    const filteredClients = clients.filter(
      (client) =>
        client.name.toLowerCase().includes(query) ||
        client.email.toLowerCase().includes(query) ||
        client.company?.toLowerCase().includes(query)
    );

    // Combine results
    results.value = [
      ...filteredScrapes.map((item) => ({ ...item, type: "scrape" })),
      ...filteredPreviews.map((item) => ({ ...item, type: "preview" })),
      ...filteredClients.map((item) => ({ ...item, type: "client" })),
    ];
  } catch (error) {
    console.error("Search error:", error);
  } finally {
    isLoading.value = false;
  }
};

// Computed properties for categorized results
const scrapeResults = computed(() =>
  results.value.filter((result) => result.type === "scrape").slice(0, 3)
);

const previewResults = computed(() =>
  results.value.filter((result) => result.type === "preview").slice(0, 3)
);

const clientResults = computed(() =>
  results.value.filter((result) => result.type === "client").slice(0, 3)
);

// Navigate to result
const navigateTo = (basePath: string, id: string) => {
  router.push(`${basePath}?id=${id}`);
  closeSearch();
};

// Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Handle keyboard shortcuts
const handleKeyDown = (event: KeyboardEvent) => {
  // Close search on Escape key
  if (event.key === "Escape") {
    closeSearch();
  }
};

// Keyboard shortcut to open search (Ctrl+K or Cmd+K)
const globalKeyHandler = (event: KeyboardEvent) => {
  if ((event.ctrlKey || event.metaKey) && event.key === "k") {
    event.preventDefault();
    toggleSearch();
  }
};

// Add and remove global event listeners
onMounted(() => {
  document.addEventListener("keydown", globalKeyHandler);
});

onUnmounted(() => {
  document.removeEventListener("keydown", globalKeyHandler);
  document.removeEventListener("keydown", handleKeyDown);
});
</script>

<style scoped>
.global-search {
  position: relative;
}

.search-icon {
  background: none;
  border: none;
  color: #666;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.search-icon:hover {
  background-color: #f5f5f5;
}

/* Search Modal */
.search-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1100;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.search-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.search-container {
  position: relative;
  width: 600px;
  max-width: 90%;
  max-height: 80vh;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  margin-top: 80px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.search-header {
  padding: 16px;
  border-bottom: 1px solid #eaeaea;
  display: flex;
  align-items: center;
}

.search-input-container {
  flex: 1;
  display: flex;
  align-items: center;
  position: relative;
}

.search-input-container i {
  position: absolute;
  left: 12px;
  color: #6b7280;
}

.search-input-container input {
  width: 100%;
  padding: 12px 40px 12px 40px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s;
}

.search-input-container input:focus {
  border-color: #4f46e5;
}

.clear-button {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
}

.close-button {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  margin-left: 12px;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.close-button:hover {
  background-color: #f5f5f5;
}

.search-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  min-height: 300px;
}

/* Loading State - Skeleton */
.search-loading {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.skeleton-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.skeleton-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background-color: #e5e7eb;
  animation: pulse 1.5s infinite;
}

.skeleton-content {
  flex: 1;
}

.skeleton-title {
  height: 16px;
  width: 60%;
  background-color: #e5e7eb;
  border-radius: 4px;
  margin-bottom: 8px;
  animation: pulse 1.5s infinite;
}

.skeleton-description {
  height: 12px;
  width: 80%;
  background-color: #e5e7eb;
  border-radius: 4px;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
}

/* No Results State */
.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: #6b7280;
}

.no-results i {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.no-results p {
  margin: 4px 0;
}

.suggestion {
  font-size: 14px;
  opacity: 0.7;
}

/* Results State */
.search-results {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.results-section {
  display: flex;
  flex-direction: column;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.result-item:hover {
  background-color: #f9fafb;
}

.result-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background-color: #e0e7ff;
  color: #4f46e5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.result-content {
  flex: 1;
}

.result-title {
  font-weight: 500;
  color: #111827;
  margin-bottom: 4px;
}

.result-description {
  font-size: 14px;
  color: #6b7280;
}

/* Initial State */
.initial-state {
  padding: 20px 0;
}

.search-suggestions h3 {
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 12px;
}

.suggestion-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.suggestion-tag {
  padding: 6px 12px;
  background-color: #f3f4f6;
  border-radius: 16px;
  font-size: 14px;
  color: #4b5563;
  cursor: pointer;
  transition: background-color 0.2s;
}

.suggestion-tag:hover {
  background-color: #e5e7eb;
}

/* Search Footer */
.search-footer {
  padding: 12px 16px;
  border-top: 1px solid #eaeaea;
  display: flex;
  justify-content: flex-end;
}

.search-tips {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #6b7280;
}

.search-tips kbd {
  background-color: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 11px;
  font-family: monospace;
}

/* Transition Animation */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
