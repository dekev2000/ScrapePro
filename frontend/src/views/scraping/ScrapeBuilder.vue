<template>
  <div class="scrape-builder">
    <BaseCard title="Create New Scraping Job">
      <form @submit.prevent="submitForm">
        <div class="form-group">
          <label for="name">Job Name</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            class="form-control"
            placeholder="Enter a name for this scraping job"
            required
          />
        </div>

        <div class="form-group">
          <label>Data Source</label>
          <div class="source-options">
            <div
              v-for="source in sources"
              :key="source.value"
              class="source-option"
              :class="{ active: form.source === source.value }"
              @click="form.source = source.value"
            >
              <i :class="source.icon"></i>
              <span>{{ source.label }}</span>
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group form-group-half">
            <label for="searchTerms">Search Terms</label>
            <div class="tag-input">
              <div class="tags">
                <span v-for="(term, index) in form.searchTerms" :key="index" class="tag">
                  {{ term }}
                  <button type="button" class="tag-remove" @click="removeSearchTerm(index)">
                    <i class="fas fa-times"></i>
                  </button>
                </span>
              </div>
              <input
                id="searchTerms"
                v-model="searchTermInput"
                type="text"
                class="form-control"
                placeholder="Type and press Enter to add"
                @keydown.enter.prevent="addSearchTerm"
              />
            </div>
            <small class="form-text text-muted">
              Enter business types or keywords (e.g., "restaurants", "plumbers")
            </small>
          </div>

          <div class="form-group form-group-half">
            <label for="locations">Locations</label>
            <div class="tag-input">
              <div class="tags">
                <span v-for="(location, index) in form.locations" :key="index" class="tag">
                  {{ location }}
                  <button type="button" class="tag-remove" @click="removeLocation(index)">
                    <i class="fas fa-times"></i>
                  </button>
                </span>
              </div>
              <input
                id="locations"
                v-model="locationInput"
                type="text"
                class="form-control"
                placeholder="Type and press Enter to add"
                @keydown.enter.prevent="addLocation"
              />
            </div>
            <small class="form-text text-muted">
              Enter cities or regions (e.g., "Paris", "75001 Paris")
            </small>
          </div>
        </div>

        <div class="form-group" v-if="form.source === 'insee'">
          <label for="nafCode">NAF Code (Optional)</label>
          <input
            id="nafCode"
            v-model="form.filters.nafCode"
            type="text"
            class="form-control"
            placeholder="Enter NAF code (e.g., 56.10A)"
          />
          <small class="form-text text-muted">
            French business activity classification code
          </small>
        </div>

        <div class="form-group">
          <label>Schedule</label>
          <div class="schedule-options">
            <div
              v-for="option in scheduleOptions"
              :key="option.value"
              class="schedule-option"
              :class="{ active: form.schedule.type === option.value }"
              @click="form.schedule.type = option.value"
            >
              <i :class="option.icon"></i>
              <span>{{ option.label }}</span>
            </div>
          </div>
        </div>

        <div class="form-group" v-if="form.schedule.type === 'recurring'">
          <label>Frequency</label>
          <div class="frequency-options">
            <div
              v-for="option in frequencyOptions"
              :key="option.value"
              class="frequency-option"
              :class="{ active: form.schedule.frequency === option.value }"
              @click="form.schedule.frequency = option.value"
            >
              {{ option.label }}
            </div>
          </div>
        </div>

        <div class="form-actions">
          <BaseButton type="button" variant="secondary" @click="resetForm">
            Reset
          </BaseButton>
          <BaseButton type="submit" variant="primary" :loading="loading">
            Create Scraping Job
          </BaseButton>
        </div>
      </form>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from '@/composables/useToast';
import BaseCard from '@/components/ui/BaseCard.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import { useScrapeStore } from '@/stores/scrape';

const router = useRouter();
const toast = useToast();
const scrapeStore = useScrapeStore();

