<template>
  <div
    class="prospect-card"
    :class="{ 'is-dragging': isDragging }"
    draggable="true"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
    @click="$emit('click', prospect)"
  >
    <div class="card-header">
      <h3 class="business-name">{{ prospect.name }}</h3>
      <div
        v-if="prospect.websiteGeneration"
        :class="['website-badge', getWebsiteStatusClass(prospect.websiteGeneration.status)]"
        :title="formatWebsiteStatus(prospect.websiteGeneration.status)"
      >
        <i :class="getWebsiteStatusIcon(prospect.websiteGeneration.status)"></i>
      </div>
    </div>

    <div class="card-body">
      <div class="info-row">
        <i class="fas fa-map-marker-alt"></i>
        <span>{{ formatAddress(prospect.address) }}</span>
      </div>

      <div
        v-if="prospect.contact && prospect.contact.phone"
        class="info-row"
      >
        <i class="fas fa-phone"></i>
        <span>{{ prospect.contact.phone }}</span>
      </div>

      <div
        v-if="prospect.contact && prospect.contact.email"
        class="info-row"
      >
        <i class="fas fa-envelope"></i>
        <span>{{ prospect.contact.email }}</span>
      </div>

      <div
        v-if="prospect.business && prospect.business.type"
        class="info-row"
      >
        <i class="fas fa-briefcase"></i>
        <span>{{ prospect.business.type }}</span>
      </div>
    </div>

    <div
      v-if="prospect.tags && prospect.tags.length > 0"
      class="card-tags"
    >
      <span
        v-for="tag in prospect.tags.slice(0, 3)"
        :key="tag"
        class="tag"
      >
        {{ tag }}
      </span>
      <span
        v-if="prospect.tags.length > 3"
        class="tag more-tag"
      >
        +{{ prospect.tags.length - 3 }}
      </span>
    </div>

    <div class="card-footer">
      <div class="date-info">
        <i class="far fa-calendar-alt"></i>
        <span>{{ formatDate(prospect.updatedAt) }}</span>
      </div>

      <div class="card-actions">
        <button
          v-if="prospect.websiteGeneration && prospect.websiteGeneration.previewLink"
          class="action-btn preview-btn"
          title="View Website"
          @click.stop="openWebsite(prospect.websiteGeneration.previewLink)"
        >
          <i class="fas fa-external-link-alt"></i>
        </button>

        <button
          class="action-btn edit-btn"
          title="Edit Prospect"
          @click.stop="$emit('edit', prospect)"
        >
          <i class="fas fa-edit"></i>
        </button>

        <div class="more-menu-container">
          <button
            class="action-btn more-btn"
            title="More Options"
            ref="moreBtn"
            @click.stop="toggleMoreMenu"
          >
            <i class="fas fa-ellipsis-v"></i>
          </button>

          <!-- Local context menu -->
          <div
            v-if="showMoreMenu"
            class="card-context-menu"
          >
            <div
              class="context-menu-item"
              @click.stop="onMenuItemClick('view')"
            >
              <i class="fas fa-info-circle"></i> View Details
            </div>
            <div
              class="context-menu-item"
              @click.stop="onMenuItemClick('edit')"
            >
              <i class="fas fa-edit"></i> Edit Prospect
            </div>
            <div
              v-if="hasWebsite"
              class="context-menu-item"
              @click.stop="onMenuItemClick('website')"
            >
              <i class="fas fa-external-link-alt"></i> View Website
            </div>
            <div
              class="context-menu-item"
              @click.stop="onMenuItemClick('email')"
            >
              <i class="fas fa-envelope"></i> Send Email
            </div>
            <div class="context-menu-divider"></div>
            <div
              v-if="canConvert"
              class="context-menu-item"
              @click.stop="onMenuItemClick('convert')"
            >
              <i class="fas fa-user-check"></i> Convert to Client
            </div>
            <div
              class="context-menu-item danger"
              @click.stop="onMenuItemClick('delete')"
            >
              <i class="fas fa-trash-alt"></i> Delete Prospect
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

const props = defineProps<{
  prospect: any;
}>();

const emit = defineEmits<{
  (e: "click", prospect: any): void;
  (e: "edit", prospect: any): void;
  (
    e: "more",
    prospect: any,
    event: MouseEvent,
    buttonRef: HTMLButtonElement | null
  ): void;
  (e: "dragstart", event: DragEvent, prospect: any): void;
  (e: "dragend", event: DragEvent): void;
  (e: "closeOtherMenus", prospectId: string): void;
  (e: "email", prospect: any): void;
  (e: "convert", prospect: any): void;
  (e: "delete", prospect: any): void;
}>();

const isDragging = ref(false);
const moreBtn = ref<HTMLButtonElement | null>(null);
const showMoreMenu = ref(false);

// Computed properties
const hasWebsite = computed(() => {
  return (
    props.prospect.websiteGeneration &&
    props.prospect.websiteGeneration.previewLink
  );
});

const canConvert = computed(() => {
  return (
    props.prospect.websiteGeneration &&
    props.prospect.websiteGeneration.status === "generated"
  );
});

