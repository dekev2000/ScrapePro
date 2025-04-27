<template>
  <div class="site-designer">
    <div class="designer-header">
      <h1>Site Designer</h1>
      <p class="subtitle">Design and customize website templates for your clients</p>
    </div>

    <div class="designer-header-subtitle">
      <i class="fas fa-magic"></i>
      AI Website Generator
    </div>

    <div class="designer-container">
      <div class="ai-generator-panel">
        <div class="ai-generator-header">
          <h2>AI Website Generator</h2>
        </div>

        <div class="workflow-steps">
          <div class="step-indicator">
            <div :class="['step', { active: currentStep >= 0, completed: currentStep > 0 }]">
              <div class="step-number">0</div>
              <div class="step-label">Select Prospect</div>
            </div>
            <div class="step-connector"></div>
            <div :class="['step', { active: currentStep >= 1, completed: currentStep > 1 }]">
              <div class="step-number">1</div>
              <div class="step-label">Generate / Deploy</div>
            </div>
            <div class="step-connector"></div>
            <div :class="['step', { active: currentStep >= 3, completed: currentStep > 3 }]">
              <div class="step-number">2</div>
              <div class="step-label">Capture</div>
            </div>
            <div class="step-connector"></div>
            <div :class="['step', { active: currentStep >= 4 }]">
              <div class="step-number">3</div>
              <div class="step-label">Import</div>
            </div>
          </div>

          <div
            class="info-note"
            v-if="currentStep === 0"
          >
            <i class="fas fa-info-circle"></i>
            <span>Step 0: Select a prospect from your scraped leads to use as a basis for website generation.</span>
          </div>

          <div
            class="info-note"
            v-if="currentStep === 1"
          >
            <i class="fas fa-info-circle"></i>
            <span>Step 1: Generate your website using DeepSite AI. When satisfied with the result, click the "Deploy to Space" button in the DeepSite interface. After deployment is complete, paste the static URL below and click "Continue to Screenshot".</span>
          </div>

          <!-- Removed step 2 info note -->

          <!-- Info note for step 3 removed -->

          <div
            class="info-note"
            v-if="currentStep === 4"
          >
            <i class="fas fa-info-circle"></i>
            <span>Step 3: Review your captured website and click "Save to Project" to save it.</span>
          </div>
        </div>

        <!-- Step 0: Select Prospect -->
        <div
          v-if="currentStep === 0"
          class="prospect-selection"
        >
          <div class="search-filter">
            <div class="search-input">
              <i class="fas fa-search"></i>
              <input
                type="text"
                v-model="prospectSearch"
                placeholder="Search prospects..."
                @input="filterProspects"
              />
            </div>
            <div class="filter-options">
              <select
                v-model="prospectFilter"
                @change="filterProspects"
              >
                <option value="all">All Prospects</option>
                <option value="recent">Recently Added</option>
                <option value="company">Companies</option>
                <option value="individual">Individuals</option>
              </select>
            </div>
          </div>

          <div class="prospects-grid">
            <div
              v-for="prospect in filteredProspects"
              :key="prospect.id"
              :class="['prospect-card', { selected: selectedProspect && selectedProspect.id === prospect.id }]"
              @click="selectProspect(prospect)"
            >
              <div class="prospect-icon">
                <i :class="prospect.type === 'company' ? 'fas fa-building' : 'fas fa-user'"></i>
              </div>
              <div class="prospect-info">
                <h3>{{ prospect.name }}</h3>
                <p class="prospect-type">{{ prospect.type === 'company' ? 'Company' : 'Individual' }}</p>
                <p class="prospect-details">{{ prospect.details }}</p>
              </div>
              <div class="prospect-actions">
                <button
                  class="btn-view"
                  @click.stop="viewProspectDetails(prospect)"
                >
                  <i class="fas fa-eye"></i>
                </button>
              </div>
            </div>

            <div
              v-if="filteredProspects.length === 0"
              class="no-prospects"
            >
              <i class="fas fa-search"></i>
              <p>No prospects found matching your search criteria.</p>
              <button
                class="btn primary"
                @click="resetFilters"
              >Reset Filters</button>
            </div>
          </div>

          <div
            v-if="selectedProspect"
            class="selected-prospect-details"
          >
            <div class="details-header">
              <h3>Selected Prospect</h3>
              <button
                class="btn-change"
                @click="selectedProspect = null"
              >
                <i class="fas fa-exchange-alt"></i>
                Change
              </button>
            </div>

            <div class="prospect-card-large">
              <div class="prospect-header">
                <div class="prospect-icon-large">
                  <i :class="selectedProspect.type === 'company' ? 'fas fa-building' : 'fas fa-user'"></i>
                </div>
                <div class="prospect-title">
                  <h3>{{ selectedProspect.name }}</h3>
                  <span
                    class="prospect-badge"
                    :class="selectedProspect.type"
                  >
                    {{ selectedProspect.type === 'company' ? 'Company' : 'Individual' }}
                  </span>
                </div>
              </div>

              <div class="prospect-data-grid">
                <div
                  class="data-item"
                  v-if="selectedProspect.industry"
                >
                  <div class="data-label"><i class="fas fa-briefcase"></i> Industry</div>
                  <div class="data-value">{{ selectedProspect.industry }}</div>
                </div>
                <div
                  class="data-item"
                  v-if="selectedProspect.contact"
                >
                  <div class="data-label"><i class="fas fa-envelope"></i> Contact</div>
                  <div class="data-value">{{ selectedProspect.contact }}</div>
                </div>
                <div
                  class="data-item"
                  v-if="selectedProspect.website"
                >
                  <div class="data-label"><i class="fas fa-globe"></i> Website</div>
                  <div class="data-value">{{ selectedProspect.website }}</div>
                </div>
                <div
                  class="data-item"
                  v-if="selectedProspect.address"
                >
                  <div class="data-label"><i class="fas fa-map-marker-alt"></i> Address</div>
                  <div class="data-value">{{ selectedProspect.address }}</div>
                </div>
              </div>

              <div class="prospect-details-section">
                <div class="details-label">Description</div>
                <div class="details-value">{{ selectedProspect.details }}</div>
              </div>

              <div
                class="prospect-details-section"
                v-if="selectedProspect.notes"
              >
                <div class="details-label">Notes</div>
                <div class="details-value">{{ selectedProspect.notes }}</div>
              </div>

              <div
                class="prospect-details-section"
                v-if="selectedProspect.services && selectedProspect.services.length > 0"
              >
                <div class="details-label">Services</div>
                <ul class="services-list">
                  <li
                    v-for="(service, index) in selectedProspect.services"
                    :key="index"
                  >
                    {{ service }}
                  </li>
                </ul>
              </div>

              <div
                class="prospect-details-section"
                v-if="selectedProspect.products && selectedProspect.products.length > 0"
              >
                <div class="details-label">Products</div>
                <ul class="products-list">
                  <li
                    v-for="(product, index) in selectedProspect.products"
                    :key="index"
                  >
                    {{ product }}
                  </li>
                </ul>
              </div>

              <div
                class="prospect-details-section"
                v-if="selectedProspect.history"
              >
                <div class="details-label">Company History</div>
                <div class="details-value">{{ selectedProspect.history }}</div>
              </div>
            </div>

            <div class="prospect-selection-actions">
              <!-- Back to Templates button removed -->
              <button
                class="btn primary"
                @click="goToStep(1)"
              >
                <i class="fas fa-arrow-right"></i>
                Continue with Selected Prospect
              </button>
            </div>
          </div>

          <div
            v-else
            class="prospect-selection-actions"
          >
            <!-- Back to Templates button removed -->
            <button
              class="btn primary"
              @click="goToStep(1)"
              :disabled="!selectedProspect"
            >
              <i class="fas fa-arrow-right"></i>
              Continue with Selected Prospect
            </button>
          </div>
        </div>

        <!-- Step 1: Generate with DeepSite -->
        <div
          v-if="currentStep === 1"
          class="ai-generator-wrapper"
        >
          <div
            class="prospect-summary-bar"
            @click="toggleProspectDetails"
          >
            <div class="summary-content">
              <div class="prospect-icon-small">
                <i :class="selectedProspect && selectedProspect.type === 'company' ? 'fas fa-building' : 'fas fa-user'"></i>
              </div>
              <div class="summary-text">
                <span class="summary-title">{{ selectedProspect ? selectedProspect.name : 'No prospect selected' }}</span>
                <span class="summary-subtitle">{{ selectedProspect ? (selectedProspect.type === 'company' ? selectedProspect.industry : 'Individual') : 'Select a prospect in step 0' }}</span>
              </div>
            </div>
            <div class="summary-toggle">
              <i :class="showProspectDetails ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
              {{ showProspectDetails ? 'Hide Details' : 'Show Details' }}
            </div>
          </div>

          <div
            class="prospect-details-dropdown"
            v-if="showProspectDetails && selectedProspect"
          >
            <div class="dropdown-section">
              <h4>Basic Information</h4>
              <div class="details-grid">
                <div
                  class="detail-item"
                  v-if="selectedProspect.contact"
                >
                  <div class="detail-label"><i class="fas fa-envelope"></i> Contact</div>
                  <div class="detail-value">{{ selectedProspect.contact }}</div>
                </div>
                <div
                  class="detail-item"
                  v-if="selectedProspect.website"
                >
                  <div class="detail-label"><i class="fas fa-globe"></i> Website</div>
                  <div class="detail-value">{{ selectedProspect.website }}</div>
                </div>
                <div
                  class="detail-item"
                  v-if="selectedProspect.address"
                >
                  <div class="detail-label"><i class="fas fa-map-marker-alt"></i> Address</div>
                  <div class="detail-value">{{ selectedProspect.address }}</div>
                </div>
                <div
                  class="detail-item"
                  v-if="selectedProspect.industry"
                >
                  <div class="detail-label"><i class="fas fa-briefcase"></i> Industry</div>
                  <div class="detail-value">{{ selectedProspect.industry }}</div>
                </div>
                <div
                  class="detail-item"
                  v-if="selectedProspect.founded"
                >
                  <div class="detail-label"><i class="fas fa-calendar-alt"></i> Founded</div>
                  <div class="detail-value">{{ selectedProspect.founded }}</div>
                </div>
                <div
                  class="detail-item"
                  v-if="selectedProspect.employees"
                >
                  <div class="detail-label"><i class="fas fa-users"></i> Employees</div>
                  <div class="detail-value">{{ selectedProspect.employees }}</div>
                </div>
              </div>
            </div>

            <div
              class="dropdown-section"
              v-if="selectedProspect.details"
            >
              <h4>Description</h4>
              <p class="dropdown-text">{{ selectedProspect.details }}</p>
            </div>

            <div
              class="dropdown-section"
              v-if="selectedProspect.services && selectedProspect.services.length > 0"
            >
              <h4>Services</h4>
              <ul class="dropdown-list">
                <li
                  v-for="(service, index) in selectedProspect.services"
                  :key="'service-'+index"
                >{{ service }}</li>
              </ul>
            </div>

            <div
              class="dropdown-section"
              v-if="selectedProspect.products && selectedProspect.products.length > 0"
            >
              <h4>Products</h4>
              <ul class="dropdown-list">
                <li
                  v-for="(product, index) in selectedProspect.products"
                  :key="'product-'+index"
                >{{ product }}</li>
              </ul>
            </div>

            <div
              class="dropdown-section"
              v-if="selectedProspect.history"
            >
              <h4>Company History</h4>
              <p class="dropdown-text">{{ selectedProspect.history }}</p>
            </div>

            <div
              class="dropdown-section"
              v-if="selectedProspect.notes"
            >
              <h4>Notes</h4>
              <p class="dropdown-text">{{ selectedProspect.notes }}</p>
            </div>

            <div class="dropdown-actions">
              <button
                class="btn secondary"
                @click="toggleProspectDetails"
              >
                <i class="fas fa-times"></i>
                Close Details
              </button>
              <button
                class="btn primary"
                @click="copyProspectToClipboard"
              >
                <i class="fas fa-copy"></i>
                Copy All Details
              </button>
            </div>
          </div>

          <div class="ai-generator-container">
            <iframe
              src="https://enzostvs-deepsite.hf.space"
              width="100%"
              height="800px"
              style="border: none; width: 100%; min-width: 1200px;"
              title="DeepSite AI Website Generator"
              ref="aiGeneratorFrame"
            ></iframe>
          </div>

          <div class="deployment-notice">
            <div class="notice-icon">
              <i class="fas fa-arrow-down"></i>
            </div>
            <div class="notice-text">
              After clicking "Deploy to Space" in DeepSite and waiting for deployment to complete, enter the URL below:
            </div>
          </div>

          <!-- Deployed URL form (now part of step 1) -->
          <div class="deployed-site-form">
            <div class="form-group">
              <label for="deployed-url">Deployed Website URL</label>
              <div class="url-input-group">
                <input
                  type="text"
                  id="deployed-url"
                  v-model="deployedUrl"
                  placeholder="https://username-projectname.static.hf.space/index.html"
                  class="url-input"
                />
                <div class="button-group">
                  <button
                    class="btn secondary"
                    @click="goToStep(0)"
                  >
                    <i class="fas fa-arrow-left"></i>
                    Back
                  </button>
                  <button
                    class="btn primary"
                    @click="validateAndProceed"
                    :disabled="!isValidUrl"
                  >
                    <i class="fas fa-arrow-right"></i>
                    Continue to Screenshot
                  </button>
                </div>
              </div>
              <div class="url-help">
                <i class="fas fa-question-circle"></i>
                <span>The URL should end with <code>.static.hf.space/index.html</code></span>
              </div>
            </div>

            <div class="example-help">
              <h4>How to find the static URL:</h4>
              <ol>
                <li>After clicking "Deploy to Space" in DeepSite, wait for deployment to complete</li>
                <li>Click on the "Embed this Space" option</li>
                <li>Look for the "Direct URL" that ends with <code>.static.hf.space/index.html</code></li>
                <li>Copy that URL and paste it above</li>
              </ol>
              <div class="example-image">
                <img
                  src="https://via.placeholder.com/600x200?text=Example:+Finding+the+static+URL"
                  alt="Example of finding static URL"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Step 2: Empty (skipped) -->
        <div
          v-if="currentStep === 2"
          style="display: none;"
        >
          <!-- This step is now skipped, content moved to step 1 -->
        </div>

        <!-- Step 3: Display deployed site and capture options -->
        <div
          v-if="currentStep === 3"
          class="deployed-site-container"
        >
          <!-- Extension instructions removed -->

          <div class="upload-section">
            <h3>Upload Screenshot</h3>
            <p class="upload-instructions">
              Upload your screenshot here:
            </p>

            <div class="upload-container">
              <input
                type="file"
                id="screenshot-upload"
                accept="image/*"
                @change="importScreenshot"
                class="hidden-input"
              />
              <label
                for="screenshot-upload"
                class="upload-btn"
              >
                <i class="fas fa-upload"></i>
                Select Screenshot File
              </label>
            </div>

            <div
              class="drag-drop-area"
              @dragover.prevent="dragOver = true"
              @dragleave.prevent="dragOver = false"
              @drop.prevent="handleDrop"
              :class="{ 'drag-over': dragOver }"
            >
              <i class="fas fa-file-image"></i>
              <p>Drag & drop your screenshot here</p>
              <div class="drag-drop-instructions">
                <p>Supported formats: PNG, JPG, JPEG</p>
                <p>Maximum file size: 10MB</p>
              </div>
            </div>

            <div class="preview-iframe">
              <h4>Preview Deployed Site</h4>

              <!-- Normal view option removed, only fullpage view is available -->

              <div class="fullpage-iframe-container">
                <div class="fullpage-toolbar">
                  <div class="device-selector">
                    <button
                      v-for="device in devices"
                      :key="device.name"
                      :class="['device-button', { active: selectedDevice === device.name }]"
                      @click="selectDevice(device.name)"
                      :title="device.name"
                    >
                      <i :class="device.icon"></i>
                    </button>
                  </div>
                  <div class="device-info">
                    <span>{{ getDeviceInfo() }}</span>
                  </div>
                </div>

                <div
                  class="fullpage-iframe-wrapper"
                  :style="getDeviceStyle()"
                >
                  <iframe
                    :src="deployedUrl"
                    width="100%"
                    height="100%"
                    style="border: none;"
                    title="Deployed Website Fullpage"
                    ref="fullpageFrame"
                  ></iframe>
                </div>
              </div>

              <div class="iframe-actions">
                <button
                  class="btn secondary"
                  @click="goToStep(1)"
                >
                  <i class="fas fa-arrow-left"></i>
                  Back
                </button>
                <a
                  :href="deployedUrl"
                  target="_blank"
                  class="btn primary"
                >
                  <i class="fas fa-external-link-alt"></i>
                  Open in New Tab
                </a>
                <button
                  class="btn primary"
                  @click="openPreviewInNewTab"
                  :disabled="isCapturing"
                >
                  <i class="fas fa-external-link-alt"></i>
                  Open for Screenshot
                </button>
              </div>

              <!-- iframe note removed -->
            </div>
          </div>
        </div>

        <!-- Step 4: Review and save -->
        <div
          v-if="currentStep === 4"
          class="screenshot-editor"
        >
          <div class="editor-header">
            <h3>Website Captured Successfully</h3>
            <p class="editor-subtitle">Review your screenshot, rename it if needed, and save it to your project</p>
          </div>

          <div class="editor-form">
            <div class="form-group">
              <label for="screenshot-name">Screenshot Name</label>
              <input
                type="text"
                id="screenshot-name"
                v-model="screenshotName"
                placeholder="Enter a name for this screenshot"
                class="form-input"
              />
            </div>

            <div
              class="form-group"
              v-if="selectedProspect"
            >
              <label
                id="associated-prospect-label"
                for="associated-prospect-info"
              >Associated Prospect</label>
              <div
                id="associated-prospect-info"
                class="associated-prospect"
                aria-labelledby="associated-prospect-label"
              >
                <div class="prospect-icon-small">
                  <i :class="selectedProspect.type === 'company' ? 'fas fa-building' : 'fas fa-user'"></i>
                </div>
                <div class="prospect-info-small">
                  <div class="prospect-name">{{ selectedProspect.name }}</div>
                  <div class="prospect-type">{{ selectedProspect.type === 'company' ? 'Company' : 'Individual' }}</div>
                </div>
              </div>
              <div class="form-help">This screenshot will be associated with the selected prospect</div>
            </div>

            <div
              class="form-group"
              v-else
            >
              <label for="screenshot-project">Project</label>
              <select
                id="screenshot-project"
                v-model="screenshotProject"
                class="form-select"
              >
                <option value="">Select a project</option>
                <option value="current">Current Project</option>
                <option value="new">Create New Project</option>
              </select>
            </div>

            <div class="form-group">
              <label for="screenshot-tags">Tags (optional)</label>
              <input
                type="text"
                id="screenshot-tags"
                v-model="screenshotTags"
                placeholder="e.g. homepage, landing, portfolio"
                class="form-input"
              />
              <div class="form-help">Separate tags with commas</div>
            </div>

            <div class="form-group">
              <label for="deployed-url-display">Deployed URL</label>
              <div class="url-display">
                <input
                  type="text"
                  id="deployed-url-display"
                  v-model="deployedUrl"
                  readonly
                  class="form-input"
                />
                <button
                  class="btn-copy"
                  @click="copyToClipboard(deployedUrl)"
                >
                  <i class="fas fa-copy"></i>
                </button>
              </div>
            </div>
          </div>

          <div class="screenshot-preview-container">
            <div class="preview-header">
              <span>Preview</span>
              <div class="preview-actions">
                <button
                  class="preview-action"
                  title="Download as JPEG"
                  @click="downloadScreenshot('jpeg')"
                >
                  <i class="fas fa-download"></i> JPEG
                </button>
                <button
                  class="preview-action"
                  title="Download as PNG"
                  @click="downloadScreenshot('png')"
                >
                  <i class="fas fa-download"></i> PNG
                </button>
              </div>
            </div>
            <div class="screenshot-preview">
              <img
                :src="importedScreenshot"
                alt="Captured website"
              />
            </div>
          </div>

          <div class="editor-actions">
            <button
              class="btn secondary"
              @click="goToStep(3)"
            >
              <i class="fas fa-arrow-left"></i>
              Back
            </button>
            <button
              class="btn primary"
              @click="saveScreenshot"
            >
              <i class="fas fa-save"></i>
              Save to Project
            </button>
            <button
              class="btn secondary"
              @click="clearImportedScreenshot"
            >
              <i class="fas fa-trash"></i>
              Clear
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="activeTab === 'templates'"
        class="preview-panel"
      >
        <div class="preview-header">
          <h2>Preview</h2>
          <button
            class="save-btn"
            @click="saveTemplate"
          >
            <i class="fas fa-save"></i>
            Save Template
          </button>
        </div>

        <div class="preview-container">
          <div
            v-if="!selectedTemplate"
            class="no-template"
          >
            <i class="fas fa-desktop"></i>
            <p>Select a template to preview</p>
          </div>

          <div
            v-else
            class="template-preview-frame"
          >
            <div
              class="template-header"
              :style="{ backgroundColor: customizations.colors.primary }"
            >
              <div class="template-logo">
                <img
                  v-if="customizations.logo"
                  :src="customizations.logo"
                  alt="Logo"
                />
                <div
                  v-else
                  class="placeholder-logo"
                >
                  <i class="fas fa-building"></i>
                </div>
              </div>
              <div
                class="template-name"
                :style="{ color: customizations.colors.background, fontFamily: customizations.fonts.heading }"
              >
                {{ selectedTemplate.name }}
              </div>
            </div>

            <div
              class="template-content"
              :style="{ backgroundColor: customizations.colors.background, color: customizations.colors.text }"
            >
              <div class="template-section">
                <h3 :style="{ color: customizations.colors.primary, fontFamily: customizations.fonts.heading }">About Us</h3>
                <p :style="{ fontFamily: customizations.fonts.body }">
                  {{ selectedTemplate.content.about }}
                </p>
              </div>

              <div class="template-section">
                <h3 :style="{ color: customizations.colors.primary, fontFamily: customizations.fonts.heading }">Services</h3>
                <ul :style="{ fontFamily: customizations.fonts.body }">
                  <li
                    v-for="(service, index) in selectedTemplate.content.services"
                    :key="index"
                  >
                    {{ service }}
                  </li>
                </ul>
              </div>

              <div
                v-if="customizations.businessInfo.showAddress || customizations.businessInfo.showPhone || customizations.businessInfo.showEmail"
                class="template-section"
              >
                <h3 :style="{ color: customizations.colors.primary, fontFamily: customizations.fonts.heading }">Contact Us</h3>
                <div
                  class="contact-info"
                  :style="{ fontFamily: customizations.fonts.body }"
                >
                  <p v-if="customizations.businessInfo.showAddress">
                    <i class="fas fa-map-marker-alt"></i> 123 Business Street, City, Country
                  </p>
                  <p v-if="customizations.businessInfo.showPhone">
                    <i class="fas fa-phone"></i> +1 (123) 456-7890
                  </p>
                  <p v-if="customizations.businessInfo.showEmail">
                    <i class="fas fa-envelope"></i> contact@business.com
                  </p>
                </div>
              </div>

              <div
                v-if="customizations.businessInfo.showHours"
                class="template-section"
              >
                <h3 :style="{ color: customizations.colors.primary, fontFamily: customizations.fonts.heading }">Business Hours</h3>
                <div
                  class="hours-info"
                  :style="{ fontFamily: customizations.fonts.body }"
                >
                  <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                  <p>Saturday: 10:00 AM - 4:00 PM</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="selectedTemplate"
          class="customization-panel"
        >
          <h3>Customize Template</h3>

          <div class="customization-section">
            <h4>Colors</h4>
            <div class="color-pickers">
              <div class="color-picker">
                <label for="primary-color">Primary</label>
                <input
                  type="color"
                  id="primary-color"
                  v-model="customizations.colors.primary"
                  @change="updateColor('primary', $event.target.value)"
                />
              </div>

              <div class="color-picker">
                <label for="secondary-color">Secondary</label>
                <input
                  type="color"
                  id="secondary-color"
                  v-model="customizations.colors.secondary"
                  @change="updateColor('secondary', $event.target.value)"
                />
              </div>

              <div class="color-picker">
                <label for="text-color">Text</label>
                <input
                  type="color"
                  id="text-color"
                  v-model="customizations.colors.text"
                  @change="updateColor('text', $event.target.value)"
                />
              </div>

              <div class="color-picker">
                <label for="background-color">Background</label>
                <input
                  type="color"
                  id="background-color"
                  v-model="customizations.colors.background"
                  @change="updateColor('background', $event.target.value)"
                />
              </div>
            </div>
          </div>

          <div class="customization-section">
            <h4>Fonts</h4>
            <div class="font-selectors">
              <div class="font-selector">
                <label for="heading-font">Headings</label>
                <select
                  id="heading-font"
                  v-model="customizations.fonts.heading"
                  @change="updateFont('heading', $event.target.value)"
                >
                  <option value="Montserrat">Montserrat</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Lato">Lato</option>
                  <option value="Playfair Display">Playfair Display</option>
                </select>
              </div>

              <div class="font-selector">
                <label for="body-font">Body Text</label>
                <select
                  id="body-font"
                  v-model="customizations.fonts.body"
                  @change="updateFont('body', $event.target.value)"
                >
                  <option value="Open Sans">Open Sans</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Lato">Lato</option>
                  <option value="Montserrat">Montserrat</option>
                  <option value="Source Sans Pro">Source Sans Pro</option>
                </select>
              </div>
            </div>
          </div>

          <div class="customization-section">
            <h4>Logo</h4>
            <div class="logo-upload">
              <input
                type="file"
                id="logo-upload"
                accept="image/*"
                @change="uploadLogo"
              />
              <label
                for="logo-upload"
                class="upload-btn"
              >
                <i class="fas fa-upload"></i>
                Upload Logo
              </label>
            </div>
          </div>

          <div class="customization-section">
            <h4>Business Information</h4>
            <div class="info-toggles">
              <div class="info-toggle">
                <input
                  type="checkbox"
                  id="show-address"
                  v-model="customizations.businessInfo.showAddress"
                  @change="toggleBusinessInfo('showAddress')"
                />
                <label for="show-address">Show Address</label>
              </div>

              <div class="info-toggle">
                <input
                  type="checkbox"
                  id="show-phone"
                  v-model="customizations.businessInfo.showPhone"
                  @change="toggleBusinessInfo('showPhone')"
                />
                <label for="show-phone">Show Phone</label>
              </div>

              <div class="info-toggle">
                <input
                  type="checkbox"
                  id="show-email"
                  v-model="customizations.businessInfo.showEmail"
                  @change="toggleBusinessInfo('showEmail')"
                />
                <label for="show-email">Show Email</label>
              </div>

              <div class="info-toggle">
                <input
                  type="checkbox"
                  id="show-hours"
                  v-model="customizations.businessInfo.showHours"
                  @change="toggleBusinessInfo('showHours')"
                />
                <label for="show-hours">Show Business Hours</label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useBusinessStore } from "@/stores/business";
