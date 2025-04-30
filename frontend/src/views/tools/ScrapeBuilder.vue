<template>
  <div class="scrape-builder">
    <div class="builder-header">
      <h1>Scrape Builder</h1>
      <p class="subtitle">Create and configure a new scraping job</p>
      <div class="header-actions">
        <router-link
          to="/dashboard/google-places-test"
          class="google-places-btn"
        >
          <i class="fas fa-map-marker-alt"></i>
          Test Google Places API
        </router-link>
      </div>
    </div>

    <div class="builder-container">
      <div class="builder-steps">
        <div
          v-for="(step, index) in steps"
          :key="index"
          :class="['step-item', {
            active: currentStep === index,
            completed: currentStep > index
          }]"
          @click="goToStep(index)"
        >
          <div class="step-number">
            <span v-if="currentStep <= index">{{ index + 1 }}</span>
            <i
              v-else
              class="fas fa-check"
            ></i>
          </div>
          <div class="step-content">
            <h3>{{ step.title }}</h3>
            <p>{{ step.description }}</p>
          </div>
        </div>
      </div>

      <div class="builder-form">
        <!-- Step 1: Basic Information -->
        <div
          v-if="currentStep === 0"
          class="step-form"
        >
          <h2>Basic Information</h2>
          <p>Enter the basic details for your scraping job.</p>

          <div class="form-group">
            <label for="job-name">Job Name <span class="required">*</span></label>
            <input
              type="text"
              id="job-name"
              v-model="scrapeJob.name"
              placeholder="Enter a name for this scraping job"
              required
            />
          </div>

          <div class="form-group">
            <label for="job-description">Description</label>
            <textarea
              id="job-description"
              v-model="scrapeJob.description"
              placeholder="Enter a description for this scraping job"
              rows="3"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="job-source">Data Source <span class="required">*</span></label>
            <select
              id="job-source"
              v-model="scrapeJob.source"
              required
            >
              <option value="">Select a data source</option>
              <option value="google_maps">Google Maps</option>
              <option value="linkedin">LinkedIn</option>
              <option value="insee">INSEE</option>
              <option value="website">Website</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <!-- Step 2: Search Parameters -->
        <div
          v-if="currentStep === 1"
          class="step-form"
        >
          <h2>Search Parameters</h2>
          <p>Define what data you want to scrape.</p>

          <div class="form-group">
            <label>Search Terms <span class="required">*</span></label>
            <div class="tags-input">
              <div class="tags-container">
                <div
                  v-for="(term, index) in scrapeJob.searchTerms"
                  :key="index"
                  class="tag"
                >
                  {{ term }}
                  <button
                    type="button"
                    class="tag-remove"
                    @click="removeSearchTerm(index)"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
              <input
                type="text"
                v-model="newSearchTerm"
                @keydown.enter.prevent="addSearchTerm"
                placeholder="Type and press Enter to add"
              />
            </div>
          </div>

          <div class="form-group">
            <label>Locations <span class="required">*</span></label>
            <div class="tags-input">
              <div class="tags-container">
                <div
                  v-for="(location, index) in scrapeJob.locations"
                  :key="index"
                  class="tag"
                >
                  {{ location }}
                  <button
                    type="button"
                    class="tag-remove"
                    @click="removeLocation(index)"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
              <input
                type="text"
                v-model="newLocation"
                @keydown.enter.prevent="addLocation"
                placeholder="Type and press Enter to add"
              />
            </div>
          </div>

          <div
            class="form-group"
            v-if="scrapeJob.source === 'google_maps'"
          >
            <label for="rating-filter">Minimum Rating</label>
            <select
              id="rating-filter"
              v-model="scrapeJob.filters.rating"
            >
              <option value="">Any rating</option>
              <option value="3+">3+ stars</option>
              <option value="4+">4+ stars</option>
              <option value="4.5+">4.5+ stars</option>
            </select>
          </div>

          <div
            class="form-group"
            v-if="scrapeJob.source === 'google_maps'"
          >
            <label for="price-filter">Price Range</label>
            <select
              id="price-filter"
              v-model="scrapeJob.filters.priceRange"
            >
              <option value="">Any price</option>
              <option value="$">$ (Inexpensive)</option>
              <option value="$$">$$ (Moderate)</option>
              <option value="$$$">$$$ (Expensive)</option>
              <option value="$$$$">$$$$ (Very Expensive)</option>
            </select>
          </div>

          <div
            class="form-group"
            v-if="scrapeJob.source === 'linkedin'"
          >
            <label for="employee-count">Employee Count</label>
            <select
              id="employee-count"
              v-model="scrapeJob.filters.employeeCount"
            >
              <option value="">Any size</option>
              <option value="1-10">1-10 employees</option>
              <option value="11-50">11-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="201-500">201-500 employees</option>
              <option value="501+">501+ employees</option>
            </select>
          </div>

          <div
            class="form-group"
            v-if="scrapeJob.source === 'insee'"
          >
            <label for="legal-status">Legal Status</label>
            <select
              id="legal-status"
              v-model="scrapeJob.filters.legalStatus"
            >
              <option value="">Any status</option>
              <option value="SAS">SAS</option>
              <option value="SARL">SARL</option>
              <option value="SA">SA</option>
              <option value="EI">EI</option>
              <option value="EURL">EURL</option>
            </select>
          </div>
        </div>

        <!-- Step 3: Configuration -->
        <div
          v-if="currentStep === 2"
          class="step-form"
        >
          <h2>Configuration</h2>
          <p>Configure additional settings for your scraping job.</p>

          <div class="form-group">
            <label for="max-results">Maximum Results</label>
            <input
              type="number"
              id="max-results"
              v-model="scrapeJob.configuration.maxResults"
              min="1"
              max="1000"
            />
            <span class="help-text">Maximum number of results to collect (1-1000)</span>
          </div>

          <div class="form-group">
            <label>Data to Collect</label>
            <div class="checkbox-group">
              <div class="checkbox-item">
                <input
                  type="checkbox"
                  id="include-contact"
                  v-model="scrapeJob.configuration.includeContact"
                />
                <label for="include-contact">Contact Information</label>
              </div>
              <div class="checkbox-item">
                <input
                  type="checkbox"
                  id="include-website"
                  v-model="scrapeJob.configuration.includeWebsite"
                />
                <label for="include-website">Website URL</label>
              </div>
              <div
                class="checkbox-item"
                v-if="scrapeJob.source === 'google_maps'"
              >
                <input
                  type="checkbox"
                  id="include-reviews"
                  v-model="scrapeJob.configuration.includeReviews"
                />
                <label for="include-reviews">Reviews</label>
              </div>
              <div
                class="checkbox-item"
                v-if="scrapeJob.source === 'google_maps'"
              >
                <input
                  type="checkbox"
                  id="include-photos"
                  v-model="scrapeJob.configuration.includePhotos"
                />
                <label for="include-photos">Photos</label>
              </div>
              <div
                class="checkbox-item"
                v-if="scrapeJob.source === 'linkedin'"
              >
                <input
                  type="checkbox"
                  id="include-employees"
                  v-model="scrapeJob.configuration.includeEmployees"
                />
                <label for="include-employees">Key Employees</label>
              </div>
              <div
                class="checkbox-item"
                v-if="scrapeJob.source === 'insee'"
              >
                <input
                  type="checkbox"
                  id="include-financial"
                  v-model="scrapeJob.configuration.includeFinancialData"
                />
                <label for="include-financial">Financial Data</label>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="schedule-type">Schedule</label>
            <select
              id="schedule-type"
              v-model="scrapeJob.schedule.type"
            >
              <option value="once">Run Once</option>
              <option value="daily">Run Daily</option>
              <option value="weekly">Run Weekly</option>
              <option value="monthly">Run Monthly</option>
            </select>
          </div>

          <div
            class="form-group"
            v-if="scrapeJob.schedule.type !== 'once'"
          >
            <label for="schedule-time">Time of Day</label>
            <input
              type="time"
              id="schedule-time"
              v-model="scrapeJob.schedule.time"
            />
          </div>

          <div
            class="form-group"
            v-if="scrapeJob.schedule.type === 'weekly'"
          >
            <label for="schedule-day">Day of Week</label>
            <select
              id="schedule-day"
              v-model="scrapeJob.schedule.day"
            >
              <option value="1">Monday</option>
              <option value="2">Tuesday</option>
              <option value="3">Wednesday</option>
              <option value="4">Thursday</option>
              <option value="5">Friday</option>
              <option value="6">Saturday</option>
              <option value="0">Sunday</option>
            </select>
          </div>

          <div
            class="form-group"
            v-if="scrapeJob.schedule.type === 'monthly'"
          >
            <label for="schedule-date">Day of Month</label>
            <input
              type="number"
              id="schedule-date"
              v-model="scrapeJob.schedule.date"
              min="1"
              max="31"
            />
          </div>
        </div>

        <!-- Step 4: Review -->
        <div
          v-if="currentStep === 3"
          class="step-form"
        >
          <h2>Review</h2>
          <p>Review your scraping job configuration before creating it.</p>

          <div class="review-section">
            <h3>Basic Information</h3>
            <div class="review-item">
              <span class="review-label">Job Name:</span>
              <span class="review-value">{{ scrapeJob.name }}</span>
            </div>
            <div class="review-item">
              <span class="review-label">Description:</span>
              <span class="review-value">{{ scrapeJob.description || 'None' }}</span>
            </div>
            <div class="review-item">
              <span class="review-label">Data Source:</span>
              <span class="review-value">{{ formatSource(scrapeJob.source) }}</span>
            </div>
          </div>

          <div class="review-section">
            <h3>Search Parameters</h3>
            <div class="review-item">
              <span class="review-label">Search Terms:</span>
              <span class="review-value">{{ scrapeJob.searchTerms.join(', ') || 'None' }}</span>
            </div>
            <div class="review-item">
              <span class="review-label">Locations:</span>
              <span class="review-value">{{ scrapeJob.locations.join(', ') || 'None' }}</span>
            </div>
            <div
              class="review-item"
              v-if="scrapeJob.source === 'google_maps' && scrapeJob.filters.rating"
            >
              <span class="review-label">Minimum Rating:</span>
              <span class="review-value">{{ scrapeJob.filters.rating }}</span>
            </div>
            <div
              class="review-item"
              v-if="scrapeJob.source === 'google_maps' && scrapeJob.filters.priceRange"
            >
              <span class="review-label">Price Range:</span>
              <span class="review-value">{{ scrapeJob.filters.priceRange }}</span>
            </div>
            <div
              class="review-item"
              v-if="scrapeJob.source === 'linkedin' && scrapeJob.filters.employeeCount"
            >
              <span class="review-label">Employee Count:</span>
              <span class="review-value">{{ scrapeJob.filters.employeeCount }}</span>
            </div>
            <div
              class="review-item"
              v-if="scrapeJob.source === 'insee' && scrapeJob.filters.legalStatus"
            >
              <span class="review-label">Legal Status:</span>
              <span class="review-value">{{ scrapeJob.filters.legalStatus }}</span>
            </div>
          </div>

          <div class="review-section">
            <h3>Configuration</h3>
            <div class="review-item">
              <span class="review-label">Maximum Results:</span>
              <span class="review-value">{{ scrapeJob.configuration.maxResults }}</span>
            </div>
            <div class="review-item">
              <span class="review-label">Data to Collect:</span>
              <span class="review-value">
                <ul class="review-list">
                  <li v-if="scrapeJob.configuration.includeContact">Contact Information</li>
                  <li v-if="scrapeJob.configuration.includeWebsite">Website URL</li>
                  <li v-if="scrapeJob.configuration.includeReviews">Reviews</li>
                  <li v-if="scrapeJob.configuration.includePhotos">Photos</li>
                  <li v-if="scrapeJob.configuration.includeEmployees">Key Employees</li>
                  <li v-if="scrapeJob.configuration.includeFinancialData">Financial Data</li>
                </ul>
              </span>
            </div>
            <div class="review-item">
              <span class="review-label">Schedule:</span>
              <span class="review-value">{{ formatSchedule(scrapeJob.schedule) }}</span>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button
            v-if="currentStep > 0"
            type="button"
            class="btn secondary"
            @click="prevStep"
          >
            <i class="fas fa-arrow-left"></i>
            Previous
          </button>

          <button
            v-if="currentStep < steps.length - 1"
            type="button"
            class="btn primary"
            @click="nextStep"
            :disabled="!canProceed"
          >
            Next
            <i class="fas fa-arrow-right"></i>
          </button>

          <button
            v-if="currentStep === steps.length - 1"
            type="button"
            class="btn success"
            @click="createScrapeJob"
          >
            <i class="fas fa-check"></i>
            Create Scrape Job
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from "vue";
import { useRouter } from "vue-router";
import { useScrapeStore } from "@/stores/scrape";
import { useToast } from "@/composables/useToast";