// Methods
const toggleMoreMenu = (event: MouseEvent) => {
  event.stopPropagation();
  showMoreMenu.value = !showMoreMenu.value;

  // Close other menus when opening this one
  if (showMoreMenu.value) {
    emit("closeOtherMenus", props.prospect._id);
  }
};

const onMenuItemClick = (action: string) => {
  // Hide menu first
  showMoreMenu.value = false;

  // Emit appropriate event based on action
  switch (action) {
    case "view":
      emit("click", props.prospect);
      break;
    case "edit":
      emit("edit", props.prospect);
      break;
    case "website":
      if (hasWebsite.value) {
        window.open(props.prospect.websiteGeneration.previewLink, "_blank");
      }
      break;
    case "email":
      emit("email", props.prospect);
      break;
    case "convert":
      emit("convert", props.prospect);
      break;
    case "delete":
      emit("delete", props.prospect);
      break;
  }
};
const formatAddress = (address: any) => {
  if (!address) return "No address";

  const parts = [];
  if (address.city) parts.push(address.city);
  if (address.country) parts.push(address.country);

  return parts.join(", ") || "No address";
};

const formatDate = (dateString: string) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Today";
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
};

const formatWebsiteStatus = (status: string) => {
  switch (status) {
    case "generated":
      return "Website Generated";
    case "pending":
      return "Website Pending";
    case "approved":
      return "Website Approved";
    case "rejected":
      return "Website Rejected";
    case "not_generated":
      return "No Website";
    default:
      return status;
  }
};

const getWebsiteStatusClass = (status: string) => {
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

const getWebsiteStatusIcon = (status: string) => {
  switch (status) {
    case "generated":
      return "fas fa-check";
    case "pending":
      return "fas fa-spinner";
    case "approved":
      return "fas fa-thumbs-up";
    case "rejected":
      return "fas fa-thumbs-down";
    case "not_generated":
      return "fas fa-times";
    default:
      return "fas fa-question";
  }
};

const openWebsite = (url: string) => {
  window.open(url, "_blank");
};

const onDragStart = (event: DragEvent) => {
  isDragging.value = true;

  if (event.dataTransfer) {
    // Set data for drag operation
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData(
      "application/json",
      JSON.stringify(props.prospect)
    );

    // Add some styling to the drag image
    const dragImage = document.createElement("div");
    dragImage.classList.add("drag-image");
    dragImage.textContent = props.prospect.name;
    document.body.appendChild(dragImage);
    event.dataTransfer.setDragImage(dragImage, 0, 0);

    // Remove the element after it's been used
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
  }

  emit("dragstart", event, props.prospect);
};

const onDragEnd = (event: DragEvent) => {
  isDragging.value = false;
  emit("dragend", event);
};
</script>

<style scoped>
.prospect-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #e5e7eb;
  position: relative;
  /* Remove overflow: hidden to allow the menu to be visible outside the card */
}

.prospect-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.prospect-card.is-dragging {
  opacity: 0.5;
  transform: scale(0.95);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.business-name {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.3;
  word-break: break-word;
}

.website-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 12px;
  flex-shrink: 0;
  margin-left: 8px;
}

.website-badge.success {
  background-color: #d1fae5;
  color: #065f46;
}

.website-badge.warning {
  background-color: #fef3c7;
  color: #92400e;
}

.website-badge.primary {
  background-color: #e0e7ff;
  color: #4338ca;
}

.website-badge.danger {
  background-color: #fee2e2;
  color: #b91c1c;
}

.website-badge.secondary {
  background-color: #f3f4f6;
  color: #4b5563;
}

.card-body {
  margin-bottom: 12px;
}

.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
  color: #4b5563;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-row i {
  width: 16px;
  margin-right: 8px;
  color: #6b7280;
}

.info-row span {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.tag {
  display: inline-block;
  padding: 4px 8px;
  background-color: #f3f4f6;
  color: #4b5563;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.more-tag {
  background-color: #e5e7eb;
  color: #374151;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #6b7280;
}

.date-info {
  display: flex;
  align-items: center;
}

.date-info i {
  margin-right: 6px;
}

.card-actions {
  display: flex;
  gap: 8px;
  position: relative;
  /* Ensure the container doesn't clip the menu */
  overflow: visible;
}

.more-menu-container {
  position: relative;
  /* Ensure the container doesn't clip the menu */
  overflow: visible;
}

.card-context-menu {
  position: absolute;
  top: 100%;
  right: 0;
  width: 200px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 9999; /* Ensure it's above everything else */
  overflow: hidden;
  margin-top: 8px;
}

.context-menu-item {
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  color: #1f2937;
  font-size: 14px;
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

.context-menu-divider {
  height: 1px;
  background-color: #e5e7eb;
  margin: 4px 0;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  background-color: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background-color: #f3f4f6;
  color: #1f2937;
}

.preview-btn:hover {
  color: #4338ca;
}

.edit-btn:hover {
  color: #10b981;
}

/* Drag image styling (not visible in the component) */
.drag-image {
  position: absolute;
  top: -9999px;
  left: -9999px;
  background-color: #4f46e5;
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-weight: 500;
  font-size: 14px;
  box-shadow: 0 4px 8px rgba(79, 70, 229, 0.3);
  z-index: 9999;
}
</style>