import { useToast } from "@/composables/useToast";

// Removed Template interface and unused types

// Removed templates data

// Initialize router
const router = useRouter();

// Initialize business store
const businessStore = useBusinessStore();

// Initialize toast
const toast = useToast();

// Initialize component
onMounted(() => {
  // Component initialization
});

// State
const activeTab = ref("ai-generator");
const isCapturing = ref(false);
const importedScreenshot = ref<string | null>(null);
const aiGeneratorFrame = ref<HTMLIFrameElement | null>(null);
const deployedSiteFrame = ref<HTMLIFrameElement | null>(null);
const currentStep = ref(0); // Start at step 0 (prospect selection)
const deployedUrl = ref("");
const screenshotName = ref("");
const screenshotProject = ref("");
const screenshotTags = ref("");
const captureOptions = reactive({
  fullPage: true,
  useDelay: false,
});

// Prospect selection state
const prospectSearch = ref("");
const prospectFilter = ref("all");
const selectedProspect = ref<Prospect | null>(null);
const showProspectDetails = ref(false);

// Iframe view state
const iframeView = ref("normal");
const fullpageFrame = ref<HTMLIFrameElement | null>(null);
const selectedDevice = ref("desktop");

// Drag and drop state
const dragOver = ref(false);

// Device presets for fullpage view
interface Device {
  name: string;
  width: number;
  height: number;
  icon: string;
}