const router = useRouter();
const scrapeStore = useScrapeStore();

// Steps configuration
const steps = [
  {
    title: "Basic Information",
    description: "Enter the basic details for your scraping job",
  },
  {
    title: "Search Parameters",
    description: "Define what data you want to scrape",
  },
  {
    title: "Configuration",
    description: "Configure additional settings",
  },
  {
    title: "Review",
    description: "Review and create your scraping job",
  },
];

// Form state
const currentStep = ref(0);
const newSearchTerm = ref("");
const newLocation = ref("");

// Scrape job data
const scrapeJob = reactive({
  name: "",
  description: "",
  source: "",
  searchTerms: [] as string[],
  locations: [] as string[],
  filters: {
    rating: "",
    priceRange: "",
    employeeCount: "",
    legalStatus: "",
  },
  configuration: {
    maxResults: 100,
    includeContact: true,
    includeWebsite: true,
    includeReviews: false,
    includePhotos: false,
    includeEmployees: false,
    includeFinancialData: false,
  },
  schedule: {
    type: "once",
    time: "09:00",
    day: "1",
    date: 1,
  },
});

// Computed properties
const canProceed = computed(() => {
  if (currentStep.value === 0) {
    return scrapeJob.name && scrapeJob.source;
  } else if (currentStep.value === 1) {
    return scrapeJob.searchTerms.length > 0 && scrapeJob.locations.length > 0;
  }
  return true;
});

