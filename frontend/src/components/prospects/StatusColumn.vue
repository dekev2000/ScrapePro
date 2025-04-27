<template>
  <div
    class="status-column"
    :class="{ 'is-drop-target': isDropTarget }"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <div
      class="column-header"
      :style="{ backgroundColor: status.color + '20', borderColor: status.color }"
    >
      <div class="status-info">
        <div
          class="status-icon"
          :style="{ backgroundColor: status.color }"
        >
          <i :class="status.icon"></i>
        </div>
        <h3 class="status-name">{{ status.name }}</h3>
      </div>
      <div class="prospect-count">
        {{ prospects.length }} {{ prospects.length === 1 ? 'prospect' : 'prospects' }}
      </div>
    </div>

    <div class="column-body">
      <div
        v-if="prospects.length === 0"
        class="empty-column"
      >
        <i class="fas fa-inbox"></i>
        <p>No prospects in this status</p>
        <p class="empty-hint">Drag prospects here to change their status</p>
      </div>

      <div
        v-else
        class="prospects-list"
      >
        <ProspectCard
          v-for="prospect in prospects"
          :key="prospect._id"
          :prospect="prospect"
          @click="$emit('prospect-click', prospect)"
          @edit="$emit('prospect-edit', prospect)"
          @more="onProspectMore"
          @email="$emit('prospect-email', prospect)"
          @convert="$emit('prospect-convert', prospect)"
          @delete="$emit('prospect-delete', prospect)"
          @closeOtherMenus="closeOtherMenus"
          @dragstart="onProspectDragStart"
          @dragend="onProspectDragEnd"
          ref="prospectCards"
        />
      </div>
    </div>

    <div class="column-footer">
      <button
        class="add-prospect-btn"
        @click="$emit('add-prospect', status.id)"
      >
        <i class="fas fa-plus"></i> Add prospect
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import ProspectCard from "./ProspectCard.vue";
import { ProspectStatus } from "@/data/prospectStatuses";

const props = defineProps<{
  status: ProspectStatus;
  prospects: any[];
}>();

const emit = defineEmits<{
  (e: "prospect-click", prospect: any): void;
  (e: "prospect-edit", prospect: any): void;
  (
    e: "prospect-more",
    prospect: any,
    event: MouseEvent,
    buttonRef: HTMLButtonElement | null
  ): void;
  (e: "prospect-email", prospect: any): void;
  (e: "prospect-convert", prospect: any): void;
  (e: "prospect-delete", prospect: any): void;
  (e: "add-prospect", statusId: string): void;
  (e: "drop", prospect: any, statusId: string): void;
}>();

const isDropTarget = ref(false);
const prospectCards = ref<any[]>([]);
let dragCounter = 0;

// Methods
const onProspectMore = (
  prospect: any,
  event: MouseEvent,
  buttonRef: HTMLButtonElement | null
) => {
  // Forward the event to parent
  emit("prospect-more", prospect, event, buttonRef);
};

const closeOtherMenus = (currentProspectId: string) => {
  // Close all other menus
  if (prospectCards.value) {
    prospectCards.value.forEach((card: any) => {
      if (
        card.prospect &&
        card.prospect._id !== currentProspectId &&
        card.showMoreMenu
      ) {
        card.showMoreMenu = false;
      }
    });
  }
};
const onDragOver = (event: DragEvent) => {
  // Prevent default to allow drop
  event.preventDefault();

  // Set dropEffect to move
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = "move";
  }

  isDropTarget.value = true;
};

const onDragLeave = () => {
  dragCounter--;
  if (dragCounter === 0) {
    isDropTarget.value = false;
  }
};

const onDrop = (event: DragEvent) => {
  // Prevent default action
  event.preventDefault();

  // Reset drop target state
  isDropTarget.value = false;
  dragCounter = 0;

  // Get the dragged prospect data
  if (event.dataTransfer) {
    try {
      const prospectData = JSON.parse(
        event.dataTransfer.getData("application/json")
      );
      emit("drop", prospectData, props.status.id);
    } catch (error) {
      console.error("Error parsing dragged prospect data:", error);
    }
  }
};

const onProspectDragStart = () => {
  dragCounter++;
};

const onProspectDragEnd = () => {
  isDropTarget.value = false;
  dragCounter = 0;
};
</script>

<style scoped>
.status-column {
  display: flex;
  flex-direction: column;
  width: 300px;
  min-width: 300px;
  height: 100%;
  background-color: #f9fafb;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  margin-right: 16px;
  /* Allow menus to overflow */
  overflow: visible;
}

.status-column.is-drop-target {
  background-color: #f3f4f6;
  box-shadow: 0 0 0 2px #6366f1, 0 4px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-4px);
}

.column-header {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  border-left: 3px solid;
}

.status-info {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.status-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  color: white;
  margin-right: 12px;
}

.status-name {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.prospect-count {
  font-size: 14px;
  color: #6b7280;
}

.column-body {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  /* Allow menus to overflow */
  overflow-x: visible;
}

.empty-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  border: 2px dashed #e5e7eb;
  border-radius: 8px;
  color: #9ca3af;
  text-align: center;
  padding: 20px;
}

.empty-column i {
  font-size: 32px;
  margin-bottom: 12px;
}

.empty-column p {
  margin: 0 0 8px;
  font-size: 14px;
}

.empty-column .empty-hint {
  font-size: 12px;
  color: #6b7280;
}

.prospects-list {
  min-height: 100px;
  /* Ensure menus can overflow */
  overflow: visible;
}

.column-footer {
  padding: 16px;
  border-top: 1px solid #e5e7eb;
}

.add-prospect-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 10px;
  background-color: white;
  border: 1px dashed #d1d5db;
  border-radius: 6px;
  color: #6b7280;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.add-prospect-btn:hover {
  background-color: #f3f4f6;
  color: #4b5563;
  border-color: #9ca3af;
}

.add-prospect-btn i {
  margin-right: 8px;
}
</style>