const devices: Device[] = [
  { name: "mobile", width: 375, height: 667, icon: "fas fa-mobile-alt" },
  { name: "tablet", width: 768, height: 1024, icon: "fas fa-tablet-alt" },
  { name: "laptop", width: 1366, height: 768, icon: "fas fa-laptop" },
  { name: "desktop", width: 1920, height: 1080, icon: "fas fa-desktop" },
];

// Sample prospects data (in a real app, this would come from an API)
interface Prospect {
  id: string;
  name: string;
  type: "company" | "individual";
  details: string;
  contact?: string;
  website?: string;
  address?: string;
  industry?: string;
  notes?: string;
  services?: string[];
  products?: string[];
  history?: string;
  founded?: string;
  employees?: string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  deployedSites?: {
    url: string;
    name: string;
    date: string;
    screenshot?: string;
  }[];
}

const prospects: Prospect[] = [
  {
    id: "1",
    name: "Acme Corporation",
    type: "company",
    details:
      "Software development company specializing in AI solutions and custom enterprise software. We help businesses transform their operations with cutting-edge technology.",
    contact: "john@acme.com",
    website: "https://acme.com",
    address: "123 Tech Street, San Francisco, CA",
    industry: "Technology",
    notes:
      "Interested in website redesign with focus on showcasing their AI capabilities",
    founded: "2010",
    employees: "50-100",
    services: [
      "Custom Software Development",
      "AI Solutions",
      "Enterprise Applications",
      "Cloud Migration",
      "Technical Consulting",
    ],
    products: [
      "AcmeAI - Artificial Intelligence Platform",
      "DataSense - Business Intelligence Tool",
      "CloudMigrate - Migration Solution",
    ],
    history:
      "Founded in 2010 by John Smith and Sarah Chen, Acme Corporation has grown from a small startup to a leading provider of AI solutions for enterprise clients.",
    socialMedia: {
      linkedin: "https://linkedin.com/company/acme-corp",
      twitter: "https://twitter.com/acmecorp",
    },
    deployedSites: [
      {
        url: "https://acme-ai-platform.static.hf.space/index.html",
        name: "AI Platform Landing Page",
        date: "2023-05-15",
      },
    ],
  },
  {
    id: "2",
    name: "Global Innovations",
    type: "company",
    details:
      "Research and development firm focused on renewable energy solutions and sustainable technologies. We're committed to creating a greener future through innovation.",
    contact: "contact@globalinnovations.com",
    website: "https://globalinnovations.com",
    address: "456 Science Ave, Boston, MA",
    industry: "Energy",
    notes:
      "Looking for a modern website to showcase their research and attract investment",
    founded: "2015",
    employees: "20-50",
    services: [
      "Renewable Energy Research",
      "Sustainable Technology Development",
      "Environmental Consulting",
      "Green Building Design",
    ],
    products: [
      "SolarMax - High-efficiency Solar Panels",
      "WindPro - Compact Wind Turbines",
      "EcoStorage - Energy Storage Solutions",
    ],
    history:
      "Global Innovations was established in 2015 with a mission to accelerate the transition to renewable energy through innovative research and practical solutions.",
    socialMedia: {
      linkedin: "https://linkedin.com/company/global-innovations",
      twitter: "https://twitter.com/globalinnovate",
      instagram: "https://instagram.com/globalinnovations",
    },
  },
  {
    id: "3",
    name: "Sarah Johnson",
    type: "individual",
    details:
      "Freelance graphic designer with 10+ years of experience specializing in brand identity, packaging design, and digital marketing materials.",
    contact: "sarah@designportfolio.com",
    website: "https://sarahjohnsondesign.com",
    address: "789 Creative Blvd, Portland, OR",
    industry: "Design",
    notes:
      "Needs a portfolio website that showcases her work in an elegant, minimalist style",
    services: [
      "Brand Identity Design",
      "Packaging Design",
      "Digital Marketing Materials",
      "Website Design",
      "Print Design",
    ],
    socialMedia: {
      instagram: "https://instagram.com/sarahjohnsondesign",
      linkedin: "https://linkedin.com/in/sarahjohnsondesign",
    },
  },
  {
    id: "4",
    name: "EcoFriendly Solutions",
    type: "company",
    details:
      "Sustainable product manufacturer and retailer offering a wide range of eco-friendly household items, personal care products, and zero-waste alternatives.",
    contact: "info@ecofriendly.com",
    website: "https://ecofriendlysolutions.com",
    address: "101 Green Street, Austin, TX",
    industry: "Retail",
    notes:
      "Want to improve their online presence and implement e-commerce functionality",
    founded: "2018",
    employees: "10-20",
    products: [
      "EcoClean - Natural Cleaning Products",
      "GreenHome - Sustainable Household Items",
      "ZeroWaste - Plastic-Free Alternatives",
      "NatureCare - Organic Personal Care",
    ],
    history:
      "EcoFriendly Solutions was founded in 2018 by Emma Green, who was frustrated by the lack of truly sustainable options in everyday products.",
    socialMedia: {
      instagram: "https://instagram.com/ecofriendlysolutions",
      facebook: "https://facebook.com/ecofriendlysolutions",
      twitter: "https://twitter.com/ecofriendly",
    },
    deployedSites: [
      {
        url: "https://ecofriendly-products.static.hf.space/index.html",
        name: "Product Catalog",
        date: "2023-06-22",
      },
    ],
  },
  {
    id: "5",
    name: "Michael Chen",
    type: "individual",
    details:
      "Professional photographer specializing in wildlife photography with a focus on endangered species conservation. My work has been featured in National Geographic and BBC Wildlife.",
    contact: "michael@wildlifephotos.com",
    website: "https://michaelchenphotography.com",
    address: "202 Nature Way, Denver, CO",
    industry: "Photography",
    notes:
      "Needs a gallery-focused website that highlights his photography work",
    services: [
      "Wildlife Photography",
      "Conservation Documentation",
      "Photography Workshops",
      "Print Sales",
    ],
    socialMedia: {
      instagram: "https://instagram.com/michaelchenwildlife",
      facebook: "https://facebook.com/michaelchenphotography",
    },
  },
  {
    id: "6",
    name: "Healthy Bites Café",
    type: "company",
    details:
      "Organic café and juice bar with three locations offering nutritious meals, fresh juices, smoothies, and plant-based options in a welcoming atmosphere.",
    contact: "hello@healthybites.com",
    website: "https://healthybitescafe.com",
    address: "303 Nutrition Ave, Miami, FL",
    industry: "Food & Beverage",
    notes:
      "Looking to update their website with online ordering and delivery options",
    founded: "2019",
    employees: "20-30",
    services: [
      "Dine-in Service",
      "Takeout",
      "Catering",
      "Nutrition Consulting",
    ],
    products: [
      "Fresh Organic Juices",
      "Superfood Smoothies",
      "Plant-based Meals",
      "Gluten-free Baked Goods",
      "Organic Coffee & Tea",
    ],
    history:
      "Healthy Bites Café was founded in 2019 by nutritionist Lisa Martinez and chef David Kim with a mission to make healthy eating delicious and accessible.",
    socialMedia: {
      instagram: "https://instagram.com/healthybitescafe",
      facebook: "https://facebook.com/healthybitescafe",
    },
  },
];