// Methods
const goToStep = (step: number) => {
  // Only allow going to completed steps or the next step
  if (
    step <= currentStep.value ||
    (step === currentStep.value + 1 && canProceed.value)
  ) {
    currentStep.value = step;
  }
};

const nextStep = () => {
  if (currentStep.value < steps.length - 1 && canProceed.value) {
    currentStep.value++;
  }
};

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
};

const addSearchTerm = () => {
  if (newSearchTerm.value.trim()) {
    scrapeJob.searchTerms.push(newSearchTerm.value.trim());
    newSearchTerm.value = "";
  }
};

const removeSearchTerm = (index: number) => {
  scrapeJob.searchTerms.splice(index, 1);
};

const addLocation = () => {
  if (newLocation.value.trim()) {
    scrapeJob.locations.push(newLocation.value.trim());
    newLocation.value = "";
  }
};

const removeLocation = (index: number) => {
  scrapeJob.locations.splice(index, 1);
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
    case "other":
      return "Other";
    default:
      return source;
  }
};

const formatSchedule = (schedule: any) => {
  if (schedule.type === "once") {
    return "Run Once";
  } else if (schedule.type === "daily") {
    return `Run Daily at ${schedule.time}`;
  } else if (schedule.type === "weekly") {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return `Run Weekly on ${days[schedule.day]} at ${schedule.time}`;
  } else if (schedule.type === "monthly") {
    return `Run Monthly on day ${schedule.date} at ${schedule.time}`;
  }
  return "";
};

