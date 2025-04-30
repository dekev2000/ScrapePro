<template>
  <div class="previews-list">
    <div class="previews-header">
      <h1>Preview Sites</h1>
      <div class="header-actions">
        <button
          class="refresh-btn"
          @click="fetchBusinesses"
        >
          <i class="fas fa-sync"></i>
          Refresh
        </button>
      </div>
    </div>

    <div class="filters">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search businesses..."
          @input="filterBusinesses"
        />
      </div>

      <div class="filter-group">
        <label for="statusFilter">Status:</label>
        <select
          id="statusFilter"
          v-model="statusFilter"
          @change="filterBusinesses"
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="generated">Generated</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div class="filter-group">
        <label for="cityFilter">City:</label>
        <select
          id="cityFilter"
          v-model="cityFilter"
          @change="filterBusinesses"
        >
          <option value="">All</option>
          <option
            v-for="city in cities"
            :key="city"
            :value="city"
          >{{ city }}</option>
        </select>
      </div>
    </div>

    <div
      v-if="loading"
      class="loading-state"
    >
      <i class="fas fa-spinner fa-spin"></i>
      <p>Loading preview sites...</p>
    </div>

    <div
      v-else-if="filteredBusinesses.length === 0"
      class="empty-state"
    >
      <i class="fas fa-desktop"></i>
      <h3>No preview sites found</h3>
      <p v-if="hasFilters">Try adjusting your filters or search query.</p>
      <p v-else>No businesses have website previews yet.</p>
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
            <th>Business Type</th>
            <th>Generated Date</th>
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
              <span :class="['status-badge', business.websiteGeneration.status]">
                {{ formatStatus(business.websiteGeneration.status) }}
              </span>
            </td>
            <td>{{ formatAddress(business.address) }}</td>
            <td>{{ business.business && business.business.type ? business.business.type : 'N/A' }}</td>
            <td>{{ business.websiteGeneration.generatedAt ? formatDate(business.websiteGeneration.generatedAt) : 'N/A' }}</td>
            <td>
              <a
                v-if="business.websiteGeneration.previewUrl || business.websiteGeneration.previewLink"
                :href="business.websiteGeneration.previewUrl || business.websiteGeneration.previewLink"
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
                  v-if="business.websiteGeneration.status === 'not_generated' || business.websiteGeneration.status === 'rejected'"
                  class="action-btn generate-btn"
                  @click="generatePreview(business)"
                  :disabled="generatingPreviews.includes(business._id)"
                  title="Generate Preview"
                >
                  <i class="fas fa-magic"></i>
                </button>

                <button
                  v-if="business.websiteGeneration.status === 'generated'"
                  class="action-btn validate-btn"
                  @click="validateButtonClick(business)"
                  title="Validate & Send Email"
                >
                  <i class="fas fa-check"></i>
                </button>

                <button
                  v-if="business.websiteGeneration.status === 'generated'"
                  class="action-btn reject-btn"
                  @click="showRejectModal(business)"
                  title="Reject"
                >
                  <i class="fas fa-times"></i>
                </button>

                <button
                  class="action-btn details-btn"
                  @click="viewBusinessDetails(business)"
                  title="Details"
                >
                  <i class="fas fa-info-circle"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Business Details Modal -->
    <Teleport to="body">
      <div
        v-if="showDetailsModal"
        class="modal"
        @click.self="showDetailsModal = false"
      >
        <div class="modal-content">
          <div class="modal-header">
            <h2>Business Details</h2>
            <button
              class="close-btn"
              @click="showDetailsModal = false"
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
                <span class="detail-label">Name:</span>
                <span class="detail-value">{{ selectedBusiness.name }}</span>
              </div>

              <div class="detail-row">
                <span class="detail-label">Address:</span>
                <span class="detail-value">{{ formatAddress(selectedBusiness.address) }}</span>
              </div>

              <div
                class="detail-row"
                v-if="selectedBusiness.business && selectedBusiness.business.type"
              >
                <span class="detail-label">Business Type:</span>
                <span class="detail-value">{{ selectedBusiness.business.type }}</span>
              </div>

              <div
                class="detail-row"
                v-if="selectedBusiness.contact && selectedBusiness.contact.phone"
              >
                <span class="detail-label">Phone:</span>
                <span class="detail-value">{{ selectedBusiness.contact.phone }}</span>
              </div>

              <div
                class="detail-row"
                v-if="selectedBusiness.contact && selectedBusiness.contact.email"
              >
                <span class="detail-label">Email:</span>
                <span class="detail-value">{{ selectedBusiness.contact.email }}</span>
              </div>

              <div
                class="detail-row"
                v-if="selectedBusiness.contact && selectedBusiness.contact.website"
              >
                <span class="detail-label">Website:</span>
                <span class="detail-value">
                  <a
                    :href="selectedBusiness.contact.website"
                    target="_blank"
                  >
                    {{ selectedBusiness.contact.website }}
                  </a>
                </span>
              </div>
            </div>

            <div class="detail-section">
              <h3>Preview Information</h3>
              <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span :class="['status-badge', selectedBusiness.websiteGeneration.status]">
                  {{ formatStatus(selectedBusiness.websiteGeneration.status) }}
                </span>
              </div>

              <div
                class="detail-row"
                v-if="selectedBusiness.websiteGeneration.generatedAt"
              >
                <span class="detail-label">Generated:</span>
                <span class="detail-value">{{ formatDateTime(selectedBusiness.websiteGeneration.generatedAt) }}</span>
              </div>

              <div
                class="detail-row"
                v-if="selectedBusiness.websiteGeneration.previewUrl || selectedBusiness.websiteGeneration.previewLink"
              >
                <span class="detail-label">Preview URL:</span>
                <span class="detail-value">
                  <a
                    :href="selectedBusiness.websiteGeneration.previewUrl || selectedBusiness.websiteGeneration.previewLink"
                    target="_blank"
                  >
                    {{ selectedBusiness.websiteGeneration.previewUrl || selectedBusiness.websiteGeneration.previewLink }}
                  </a>
                </span>
              </div>
            </div>

            <div
              class="detail-section"
              v-if="selectedBusiness.websiteGeneration.previewScreenshot"
            >
              <h3>Preview Screenshot</h3>
              <div class="preview-screenshot">
                <img
                  :src="selectedBusiness.websiteGeneration.previewScreenshot"
                  :alt="`${selectedBusiness.name} preview`"
                />
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button
              class="btn secondary"
              @click="showDetailsModal = false"
            >Close</button>
            <a
              v-if="selectedBusiness && (selectedBusiness.websiteGeneration.previewUrl || selectedBusiness.websiteGeneration.previewLink)"
              :href="selectedBusiness.websiteGeneration.previewUrl || selectedBusiness.websiteGeneration.previewLink"
              target="_blank"
              class="btn primary"
            >
              View Preview
            </a>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Reject Modal -->
    <Teleport to="body">
      <div
        v-if="showRejectReasonModal"
        class="modal"
        @click.self="showRejectReasonModal = false"
      >
        <div class="modal-content">
          <div class="modal-header">
            <h2>Reject Preview</h2>
            <button
              class="close-btn"
              @click="showRejectReasonModal = false"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="modal-body">
            <p>Please provide a reason for rejecting the preview for "{{ selectedBusiness?.name }}":</p>
            <textarea
              v-model="rejectReason"
              placeholder="Enter rejection reason..."
              class="reject-reason-input"
            ></textarea>
          </div>

          <div class="modal-footer">
            <button
              class="btn secondary"
              @click="showRejectReasonModal = false"
            >Cancel</button>
            <button
              class="btn danger"
              @click="rejectPreview"
              :disabled="!rejectReason.trim()"
            >
              Reject
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Validate & Send Email Modal -->
    <Teleport to="body">
      <div
        v-if="showEmailModal"
        class="modal"
        @click.self="closeEmailModal"
      >
        <div class="modal-content modal-lg">
          <div class="modal-header">
            <h2>Validate & Send Email</h2>
            <button
              class="close-btn"
              @click="closeEmailModal"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="modal-body">
            <div
              v-if="selectedBusiness"
              class="simple-email-form"
            >
              <div class="email-header">
                <div class="business-info">
                  <h3>Send Email to {{ selectedBusiness.name }}</h3>
                  <p class="business-address">{{ formatAddress(selectedBusiness.address) }}</p>
                </div>
                <div
                  class="website-preview"
                  v-if="selectedBusiness.websiteGeneration && (selectedBusiness.websiteGeneration.previewUrl || selectedBusiness.websiteGeneration.previewLink)"
                >
                  <a
                    :href="selectedBusiness.websiteGeneration.previewUrl || selectedBusiness.websiteGeneration.previewLink"
                    target="_blank"
                    class="preview-link"
                  >
                    <i class="fas fa-external-link-alt"></i> View Website
                  </a>
                </div>
              </div>

              <div class="form-section">
                <div class="form-group">
                  <label for="email-recipient">Recipient:</label>
                  <input
                    id="email-recipient"
                    type="email"
                    v-model="emailData.recipient"
                    class="form-control"
                    placeholder="client@example.com"
                  />
                </div>

                <div class="form-group">
                  <label for="email-subject">Subject:</label>
                  <input
                    id="email-subject"
                    type="text"
                    v-model="emailData.subject"
                    class="form-control"
                    placeholder="Your Website is Ready!"
                  />
                </div>
              </div>

              <div class="template-section">
                <div class="form-group">
                  <label for="email-template">Email Template:</label>
                  <select
                    id="email-template"
                    v-model="selectedTemplate"
                    class="form-control"
                    @change="applyTemplate"
                  >
                    <option value="">Select a template</option>
                    <option value="template1">Welcome Template</option>
                    <option value="template2">Website Ready Template</option>
                    <option value="template3">Follow-up Template</option>
                  </select>
                </div>

                <div
                  class="template-preview"
                  v-if="selectedTemplate"
                >
                  <div class="template-badge">
                    <i class="fas fa-check-circle"></i> Template applied
                  </div>
                </div>
              </div>

              <div class="form-group message-group">
                <label for="email-message">Message:</label>
                <EmailEditor
                  v-model="emailData.body"
                  id="email-message"
                />
              </div>

              <div class="shortcodes-help">
                <p><strong>Available shortcodes:</strong></p>
                <ul>
                  <li><code>{business_name}</code> - Business name</li>
                  <li><code>{website_url}</code> - Website URL</li>
                  <li><code>{contact_name}</code> - Contact name</li>
                  <li><code>{current_date}</code> - Current date</li>
                  <li><code>{sender_name}</code> - Your name</li>
                  <li><code>{company_name}</code> - Your company name</li>
                </ul>
              </div>

              <div class="preview-section">
                <div class="preview-header">
                  <h4>Email Preview</h4>
                  <button
                    class="preview-toggle"
                    @click="showPreview = !showPreview"
                  >
                    <i :class="showPreview ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    {{ showPreview ? 'Hide Preview' : 'Show Preview' }}
                  </button>
                </div>
                <div
                  v-if="showPreview"
                  class="email-preview"
                >
                  <div class="preview-subject">
                    <strong>Subject:</strong> {{ processShortcodes(emailData.subject) }}
                  </div>
                  <div
                    class="preview-body"
                    v-html="processShortcodes(emailData.body)"
                  ></div>
                </div>
              </div>

              <div class="form-actions">
                <button
                  class="btn secondary"
                  @click="closeEmailModal"
                  :disabled="isSendingEmail"
                >
                  <i class="fas fa-times"></i> Cancel
                </button>
                <button
                  class="btn primary"
                  @click="submitSimpleEmail"
                  :disabled="isSendingEmail"
                >
                  <i :class="isSendingEmail ? 'fas fa-spinner fa-spin' : 'fas fa-paper-plane'"></i>
                  {{ isSendingEmail ? 'Sending...' : 'Send Email' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, Teleport } from "vue";
import { useBusinessStore } from "@/stores/business";
import { useEmailStore } from "@/stores/email";
import { useToast } from "@/composables/useToast";
import EmailEditor from "@/components/emails/EmailEditor.vue";

const businessStore = useBusinessStore();
const emailStore = useEmailStore();
const toast = useToast();

// State
const loading = ref(true);
const searchQuery = ref("");
const statusFilter = ref("");
const cityFilter = ref("");
const showDetailsModal = ref(false);
const showRejectReasonModal = ref(false);
const showEmailModal = ref(false);
const selectedBusiness = ref(null);
const rejectReason = ref("");
const generatingPreviews = ref<string[]>([]);
const selectedTemplate = ref("");
const showPreview = ref(false);
const emailData = ref({
  recipient: "",
  subject: "",
  body: "",
});

// Computed
const filteredBusinesses = computed(() => {
  // Only include businesses that have websiteGeneration status
  // and are not clients
  let businesses = businessStore.businesses.filter(
    (business) =>
      business.websiteGeneration &&
      business.websiteGeneration.status !== "not_generated" &&
      business.status !== "client"
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

  // Apply status filter
  if (statusFilter.value) {
    businesses = businesses.filter(
      (business) => business.websiteGeneration.status === statusFilter.value
    );
  }

  // Apply city filter
  if (cityFilter.value) {
    businesses = businesses.filter(
      (business) => business.address.city === cityFilter.value
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
  return searchQuery.value || statusFilter.value || cityFilter.value;
});

// Methods
const filterBusinesses = () => {
  // This function is just a placeholder for the input/select change events
  // The actual filtering is done by the computed property
};

const formatStatus = (status: string) => {
  switch (status) {
    case "not_generated":
      return "Not Generated";
    case "pending":
      return "Pending";
    case "generated":
      return "Generated";
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
    default:
      return status;
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

const viewBusinessDetails = (business: any) => {
  console.log("viewBusinessDetails called with business:", business);

  // First set the selected business
  selectedBusiness.value = business;

  // Then show the modal with a slight delay to ensure the business data is set
  setTimeout(() => {
    showDetailsModal.value = true;
    console.log("showDetailsModal set to:", showDetailsModal.value);

    // Force a UI update and check if the modal is visible
    setTimeout(() => {
      console.log("Checking if details modal is visible in DOM");
      // Use a more specific selector to target only the details modal
      const modalElements = document.querySelectorAll(".modal");
      console.log("All modal elements:", modalElements);

      modalElements.forEach((element, index) => {
        const isVisible = window.getComputedStyle(element).display !== "none";
        console.log(`Modal ${index} visible:`, isVisible);
        console.log(`Modal ${index} style:`, window.getComputedStyle(element));
      });
    }, 100);
  }, 10);
};

const generatePreview = async (business: any) => {
  try {
    generatingPreviews.value.push(business._id);
    await businessStore.generateWebsitePreview(business._id);
  } catch (error) {
    console.error("Failed to generate preview:", error);
  } finally {
    generatingPreviews.value = generatingPreviews.value.filter(
      (id) => id !== business._id
    );
  }
};

const approvePreview = async (business: any) => {
  try {
    await businessStore.approveWebsitePreview(business._id);
  } catch (error) {
    console.error("Failed to approve preview:", error);
  }
};

const showRejectModal = (business: any) => {
  selectedBusiness.value = business;
  rejectReason.value = "";
  showRejectReasonModal.value = true;
};

const rejectPreview = async () => {
  if (!selectedBusiness.value || !rejectReason.value.trim()) return;

  try {
    await businessStore.rejectWebsitePreview(
      selectedBusiness.value._id,
      rejectReason.value
    );
    showRejectReasonModal.value = false;
  } catch (error) {
    console.error("Failed to reject preview:", error);
  }
};

// Function to move a business to Clients section
const moveToClients = async (business: any) => {
  console.log("moveToClients called with business:", business);

  try {
    // Update business status to move it to Clients section
    await businessStore.updateBusiness(business._id, {
      status: "client",
      emailOutreach: {
        status: "sent",
        sentAt: new Date().toISOString(),
      },
      websiteGeneration: {
        ...business.websiteGeneration,
        status: "approved",
      },
    });

    console.log("Business moved to Clients successfully");

    // Show success message
    toast.success(`${business.name} has been moved to Clients section.`);

    // Refresh businesses list
    await fetchBusinesses();
  } catch (error) {
    console.error("Failed to move business to Clients:", error);
    toast.error(
      "Failed to move business to Clients: " + (error as Error).message
    );
  }
};

// Simplified function to just show an alert instead of opening a modal
const validateButtonClick = (business: any) => {
  console.log("validateButtonClick called with business:", business);

  // Set the selected business
  selectedBusiness.value = business;

  // Initialize email data
  if (business.contact && business.contact.email) {
    emailData.value.recipient = business.contact.email;
  } else {
    emailData.value.recipient = "";
  }

  emailData.value.subject = `Your Website for ${business.name} is Ready!`;
  emailData.value.body = "";

  // Show the email modal
  showEmailModal.value = true;
};

// This function is now a simple wrapper around validateButtonClick
const showValidateModal = (business: any) => {
  console.log("showValidateModal called with business:", business);
  validateButtonClick(business);
};

// Process shortcodes in text
const processShortcodes = (text: string) => {
  if (!text || !selectedBusiness.value) return text;

  const business = selectedBusiness.value;
  const websiteUrl = business.websiteGeneration?.previewLink || "";
  const contactName = business.contact?.name || business.name;
  const currentDate = new Date().toLocaleDateString();
  const senderName = "Your Name"; // Replace with actual user name from profile
  const companyName = "Your Company"; // Replace with actual company name from profile

  return text
    .replace(/{business_name}/g, business.name)
    .replace(/{website_url}/g, websiteUrl)
    .replace(/{contact_name}/g, contactName)
    .replace(/{current_date}/g, currentDate)
    .replace(/{sender_name}/g, senderName)
    .replace(/{company_name}/g, companyName);
};

// Load email template
const loadTemplate = () => {
  if (!selectedTemplate.value) return;

  // Define templates with shortcodes
  const templates = {
    template1: {
      subject: "Welcome to Our Services - {business_name}",
      body: `<p>Dear {contact_name},</p>

<p>We're excited to welcome you to our services. We've created a custom website for your business that we believe will help you attract more customers and grow your online presence.</p>

<p>You can view your new website here: <a href="{website_url}">{website_url}</a></p>

<p>Please take a look at the preview and let us know what you think.</p>

<p>Best regards,<br>
{sender_name}<br>
{company_name}</p>`,
    },
    template2: {
      subject: "Your Website for {business_name} is Ready!",
      body: `<p>Dear {contact_name},</p>

<p>Great news! Your website for <strong>{business_name}</strong> is now ready for your review.</p>

<p>You can access it here: <a href="{website_url}">{website_url}</a></p>

<p>We've designed it to showcase your business in the best possible light and make it easy for potential customers to find you online.</p>

<p>Please take a moment to review the site and let us know if you'd like any changes before we finalize it.</p>

<p>Best regards,<br>
{sender_name}<br>
{company_name}</p>`,
    },
    template3: {
      subject: "Follow-up: Your {business_name} Website",
      body: `<p>Dear {contact_name},</p>

<p>I wanted to follow up regarding the website we created for <strong>{business_name}</strong>.</p>

<p>Website URL: <a href="{website_url}">{website_url}</a></p>

<p>Have you had a chance to review it? We're eager to hear your feedback and make any necessary adjustments to ensure it perfectly represents your business.</p>

<p>Please let me know if you have any questions or concerns.</p>

<p>Best regards,<br>
{sender_name}<br>
{company_name}</p>`,
    },
  };

  // Apply selected template
  if (selectedTemplate.value && templates[selectedTemplate.value]) {
    const template = templates[selectedTemplate.value];
    emailData.value.subject = template.subject;
    emailData.value.body = template.body;
  } else {
    // Clear the body if no template is selected
    emailData.value.body = "";
  }
};

// Apply email template based on selection (for backward compatibility)
const applyTemplate = loadTemplate;

// State for email sending simulation
const isSendingEmail = ref(false);

// Submit the simple email form with fake email sending
const submitSimpleEmail = async () => {
  console.log("submitSimpleEmail called with data:", emailData.value);

  if (!selectedBusiness.value) {
    console.error("No business selected");
    toast.error("No business selected. Please try again.");
    return;
  }

  // Validate form fields
  if (!emailData.value.recipient) {
    toast.error("Please enter a recipient email address.");
    return;
  }

  if (!emailData.value.subject) {
    toast.error("Please enter an email subject.");
    return;
  }

  if (!emailData.value.body) {
    toast.error("Please enter an email message.");
    return;
  }

  try {
    // Set loading state
    isSendingEmail.value = true;

    // Process shortcodes in the email content
    const processedSubject = processShortcodes(emailData.value.subject);
    const processedBody = processShortcodes(emailData.value.body);

    // Log the email data that would be sent
    console.log("Simulating email sending with data:", {
      to: emailData.value.recipient,
      subject: processedSubject,
      body: processedBody,
      businessId: selectedBusiness.value._id,
      businessName: selectedBusiness.value.name,
    });

    // Simulate API delay (2 seconds)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simulate updating business status
    console.log("Simulating business status update:", {
      status: "client", // Change status to client
      emailOutreach: {
        status: "sent",
        sentAt: new Date().toISOString(),
      },
      websiteGeneration: {
        status: "approved",
      },
    });

    // Actually update the business status in the store
    try {
      await businessStore.updateBusiness(selectedBusiness.value._id, {
        status: "client", // Change status to client
        emailOutreach: {
          status: "sent",
          sentAt: new Date().toISOString(),
        },
        websiteGeneration: {
          ...selectedBusiness.value.websiteGeneration,
          status: "approved",
        },
      });
      console.log("Business status updated to client");
    } catch (updateError) {
      console.error("Failed to update business status:", updateError);
    }

    // Simulate another delay (1 second)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Close the modal
    closeEmailModal();

    // Show success message with toast notification
    toast.success(
      `Email sent successfully to ${selectedBusiness.value.name}. The prospect has been moved to Clients section.`
    );

    // Refresh the businesses list to reflect the status change
    await fetchBusinesses();

    console.log("Email simulation completed successfully");
  } catch (error) {
    console.error("Failed in email simulation:", error);
    toast.error("Failed to send email: " + (error as Error).message);
  } finally {
    // Reset loading state
    isSendingEmail.value = false;
  }
};

const closeEmailModal = () => {
  console.log("closeEmailModal called");

  try {
    // Close the modal
    showEmailModal.value = false;
    console.log("showEmailModal set to:", showEmailModal.value);

    // Clear the selected business after a short delay
    setTimeout(() => {
      selectedBusiness.value = null;
      console.log("selectedBusiness cleared");
    }, 100);
  } catch (error) {
    console.error("Error in closeEmailModal:", error);
  }
};

const submitEmail = async (emailData: any) => {
  console.log("submitEmail called with data:", emailData);

  if (!selectedBusiness.value) {
    console.error("No business selected");
    toast.error("No business selected. Please try again.");
    return;
  }

  try {
    console.log("Sending email to business:", selectedBusiness.value._id);

    // First, close the modal to prevent UI issues
    closeEmailModal();

    // Process shortcodes in the email content
    const processedSubject = processShortcodes(emailData.subject);
    const processedBody = processShortcodes(emailData.body);

    // Send email
    await businessStore.sendBusinessEmail(selectedBusiness.value._id, {
      recipient: emailData.recipient,
      subject: processedSubject,
      body: processedBody,
    });

    console.log("Email sent successfully, updating business status");

    // Update business status to move it to Clients section
    try {
      await businessStore.updateBusiness(selectedBusiness.value._id, {
        status: "client",
        emailOutreach: {
          status: "sent",
          sentAt: new Date().toISOString(),
        },
        websiteGeneration: {
          ...selectedBusiness.value.websiteGeneration,
          status: "approved",
        },
      });

      console.log("Business status updated successfully");

      // Show success message
      toast.success(
        `Email sent successfully to ${selectedBusiness.value.name}. The prospect has been moved to Clients section.`
      );
    } catch (updateError) {
      console.error("Failed to update business status:", updateError);
      toast.warning(
        "Email was sent but failed to update business status: " +
          (updateError as Error).message
      );
    }

    // Refresh businesses list
    try {
      await fetchBusinesses();
      console.log("Business list refreshed successfully");
    } catch (fetchError) {
      console.error("Failed to refresh businesses list:", fetchError);
    }
  } catch (error) {
    console.error("Failed to send email:", error);
    toast.error("Failed to send email: " + (error as Error).message);
  } finally {
    // Make sure the modal is closed
    showEmailModal.value = false;
    selectedBusiness.value = null;
  }
};

const fetchBusinesses = async () => {
  try {
    loading.value = true;
    await businessStore.fetchBusinesses({
      websiteGeneration: true,
    });

    // Log the number of businesses found
    console.log(
      `Found ${businessStore.businesses.length} businesses with website generation data`
    );

    // Force refresh of computed properties
    const temp = searchQuery.value;
    searchQuery.value = "";
    setTimeout(() => {
      searchQuery.value = temp;
    }, 10);
  } catch (error) {
    console.error("Failed to fetch businesses:", error);
  } finally {
    loading.value = false;
  }
};

// Lifecycle hooks
onMounted(async () => {
  // Force a refresh of the businesses when the component is mounted
  await fetchBusinesses();
});
</script>

<style scoped>
.previews-list {
  width: 100%;
  padding: 20px;
}

.previews-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-actions {
  display: flex;
  gap: 12px;
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

.test-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #8b5cf6;
  color: white;
  padding: 10px 16px;
  border-radius: 6px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.test-btn:hover {
  background-color: #7c3aed;
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

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.preview-header h3 {
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

.status-badge.not_generated {
  background-color: #f3f4f6;
  color: #6b7280;
}

.status-badge.pending {
  background-color: #f3f4f6;
  color: #6b7280;
}

.status-badge.generated {
  background-color: #dbeafe;
  color: #1e40af;
}

.status-badge.approved {
  background-color: #d1fae5;
  color: #065f46;
}

.status-badge.rejected {
  background-color: #fee2e2;
  color: #b91c1c;
}

.preview-image {
  height: 200px;
  overflow: hidden;
  position: relative;
}

.preview-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.preview-image:hover img {
  transform: scale(1.05);
}

.preview-placeholder {
  height: 200px;
  background-color: #f3f4f6;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
}

.preview-placeholder i {
  font-size: 48px;
  margin-bottom: 8px;
}

.business-details {
  padding: 16px;
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

.preview-actions {
  padding: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  border-top: 1px solid #e5e7eb;
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
  text-decoration: none;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.view-btn {
  background-color: #4338ca;
  color: white;
}

.view-btn:hover:not(:disabled) {
  background-color: #3730a3;
}

.generate-btn {
  background-color: #4338ca;
  color: white;
}

.generate-btn:hover:not(:disabled) {
  background-color: #3730a3;
}

.approve-btn {
  background-color: #10b981;
  color: white;
}

.approve-btn:hover:not(:disabled) {
  background-color: #059669;
}

.reject-btn {
  background-color: #ef4444;
  color: white;
}

.reject-btn:hover:not(:disabled) {
  background-color: #dc2626;
}

.details-btn {
  background-color: #e5e7eb;
  color: #374151;
}

.details-btn:hover:not(:disabled) {
  background-color: #d1d5db;
}

.validate-btn {
  background-color: #8b5cf6;
  color: white;
  font-weight: bold;
  padding: 8px 12px;
  border: 2px solid #7c3aed;
}

.validate-btn:hover:not(:disabled) {
  background-color: #7c3aed;
  transform: scale(1.05);
}

/* Modal styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.3s ease-out;
  transform-origin: center;
}

@keyframes slideIn {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.modal-content.modal-lg {
  max-width: 1000px;
  width: 90%;
}

/* Email Form Styling */
.simple-email-form {
  padding: 20px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05) inset;
}

.modal-body {
  background-color: #f9fafb;
  padding: 0;
  border-radius: 0 0 8px 8px;
  max-height: 70vh;
  overflow-y: auto;
}

.email-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  border-bottom: 2px solid #e5e7eb;
  background: linear-gradient(to right, #f3f4f6, #ffffff);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.business-info {
  flex: 1;
}

.business-info h3 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #1f2937;
  font-size: 1.5rem;
  font-weight: 600;
}

.business-address {
  margin: 0;
  color: #6b7280;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
}

.business-address::before {
  content: "\f3c5"; /* Font Awesome map marker icon */
  font-family: "Font Awesome 5 Free", sans-serif;
  font-weight: 900;
  margin-right: 8px;
  color: #9ca3af;
}

.website-preview {
  margin-left: 20px;
}

.website-preview .preview-link {
  display: inline-flex;
  align-items: center;
  padding: 10px 18px;
  background-color: #4f46e5;
  color: white;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2);
}

.website-preview .preview-link:hover {
  background-color: #4338ca;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(79, 70, 229, 0.3);
}

.website-preview .preview-link i {
  margin-right: 8px;
}

.form-section {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.form-section .form-group {
  flex: 1;
  min-width: 250px;
}

.template-section {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
  align-items: flex-end;
  background-color: #f3f4f6;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.template-section .form-group {
  flex: 1;
}

.template-preview {
  flex: 0 0 auto;
  margin-bottom: 10px;
}

.template-badge {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  background-color: #10b981;
  color: white;
  border-radius: 30px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(16, 185, 129, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
  }
}

.template-badge i {
  margin-right: 8px;
  color: white;
}

.message-group {
  margin-bottom: 24px;
}

.message-group textarea {
  min-height: 200px;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.5;
  resize: vertical;
}

.shortcodes-help {
  background-color: #eff6ff;
  border-radius: 8px;
  padding: 16px 20px;
  margin-bottom: 24px;
  border-left: 4px solid #3b82f6;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.1);
}

.shortcodes-help p {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 15px;
  color: #1e40af;
}

.shortcodes-help ul {
  margin: 0;
  padding-left: 20px;
  font-size: 14px;
  color: #1e3a8a;
}

.shortcodes-help li {
  margin-bottom: 6px;
}

.shortcodes-help code {
  background-color: #dbeafe;
  padding: 3px 6px;
  border-radius: 4px;
  font-family: "Courier New", Courier, monospace;
  font-weight: 600;
  color: #2563eb;
  border: 1px solid #bfdbfe;
}

.form-control {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.2s;
  background-color: white;
  color: #1f2937;
}

.form-control:focus {
  border-color: #4f46e5;
  outline: none;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
  transform: translateY(-1px);
}

.form-control::placeholder {
  color: #9ca3af;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #374151;
  font-size: 0.95rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 32px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn i {
  margin-right: 8px;
  font-size: 18px;
}

.btn.primary {
  background-color: #4f46e5;
  color: white;
  box-shadow: 0 4px 6px rgba(79, 70, 229, 0.2);
}

.btn.primary:hover {
  background-color: #4338ca;
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(79, 70, 229, 0.3);
}

.btn.primary:active {
  transform: translateY(0);
}

.btn.secondary {
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #d1d5db;
}

.btn.secondary:hover {
  background-color: #e5e7eb;
  color: #1f2937;
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
  background-color: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  cursor: pointer;
  color: #4b5563;
  transition: all 0.2s;
}

.close-btn:hover {
  background-color: #e5e7eb;
  color: #111827;
  transform: scale(1.1);
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

.reject-reason-input {
  width: 100%;
  min-height: 100px;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  resize: vertical;
}

.btn.danger {
  background-color: #ef4444;
  color: white;
}

.btn.danger:hover {
  background-color: #dc2626;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.preview-section {
  margin-top: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

/* Email preview header */
.preview-section .preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.preview-section .preview-header h4 {
  margin: 0;
  font-size: 16px;
  color: #374151;
}

.preview-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #6b7280;
  font-size: 14px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.preview-toggle:hover {
  background-color: #e5e7eb;
}

.email-preview {
  padding: 16px;
  background-color: white;
}

.preview-subject {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.preview-body {
  font-family: Arial, sans-serif;
  line-height: 1.6;
}

.preview-body a {
  color: #3b82f6;
  text-decoration: none;
}

.preview-body a:hover {
  text-decoration: underline;
}
</style>