// Filtered prospects based on search and filter
const filteredProspects = ref<Prospect[]>(prospects);

// Computed properties
const isValidUrl = computed(() => {
  const url = deployedUrl.value.trim();
  return (
    url.includes(".static.hf.space/") &&
    (url.endsWith(".html") || url.endsWith("/"))
  );
});

const customizations = reactive({
  colors: {
    primary: "#4f46e5",
    secondary: "#10b981",
    text: "#111827",
    background: "#ffffff",
  },
  fonts: {
    heading: "Montserrat",
    body: "Open Sans",
  },
  logo: null as string | null,
  businessInfo: {
    showAddress: true,
    showPhone: true,
    showEmail: true,
    showHours: true,
  },
});

// Methods - removed template-related methods

// Prospect selection functions
const selectProspect = (prospect: Prospect) => {
  selectedProspect.value = prospect;
};

const viewProspectDetails = (prospect: Prospect) => {
  // In a real app, this would open a modal with detailed information
  toast.info(`
    Name: ${prospect.name}
    Type: ${prospect.type}
    Contact: ${prospect.contact || "N/A"}
    Website: ${prospect.website || "N/A"}
    Address: ${prospect.address || "N/A"}
    Industry: ${prospect.industry || "N/A"}
    Notes: ${prospect.notes || "N/A"}
  `);
};