const createScrapeJob = async () => {
  try {
    // In a real app, this would call an API to create the scraping job
    // await scrapeStore.createScrapeJob(scrapeJob);

    // For now, just show a success message and redirect
    const toast = useToast();
    toast.success("Scraping job created successfully!");
    router.push("/dashboard/scrapes");
  } catch (error) {
    console.error("Failed to create scraping job:", error);
    const toast = useToast();
    toast.error("Failed to create scraping job. Please try again.");
  }
};
</script>

<style scoped>
.scrape-builder {
  width: 100%;
  padding: 20px;
}

.builder-header {
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
}

.builder-header h1 {
  margin-bottom: 8px;
  font-size: 24px;
  font-weight: 600;
  color: #111827;
}

.subtitle {
  color: #6b7280;
  font-size: 16px;
  margin-bottom: 16px;
}

.header-actions {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}

.google-places-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background-color: #4f46e5;
  color: white;
  border-radius: 6px;
  font-weight: 500;
  text-decoration: none;
  transition: background-color 0.2s;
}

.google-places-btn:hover {
  background-color: #4338ca;
}

.builder-container {
  display: flex;
  gap: 24px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.builder-steps {
  width: 300px;
  background-color: #f9fafb;
  border-right: 1px solid #e5e7eb;
  padding: 16px 0;
}

.step-item {
  display: flex;
  padding: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.step-item:hover {
  background-color: #f3f4f6;
}

.step-item.active {
  background-color: #e5e7eb;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #e5e7eb;
  color: #4b5563;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-right: 12px;
  flex-shrink: 0;
}

.step-item.active .step-number {
  background-color: #4f46e5;
  color: white;
}

.step-item.completed .step-number {
  background-color: #10b981;
  color: white;
}

.step-content h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 500;
  color: #111827;
}

.step-content p {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

.builder-form {
  flex: 1;
  padding: 24px;
  min-width: 0;
}

.step-form {
  margin-bottom: 24px;
}

.step-form h2 {
  margin-top: 0;
  margin-bottom: 8px;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.step-form > p {
  margin-top: 0;
  margin-bottom: 24px;
  color: #6b7280;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #374151;
}

.form-group input[type="text"],
.form-group input[type="number"],
.form-group input[type="time"],
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.form-group textarea {
  resize: vertical;
}

.help-text {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #6b7280;
}

.required {
  color: #ef4444;
}

.tags-input {
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 8px;
  background-color: white;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.tag {
  display: flex;
  align-items: center;
  background-color: #e0e7ff;
  color: #4f46e5;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
}

.tag-remove {
  background: none;
  border: none;
  color: #4f46e5;
  margin-left: 4px;
  cursor: pointer;
  font-size: 12px;
}

.tags-input input {
  border: none;
  outline: none;
  padding: 4px;
  width: 100%;
  font-size: 14px;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
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

.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 32px;
}

.btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
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

.btn.primary:hover:not(:disabled) {
  background-color: #4338ca;
}

.btn.secondary {
  background-color: #e5e7eb;
  color: #374151;
}

.btn.secondary:hover {
  background-color: #d1d5db;
}

.btn.success {
  background-color: #10b981;
  color: white;
}

.btn.success:hover {
  background-color: #059669;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Review styles */
.review-section {
  margin-bottom: 24px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 16px;
}

.review-section h3 {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 8px;
}

.review-item {
  display: flex;
  margin-bottom: 8px;
}

.review-label {
  width: 150px;
  font-weight: 500;
  color: #6b7280;
}

.review-list {
  margin: 0;
  padding-left: 20px;
}

/* Responsive */
@media (max-width: 768px) {
  .builder-container {
    flex-direction: column;
  }

  .builder-steps {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
  }

  .review-item {
    flex-direction: column;
  }

  .review-label {
    width: 100%;
    margin-bottom: 4px;
  }
}
</style>