// Form data
const form = reactive({
  name: '',
  source: 'google_maps',
  searchTerms: [] as string[],
  locations: [] as string[],
  filters: {
    nafCode: ''
  },
  schedule: {
    type: 'immediate',
    frequency: 'weekly'
  }
});

// Input fields for tags
const searchTermInput = ref('');
const locationInput = ref('');

// Loading state
const loading = ref(false);

// Data source options
const sources = [
  { label: 'Google Maps', value: 'google_maps', icon: 'fab fa-google' },
  { label: 'INSEE', value: 'insee', icon: 'fas fa-building' }
];

// Schedule options
const scheduleOptions = [
  { label: 'Run immediately', value: 'immediate', icon: 'fas fa-play' },
  { label: 'Schedule for later', value: 'scheduled', icon: 'far fa-clock' },
  { label: 'Recurring', value: 'recurring', icon: 'fas fa-sync-alt' }
];

// Frequency options
const frequencyOptions = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' }
];

// Methods
function addSearchTerm() {
  if (searchTermInput.value.trim()) {
    form.searchTerms.push(searchTermInput.value.trim());
    searchTermInput.value = '';
  }
}

function removeSearchTerm(index: number) {
  form.searchTerms.splice(index, 1);
}

function addLocation() {
  if (locationInput.value.trim()) {
    form.locations.push(locationInput.value.trim());
    locationInput.value = '';
  }
}

function removeLocation(index: number) {
  form.locations.splice(index, 1);
}

function resetForm() {
  form.name = '';
  form.source = 'google_maps';
  form.searchTerms = [];
  form.locations = [];
  form.filters.nafCode = '';
  form.schedule.type = 'immediate';
  form.schedule.frequency = 'weekly';
  searchTermInput.value = '';
  locationInput.value = '';
}

async function submitForm() {
  // Validate form
  if (!form.name) {
    toast.error('Please enter a job name');
    return;
  }

  if (form.searchTerms.length === 0 && form.source === 'google_maps') {
    toast.error('Please add at least one search term');
    return;
  }

  if (form.locations.length === 0) {
    toast.error('Please add at least one location');
    return;
  }

  try {
    loading.value = true;

    // Create scraping job
    await scrapeStore.createScrapeJob({
      name: form.name,
      source: form.source,
      searchTerms: form.searchTerms,
      locations: form.locations,
      filters: form.filters,
      schedule: form.schedule
    });

    toast.success('Scraping job created successfully');
    resetForm();
    router.push('/scraping/jobs');
  } catch (error: any) {
    toast.error(error.message || 'Failed to create scraping job');
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.scrape-builder {
  max-width: 800px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-row {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-group-half {
  flex: 1;
  margin-bottom: 0;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.form-control {
  display: block;
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  color: #1f2937;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-control:focus {
  border-color: #4f46e5;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(79, 70, 229, 0.25);
}

.form-text {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.875rem;
}

.source-options,
.schedule-options {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.source-option,
.schedule-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.source-option i,
.schedule-option i {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #6b7280;
}

.source-option.active,
.schedule-option.active {
  border-color: #4f46e5;
  background-color: rgba(79, 70, 229, 0.05);
}

.source-option.active i,
.schedule-option.active i {
  color: #4f46e5;
}

.frequency-options {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.frequency-option {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.frequency-option.active {
  border-color: #4f46e5;
  background-color: rgba(79, 70, 229, 0.05);
  color: #4f46e5;
}

.tag-input {
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  padding: 0.25rem;
  background-color: #fff;
}

.tag-input .form-control {
  border: none;
  box-shadow: none;
  padding: 0.5rem;
}

.tag-input .form-control:focus {
  box-shadow: none;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  padding: 0.25rem;
}

.tag {
  display: inline-flex;
  align-items: center;
  background-color: #e5e7eb;
  color: #4b5563;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}

.tag-remove {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  margin-left: 0.25rem;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tag-remove:hover {
  color: #ef4444;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}
</style>