const filterProspects = () => {
  const search = prospectSearch.value.toLowerCase();
  const filter = prospectFilter.value;

  filteredProspects.value = prospects.filter((prospect) => {
    // Apply search filter
    const matchesSearch =
      prospect.name.toLowerCase().includes(search) ||
      prospect.details.toLowerCase().includes(search) ||
      (prospect.industry && prospect.industry.toLowerCase().includes(search));

    // Apply type filter
    const matchesType =
      filter === "all" ||
      (filter === "company" && prospect.type === "company") ||
      (filter === "individual" && prospect.type === "individual") ||
      (filter === "recent" && parseInt(prospect.id) > 3); // Just for demo purposes

    return matchesSearch && matchesType;
  });
};

const resetFilters = () => {
  prospectSearch.value = "";
  prospectFilter.value = "all";
  filteredProspects.value = prospects;
};

// Function to navigate between steps
const goToStep = (step: number) => {
  currentStep.value = step;
};

// Function to validate URL and proceed to next step
const validateAndProceed = () => {
  if (isValidUrl.value) {
    // Clean up URL if needed
    const url = deployedUrl.value.trim();
    deployedUrl.value = url;
    // Go directly to capture step (now step 2)
    goToStep(3);
  } else {
    toast.error(
      "Please enter a valid Hugging Face static URL (ending with .static.hf.space/index.html)"
    );
  }
};

// Function to select device for fullpage view
const selectDevice = (deviceName: string) => {
  selectedDevice.value = deviceName;
};

// Function to get device info text
const getDeviceInfo = (): string => {
  const device = devices.find((d) => d.name === selectedDevice.value);
  if (!device) return "";
  return `${device.width} × ${device.height}`;
};

// Function to get device style for iframe wrapper
const getDeviceStyle = () => {
  const device = devices.find((d) => d.name === selectedDevice.value);
  if (!device) return {};

  return {
    width: `${device.width}px`,
    height: `${device.height}px`,
    maxWidth: "100%",
    maxHeight: "600px",
  };
};

// Screenshot functions removed - we now use GoFullPage extension instead

// Function to download screenshot in specified format
const downloadScreenshot = (format: "jpeg" | "png") => {
  if (!importedScreenshot.value) return;

  // Create a temporary canvas to convert the image if needed
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw the image on the canvas
    ctx.drawImage(img, 0, 0);

    // Convert to the requested format
    const mimeType = format === "jpeg" ? "image/jpeg" : "image/png";
    const quality = format === "jpeg" ? 0.9 : undefined;
    const dataUrl = canvas.toDataURL(mimeType, quality);

    // Create a download link
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${screenshotName.value || "website-screenshot"}.${format}`;

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  img.src = importedScreenshot.value;
};

// Function to save screenshot to project
const saveScreenshot = async () => {
  if (!importedScreenshot.value) return;

  // Validate form
  if (!screenshotName.value) {
    toast.error("Please enter a name for your screenshot");
    return;
  }

  // Only require project selection if no prospect is selected
  if (!selectedProspect.value && !screenshotProject.value) {
    toast.error("Please select a project");
    return;
  }

  try {
    // In a real implementation, this would send the screenshot to the server
    // For now, we'll simulate a successful save

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // If we have a selected prospect, associate the screenshot with it
    if (selectedProspect.value) {
      // Create deployedSites array if it doesn't exist
      if (!selectedProspect.value.deployedSites) {
        selectedProspect.value.deployedSites = [];
      }

      // Add the new site to the prospect's deployedSites
      selectedProspect.value.deployedSites.push({
        url: deployedUrl.value,
        name: screenshotName.value,
        date: new Date().toISOString().split("T")[0], // Current date in YYYY-MM-DD format
        screenshot: importedScreenshot.value,
      });

      // Create a new business object with the prospect data
      const newBusiness = {
        _id: selectedProspect.value.id,
        name: selectedProspect.value.name,
        address: {
          city: selectedProspect.value.address
            ? selectedProspect.value.address.split(",")[1]?.trim() || "Unknown"
            : "Unknown",
          country: "France",
        },
        contact: {
          email: selectedProspect.value.contact || "",
          website: selectedProspect.value.website || "",
        },
        business: {
          type: selectedProspect.value.industry || "Other",
        },
        websiteGeneration: {
          status: "generated",
          previewLink: deployedUrl.value,
          previewScreenshot: importedScreenshot.value,
          generatedAt: new Date().toISOString(),
          apiSource: "deepsite",
        },
      };

      // Add the new business to the store
      try {
        // Check if the business already exists in the store
        const existingBusiness = businessStore.businesses.find(
          (b) => b._id === newBusiness._id
        );

        if (existingBusiness) {
          // Update existing business
          await businessStore.updateBusiness(newBusiness._id, {
            websiteGeneration: newBusiness.websiteGeneration,
          });
        } else {
          // Create new business
          await businessStore.createBusiness(newBusiness);
        }

        // Show success message
        toast.success(
          `Screenshot "${screenshotName.value}" saved successfully to prospect "${selectedProspect.value.name}"!`
        );
      } catch (storeError) {
        console.error("Error updating business store:", storeError);
        toast.error(
          "Failed to update business store, but screenshot was saved locally."
        );
      }
    } else {
      // Show generic success message
      toast.success(
        `Screenshot "${screenshotName.value}" saved successfully to project!`
      );
    }
  } catch (error) {
    console.error("Error saving screenshot:", error);
    toast.error("Failed to save screenshot. Please try again.");
  }
};

// Legacy function for backward compatibility
const captureScreenshot = async () => {
  toast.info(
    "Please follow the step-by-step process to generate, deploy, and capture your website using the GoFullPage extension."
  );
};

// Function to copy text to clipboard
const copyToClipboard = (text: string) => {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      // Show a temporary success message
      const button = document.querySelector(".btn-copy");
      if (button) {
        const originalHTML = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => {
          button.innerHTML = originalHTML;
        }, 2000);
      }
    })
    .catch((err) => {
      console.error("Failed to copy text: ", err);
      toast.error("Failed to copy to clipboard");
    });
};

// Function to toggle prospect details dropdown
const toggleProspectDetails = () => {
  showProspectDetails.value = !showProspectDetails.value;
};

// Function to open the website in a new tab for screenshot
const openPreviewInNewTab = () => {
  if (!deployedUrl.value) {
    toast.error("Please enter a valid URL first");
    return;
  }

  // Open the deployed URL directly in a new tab
  window.open(deployedUrl.value, "_blank");

  // No alert message needed anymore
};

// This function has been removed as we're now using the Chrome extension for screenshots

// Function to copy all prospect details to clipboard
const copyProspectToClipboard = () => {
  if (!selectedProspect.value) return;

  // Create a formatted text with all prospect details
  const prospect = selectedProspect.value;
  let text = `Name: ${prospect.name}\n`;
  text += `Type: ${prospect.type}\n`;

  if (prospect.industry) text += `Industry: ${prospect.industry}\n`;
  if (prospect.contact) text += `Contact: ${prospect.contact}\n`;
  if (prospect.website) text += `Website: ${prospect.website}\n`;
  if (prospect.address) text += `Address: ${prospect.address}\n`;
  if (prospect.founded) text += `Founded: ${prospect.founded}\n`;
  if (prospect.employees) text += `Employees: ${prospect.employees}\n`;

  text += `\nDescription: ${prospect.details}\n`;

  if (prospect.services && prospect.services.length > 0) {
    text += `\nServices:\n`;
    prospect.services.forEach((service) => {
      text += `- ${service}\n`;
    });
  }

  if (prospect.products && prospect.products.length > 0) {
    text += `\nProducts:\n`;
    prospect.products.forEach((product) => {
      text += `- ${product}\n`;
    });
  }

  if (prospect.history) text += `\nCompany History: ${prospect.history}\n`;
  if (prospect.notes) text += `\nNotes: ${prospect.notes}\n`;

  // Copy to clipboard
  navigator.clipboard
    .writeText(text)
    .then(() => {
      // Show a temporary success message
      const button = document.querySelector(".dropdown-actions .btn.primary");
      if (button) {
        const originalHTML = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => {
          button.innerHTML = originalHTML;
        }, 2000);
      }
    })
    .catch((err) => {
      console.error("Failed to copy text: ", err);
      toast.error("Failed to copy to clipboard");
    });
};

// Function to import screenshot
const importScreenshot = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
    processScreenshotFile(file);

    // Reset the input so the same file can be selected again
    target.value = "";
  }
};

// Function to handle drag and drop
const handleDrop = (event: DragEvent) => {
  dragOver.value = false;

  // Prevent default behavior
  event.preventDefault();

  // Get the dropped files
  const files = event.dataTransfer?.files;

  if (files && files.length > 0) {
    // Process the first file
    const file = files[0];

    // Check if it's an image
    if (file.type.startsWith("image/")) {
      processScreenshotFile(file);
    } else {
      toast.error("Please drop an image file");
    }
  }
};

// Function to process screenshot file
const processScreenshotFile = (file: File) => {
  const reader = new FileReader();
  reader.onload = (e: ProgressEvent<FileReader>) => {
    importedScreenshot.value = e.target?.result as string;

    // Set screenshot name based on file name if not already set
    if (!screenshotName.value) {
      screenshotName.value = file.name.split(".")[0];
    }

    // Move to step 4 after successful upload
    goToStep(4);
  };
  reader.readAsDataURL(file);
};

// Function to clear imported screenshot
const clearImportedScreenshot = () => {
  importedScreenshot.value = null;

  // Reset the file input
  const fileInput = document.getElementById(
    "screenshot-upload"
  ) as HTMLInputElement;
  if (fileInput) {
    fileInput.value = "";
  }
};

// Function to use imported screenshot as template
const useAsTemplate = () => {
  if (!importedScreenshot.value) return;

  // Save the screenshot to the database (in a real app)
  console.log("Screenshot saved:", importedScreenshot.value);

  toast.success("Screenshot saved successfully!");
};
</script>

<style scoped>
.site-designer {
  width: 100%;
  padding: 20px;
}

.designer-header {
  margin-bottom: 24px;
}

.designer-header h1 {
  margin-bottom: 8px;
  font-size: 24px;
  font-weight: 600;
  color: #111827;
}

.subtitle {
  color: #6b7280;
  font-size: 16px;
}

.designer-header-subtitle {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
  font-size: 18px;
  font-weight: 500;
  color: #4f46e5;
}

.designer-container {
  display: flex;
  gap: 24px;
}

.designer-container.ai-generator-active {
  display: block;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
}

.ai-generator-panel {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 16px;
  flex: 1;
  width: 100%;
  max-width: 100%;
}

.ai-generator-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.ai-generator-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

/* Removed unused styles for screenshot button */

.workflow-steps {
  margin-bottom: 24px;
}

.step-indicator {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.step-number {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #e5e7eb;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-bottom: 8px;
  transition: all 0.3s;
}

.step.active .step-number {
  background-color: #4f46e5;
  color: white;
}

.step.completed .step-number {
  background-color: #10b981;
  color: white;
}

.step-label {
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  transition: all 0.3s;
}

.step.active .step-label {
  color: #4f46e5;
  font-weight: 600;
}

.step.completed .step-label {
  color: #10b981;
  font-weight: 600;
}

.step-connector {
  flex: 1;
  height: 2px;
  background-color: #e5e7eb;
  margin: 0 8px;
  position: relative;
  top: -10px;
}

.info-note {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  margin-bottom: 16px;
  background-color: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 6px;
  color: #0c4a6e;
  font-size: 14px;
  line-height: 1.5;
}

.info-note i {
  color: #0ea5e9;
  font-size: 16px;
  flex-shrink: 0;
}

.prospect-selection {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.search-filter {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.search-input {
  flex: 1;
  position: relative;
}

.search-input i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.search-input input {
  width: 100%;
  padding: 10px 12px 10px 36px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 16px;
}

.filter-options select {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 16px;
  background-color: white;
  min-width: 180px;
}

.prospects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.prospect-card {
  display: flex;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.prospect-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.prospect-card.selected {
  border-color: #4f46e5;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
}

.prospect-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background-color: #f3f4f6;
  border-radius: 8px;
  margin-right: 16px;
  flex-shrink: 0;
}

.prospect-icon i {
  font-size: 20px;
  color: #4b5563;
}

.prospect-info {
  flex: 1;
  min-width: 0;
}

.prospect-info h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.prospect-type {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #6b7280;
}

.prospect-details {
  margin: 0;
  font-size: 14px;
  color: #4b5563;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.prospect-actions {
  display: flex;
  align-items: center;
  margin-left: 8px;
}

.btn-view {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: none;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-view:hover {
  background-color: #f3f4f6;
  color: #4b5563;
}

.no-prospects {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  background-color: #f9fafb;
  border: 1px dashed #d1d5db;
  border-radius: 8px;
  text-align: center;
}

.no-prospects i {
  font-size: 32px;
  color: #9ca3af;
  margin-bottom: 16px;
}

.no-prospects p {
  margin: 0 0 16px 0;
  color: #6b7280;
}

.selected-prospect-details {
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  margin-top: 24px;
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.details-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.btn-change {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background-color: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-change:hover {
  background-color: #e5e7eb;
}

.prospect-card-large {
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
}

.prospect-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.prospect-icon-large {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background-color: #f3f4f6;
  border-radius: 12px;
  margin-right: 16px;
  flex-shrink: 0;
}

.prospect-icon-large i {
  font-size: 28px;
  color: #4b5563;
}

.prospect-title {
  flex: 1;
}

.prospect-title h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.prospect-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}

.prospect-badge.company {
  background-color: #dbeafe;
  color: #1e40af;
}

.prospect-badge.individual {
  background-color: #fef3c7;
  color: #92400e;
}

.prospect-data-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.data-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.data-label {
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 8px;
}

.data-value {
  font-size: 16px;
  color: #111827;
}

.prospect-details-section {
  margin-bottom: 16px;
}

.details-label {
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 8px;
}

.details-value {
  font-size: 16px;
  color: #111827;
  line-height: 1.5;
}

.services-list,
.products-list {
  margin: 0;
  padding-left: 20px;
}

.services-list li,
.products-list li {
  margin-bottom: 8px;
  color: #111827;
}

.prospect-selection-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
}

.associated-prospect {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  margin-bottom: 8px;
}

.prospect-icon-small {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background-color: #f3f4f6;
  border-radius: 6px;
  flex-shrink: 0;
}

.prospect-icon-small i {
  font-size: 16px;
  color: #4b5563;
}

.prospect-info-small {
  flex: 1;
}

.prospect-name {
  font-weight: 600;
  color: #111827;
  margin-bottom: 2px;
}

/* Use more specific selector to avoid conflicts */
.prospect-info-small .prospect-type {
  font-size: 12px;
  color: #6b7280;
}

.url-display {
  display: flex;
  align-items: center;
}

.url-display input {
  flex: 1;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  border-right: none;
}

.btn-copy {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: #f3f4f6;
  border: 1px solid #d1d5db;
  border-left: none;
  border-top-right-radius: 6px;
  border-bottom-right-radius: 6px;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-copy:hover {
  background-color: #e5e7eb;
  color: #111827;
}

.deployment-notice {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
  padding: 16px;
  background-color: #fffbeb;
  border: 1px solid #fcd34d;
  border-radius: 8px;
}

.deployment-notice .notice-icon {
  font-size: 24px;
  color: #d97706;
  animation: bounce 2s infinite;
}

.notice-text {
  color: #92400e;
  font-weight: 500;
}

@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

.step-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 16px;
}

.btn.large {
  padding: 12px 24px;
  font-size: 16px;
}

.deployed-site-form {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 24px;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 8px;
  color: #111827;
}

.url-input-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.button-group {
  display: flex;
  gap: 12px;
}

.url-input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 16px;
}

.url-input:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
}

.url-help {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  color: #6b7280;
  font-size: 14px;
}

.url-help i {
  color: #9ca3af;
}

.url-help code {
  background-color: #f3f4f6;
  padding: 2px 4px;
  border-radius: 4px;
  font-family: monospace;
}

.example-help {
  margin-top: 32px;
  background-color: #f9fafb;
  border-radius: 8px;
  padding: 16px;
}

.example-help h4 {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.example-help ol {
  margin: 0;
  padding-left: 20px;
  margin-bottom: 16px;
}

.example-help li {
  margin-bottom: 8px;
  color: #4b5563;
}

.example-help code {
  background-color: #f3f4f6;
  padding: 2px 4px;
  border-radius: 4px;
  font-family: monospace;
}

.example-image {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
}

.example-image img {
  width: 100%;
  display: block;
}

.deployed-site-container {
  display: flex;
  flex-direction: column;
}

.extension-notice {
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  display: flex;
  gap: 16px;
}

.notice-icon {
  font-size: 24px;
  color: #3b82f6;
  flex-shrink: 0;
}

.notice-content {
  flex: 1;
}

.notice-content h3 {
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.notice-content p {
  margin-top: 0;
  margin-bottom: 16px;
  color: #4b5563;
}

.extension-options {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.extension-option {
  flex: 1;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  gap: 16px;
}

.extension-icon {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
}

.extension-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 8px;
}

.extension-details {
  flex: 1;
}

.extension-details h4 {
  margin-top: 0;
  margin-bottom: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.extension-details p {
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 14px;
  color: #4b5563;
}

.extension-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: #3b82f6;
  color: white;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: background-color 0.2s;
}

.extension-link:hover {
  background-color: #2563eb;
}

.extension-instructions {
  background-color: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  padding: 16px;
}

.extension-instructions h4 {
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 600;
  color: #0c4a6e;
}

.extension-instructions ol {
  margin: 0;
  padding-left: 24px;
}

.extension-instructions li {
  margin-bottom: 8px;
  color: #0c4a6e;
}

.open-site-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #3b82f6;
  font-weight: 500;
  text-decoration: none;
}

.open-site-link:hover {
  text-decoration: underline;
}

.upload-section {
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 24px;
}

.upload-section h3 {
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.upload-instructions {
  margin-top: 0;
  margin-bottom: 16px;
  color: #4b5563;
  font-size: 15px;
  line-height: 1.5;
}

.upload-container {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.upload-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background-color: #f3f4f6;
  color: #374151;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-btn:hover {
  background-color: #e5e7eb;
  border-color: #9ca3af;
}

.hidden-input {
  display: none;
}

.drag-drop-area {
  width: 100%;
  height: 160px;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  transition: all 0.3s;
  background-color: #f9fafb;
  cursor: pointer;
}

.drag-drop-area i {
  font-size: 32px;
  color: #9ca3af;
  margin-bottom: 12px;
}

.drag-drop-area p {
  color: #6b7280;
  font-size: 16px;
  margin: 0;
}

.drag-drop-instructions {
  margin-top: 12px;
  text-align: center;
}

.drag-drop-instructions p {
  color: #9ca3af;
  font-size: 14px;
  margin: 4px 0;
}

.drag-over {
  border-color: #4f46e5;
  background-color: rgba(79, 70, 229, 0.05);
}

.preview-iframe {
  margin-top: 24px;
}

.preview-iframe h4 {
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.iframe-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.iframe-options {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.option label {
  font-size: 14px;
  color: #4b5563;
  cursor: pointer;
}

.normal-iframe-container {
  margin-bottom: 16px;
}

.fullpage-iframe-container {
  margin-bottom: 16px;
}

.fullpage-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 8px 8px 0 0;
}

.device-selector {
  display: flex;
  gap: 8px;
}

.device-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: none;
  border: 1px solid transparent;
  border-radius: 4px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.device-button:hover {
  background-color: #e5e7eb;
  color: #111827;
}

.device-button.active {
  background-color: #e5e7eb;
  border-color: #d1d5db;
  color: #111827;
}

.device-info {
  font-size: 14px;
  color: #6b7280;
}

.fullpage-iframe-wrapper {
  height: 600px;
  border: 1px solid #e5e7eb;
  border-top: none;
  border-radius: 0 0 8px 8px;
  overflow: hidden;
  margin: 0 auto;
  transition: all 0.3s;
}

.iframe-note {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 12px;
  background-color: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 6px;
  font-size: 14px;
  color: #0c4a6e;
}

.iframe-note i {
  color: #0ea5e9;
}

.screenshot-editor {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 24px;
}

.editor-header {
  margin-bottom: 24px;
  text-align: center;
}

.editor-header h3 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #111827;
}

.editor-subtitle {
  color: #6b7280;
  font-size: 16px;
  margin: 0;
}

.editor-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.form-input,
.form-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 16px;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
}

.form-help {
  margin-top: 4px;
  font-size: 14px;
  color: #6b7280;
}

.screenshot-preview-container {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 24px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.preview-header span {
  font-weight: 500;
  color: #374151;
}

.preview-actions {
  display: flex;
  gap: 8px;
}

.preview-action {
  background: none;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 14px;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.2s;
}

.preview-action:hover {
  background-color: #f3f4f6;
  border-color: #9ca3af;
}

.editor-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.ai-generator-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.prospect-summary-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-bottom: 0;
}

.prospect-summary-bar:hover {
  background-color: #f3f4f6;
}

.summary-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.summary-text {
  display: flex;
  flex-direction: column;
}

.summary-title {
  font-weight: 600;
  color: #111827;
  font-size: 16px;
}

.summary-subtitle {
  color: #6b7280;
  font-size: 14px;
}

.summary-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
}

.prospect-details-dropdown {
  background-color: white;
  border: 1px solid #e5e7eb;
  border-top: none;
  border-radius: 0 0 8px 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.dropdown-section {
  margin-bottom: 16px;
}

.dropdown-section h4 {
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 8px;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-label {
  font-size: 14px;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-value {
  font-size: 15px;
  color: #111827;
}

.dropdown-text {
  margin: 0;
  line-height: 1.6;
  color: #374151;
}

.dropdown-list {
  margin: 0;
  padding-left: 24px;
}

.dropdown-list li {
  margin-bottom: 8px;
  color: #374151;
}

.dropdown-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.ai-generator-container {
  border: 1px solid #e5e7eb;
  border-radius: 0 0 8px 8px;
  overflow-x: auto;
  overflow-y: hidden;
  height: 800px;
  margin-bottom: 24px;
  position: relative;
  width: 100%;
}

.ai-generator-container iframe {
  display: block;
  transform-origin: 0 0;
}

.deployment-button-container {
  display: flex;
  justify-content: center;
  margin: 20px 0 40px 0;
}

.deployment-button {
  background-color: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 16px 32px;
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.deployment-button:hover {
  background-color: #059669;
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
}

.deployment-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.deployment-button i {
  font-size: 20px;
}

.info-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  background-color: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  padding: 16px;
}

.info-icon {
  font-size: 24px;
  color: #0ea5e9;
  margin-top: 2px;
}

.info-content h3 {
  margin-top: 0;
  margin-bottom: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #0369a1;
}

.info-content p {
  margin: 0;
  color: #0c4a6e;
  line-height: 1.5;
}

.steps-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.step-item {
  display: flex;
  gap: 16px;
}

/* This selector is now defined in the workflow steps section */

.step-content {
  flex: 1;
}

.step-content h4 {
  margin-top: 0;
  margin-bottom: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.step-content p {
  margin: 0 0 16px 0;
  color: #4b5563;
  line-height: 1.5;
}

.open-external-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background-color: #4f46e5;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.open-external-btn:hover {
  background-color: #4338ca;
}

.screenshot-tips {
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 16px;
  margin-top: 16px;
}

.screenshot-tips h5 {
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.screenshot-tips ul {
  margin: 0;
  padding-left: 20px;
}

.screenshot-tips li {
  margin-bottom: 8px;
  color: #4b5563;
  line-height: 1.5;
}

.screenshot-tips ul ul {
  margin-top: 8px;
}

.screenshot-example {
  margin-top: 16px;
}

/* These selectors are now defined above */

.example-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
}

.left-panel,
.right-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 16px;
}

.left-panel {
  background-color: rgba(239, 68, 68, 0.2);
  border-right: 2px dashed rgba(239, 68, 68, 0.5);
}

.left-panel span {
  background-color: rgba(255, 255, 255, 0.8);
  padding: 8px 12px;
  border-radius: 4px;
  font-weight: 500;
  color: #b91c1c;
}

.right-panel {
  background-color: rgba(16, 185, 129, 0.2);
}

.right-panel span {
  background-color: rgba(255, 255, 255, 0.8);
  padding: 8px 12px;
  border-radius: 4px;
  font-weight: 500;
  color: #065f46;
}

/* Hidden input styles are defined earlier */

.imported-preview {
  margin-top: 24px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.imported-preview h3 {
  margin: 0;
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.screenshot-preview {
  padding: 16px;
  display: flex;
  justify-content: center;
}

.screenshot-preview img {
  max-width: 100%;
  max-height: 400px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
}

.screenshot-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px;
  border-top: 1px solid #e5e7eb;
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

.templates-panel {
  width: 300px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 16px;
}

.templates-panel h2 {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.templates-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.preview-panel {
  flex: 1;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 16px;
}

.preview-panel h2 {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

/* This selector is now defined above */

.save-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.save-btn:hover {
  background-color: #059669;
}

.preview-container {
  background-color: #f9fafb;
  border-radius: 8px;
  min-height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-bottom: 24px;
}

.no-template {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #9ca3af;
}

.no-template i {
  font-size: 48px;
  margin-bottom: 16px;
}

.template-preview-frame {
  width: 100%;
  height: 100%;
  min-height: 500px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.template-header {
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.template-logo {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
}

.template-logo img {
  max-width: 100%;
  max-height: 100%;
}

.placeholder-logo {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f3f4f6;
  color: #9ca3af;
  font-size: 24px;
}

.template-name {
  font-size: 24px;
  font-weight: 600;
}

.template-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.template-section {
  margin-bottom: 24px;
}

.template-section h3 {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 20px;
  font-weight: 600;
}

.template-section p {
  margin: 0 0 16px 0;
  line-height: 1.6;
}

.template-section ul {
  margin: 0;
  padding-left: 24px;
}

.template-section li {
  margin-bottom: 8px;
}

.contact-info p,
.hours-info p {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.customization-panel {
  background-color: #f9fafb;
  border-radius: 8px;
  padding: 16px;
}

.customization-panel h3 {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.customization-section {
  margin-bottom: 24px;
}

.customization-section h4 {
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 500;
  color: #374151;
}

.color-pickers {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
}

.color-picker {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.color-picker label {
  font-size: 14px;
  color: #4b5563;
}

.color-picker input[type="color"] {
  width: 100%;
  height: 40px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 2px;
  cursor: pointer;
}

.font-selectors {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.font-selector {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.font-selector label {
  font-size: 14px;
  color: #4b5563;
}

.font-selector select {
  width: 100%;
  padding: 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background-color: white;
  font-size: 14px;
}

.logo-upload {
  display: flex;
  align-items: center;
}

.logo-upload input[type="file"] {
  display: none;
}

/* Use more specific selector to avoid conflicts */
.logo-upload .upload-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: #e5e7eb;
  color: #374151;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.logo-upload .upload-btn:hover {
  background-color: #d1d5db;
}

.info-toggles {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.info-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-toggle input[type="checkbox"] {
  width: 16px;
  height: 16px;
}

.template-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.template-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.template-card.active {
  border-color: #4f46e5;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
}

.template-preview {
  height: 150px;
  overflow: hidden;
}

.template-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.template-info {
  padding: 12px;
}

.template-info h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 500;
  color: #111827;
}

.template-info p {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.4;
}

/* Responsive */
@media (max-width: 768px) {
  .designer-container {
    flex-direction: column;
  }

  .templates-panel {
    width: 100%;
  }

  .templates-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}
</style>