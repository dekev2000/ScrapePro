<template>
  <div class="table-container">
    <div v-if="loading" class="table-loading">
      <div class="spinner">
        <i class="fas fa-spinner fa-spin"></i>
      </div>
    </div>
    <table class="table" :class="{ 'table-striped': striped, 'table-hover': hover, 'table-bordered': bordered }">
      <thead>
        <tr>
          <th v-if="selectable" class="select-column">
            <input
              type="checkbox"
              :checked="allSelected"
              @change="toggleSelectAll"
              :disabled="loading"
            />
          </th>
          <th v-for="column in columns" :key="column.key" :class="[column.class, { sortable: column.sortable }]" @click="column.sortable ? sort(column.key) : null">
            {{ column.label }}
            <span v-if="column.sortable" class="sort-icon">
              <i v-if="sortKey === column.key && sortOrder === 'asc'" class="fas fa-sort-up"></i>
              <i v-else-if="sortKey === column.key && sortOrder === 'desc'" class="fas fa-sort-down"></i>
              <i v-else class="fas fa-sort"></i>
            </span>
          </th>
          <th v-if="$slots.actions" class="actions-column">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading || items.length === 0" class="empty-row">
          <td :colspan="selectable ? columns.length + 2 : columns.length + 1">
            <div v-if="loading" class="empty-message">Loading data...</div>
            <div v-else class="empty-message">{{ emptyMessage }}</div>
          </td>
        </tr>
        <tr v-for="(item, index) in sortedItems" :key="item.id || index" v-show="!loading && items.length > 0">
          <td v-if="selectable" class="select-column">
            <input
              type="checkbox"
              :checked="isSelected(item)"
              @change="toggleSelect(item)"
              :disabled="loading"
            />
          </td>
          <td v-for="column in columns" :key="column.key" :class="column.class">
            <slot :name="`cell(${column.key})`" :item="item" :value="getItemValue(item, column.key)">
              {{ getItemValue(item, column.key) }}
            </slot>
          </td>
          <td v-if="$slots.actions" class="actions-column">
            <slot name="actions" :item="item" :index="index"></slot>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="pagination && !loading && items.length > 0" class="table-pagination">
      <div class="pagination-info">
        Showing {{ paginationInfo.from }} to {{ paginationInfo.to }} of {{ paginationInfo.total }} entries
      </div>
      <div class="pagination-controls">
        <button
          class="pagination-button"
          :disabled="currentPage === 1"
          @click="changePage(currentPage - 1)"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        <span v-for="page in paginationPages" :key="page">
          <button
            v-if="page !== '...'"
            class="pagination-button"
            :class="{ active: currentPage === page }"
            @click="changePage(page)"
          >
            {{ page }}
          </button>
          <span v-else class="pagination-ellipsis">...</span>
        </span>
        <button
          class="pagination-button"
          :disabled="currentPage === totalPages"
          @click="changePage(currentPage + 1)"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

const props = defineProps({
  columns: {
    type: Array,
    required: true
  },
  items: {
    type: Array,
    default: () => []
  },
  striped: {
    type: Boolean,
    default: true
  },
  hover: {
    type: Boolean,
    default: true
  },
  bordered: {
    type: Boolean,
    default: false
  },
  selectable: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  emptyMessage: {
    type: String,
    default: 'No data available'
  },
  pagination: {
    type: Boolean,
    default: false
  },
  itemsPerPage: {
    type: Number,
    default: 10
  },
  defaultSortKey: {
    type: String,
    default: ''
  },
  defaultSortOrder: {
    type: String,
    default: 'asc',
    validator: (value: string) => ['asc', 'desc'].includes(value)
  }
});

const emit = defineEmits(['sort', 'page-change', 'selection-change']);

// Sorting
const sortKey = ref(props.defaultSortKey);
const sortOrder = ref(props.defaultSortOrder);

// Pagination
const currentPage = ref(1);

// Selection
const selectedItems = ref<any[]>([]);

// Computed properties
const sortedItems = computed(() => {
  let result = [...props.items];
  
  if (sortKey.value) {
    result.sort((a, b) => {
      const aValue = getItemValue(a, sortKey.value);
      const bValue = getItemValue(b, sortKey.value);
      
      if (aValue === bValue) return 0;
      
      const comparison = aValue < bValue ? -1 : 1;
      return sortOrder.value === 'asc' ? comparison : -comparison;
    });
  }
  
  if (props.pagination) {
    const start = (currentPage.value - 1) * props.itemsPerPage;
    const end = start + props.itemsPerPage;
    return result.slice(start, end);
  }
  
  return result;
});

const totalPages = computed(() => {
  return Math.ceil(props.items.length / props.itemsPerPage);
});

const paginationPages = computed(() => {
  const pages = [];
  const maxVisiblePages = 5;
  
  if (totalPages.value <= maxVisiblePages) {
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);
    
    if (currentPage.value > 3) {
      pages.push('...');
    }
    
    const startPage = Math.max(2, currentPage.value - 1);
    const endPage = Math.min(totalPages.value - 1, currentPage.value + 1);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    if (currentPage.value < totalPages.value - 2) {
      pages.push('...');
    }
    
    pages.push(totalPages.value);
  }
  
  return pages;
});

const paginationInfo = computed(() => {
  const total = props.items.length;
  const from = total === 0 ? 0 : (currentPage.value - 1) * props.itemsPerPage + 1;
  const to = Math.min(from + props.itemsPerPage - 1, total);
  
  return { from, to, total };
});

const allSelected = computed(() => {
  return props.items.length > 0 && selectedItems.value.length === props.items.length;
});

// Methods
function getItemValue(item: any, key: string) {
  // Handle nested properties (e.g., 'user.name')
  return key.split('.').reduce((obj, key) => obj && obj[key], item);
}

function sort(key: string) {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
  
  emit('sort', { key: sortKey.value, order: sortOrder.value });
}

function changePage(page: number) {
  currentPage.value = page;
  emit('page-change', page);
}

function isSelected(item: any) {
  return selectedItems.value.some(selectedItem => selectedItem.id === item.id);
}

function toggleSelect(item: any) {
  if (isSelected(item)) {
    selectedItems.value = selectedItems.value.filter(selectedItem => selectedItem.id !== item.id);
  } else {
    selectedItems.value.push(item);
  }
  
  emit('selection-change', selectedItems.value);
}

function toggleSelectAll() {
  if (allSelected.value) {
    selectedItems.value = [];
  } else {
    selectedItems.value = [...props.items];
  }
  
  emit('selection-change', selectedItems.value);
}

// Reset pagination when items change
watch(() => props.items, () => {
  currentPage.value = 1;
});
</script>

<style scoped>
.table-container {
  position: relative;
  width: 100%;
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
  font-size: 0.875rem;
}

.table th,
.table td {
  padding: 0.75rem;
  text-align: left;
  vertical-align: middle;
}

.table th {
  font-weight: 600;
  color: #4b5563;
  background-color: #f9fafb;
  border-bottom: 2px solid #e5e7eb;
}

.table td {
  border-bottom: 1px solid #e5e7eb;
}

.table-striped tbody tr:nth-of-type(odd) {
  background-color: rgba(249, 250, 251, 0.5);
}

.table-hover tbody tr:hover {
  background-color: rgba(243, 244, 246, 0.7);
}

.table-bordered {
  border: 1px solid #e5e7eb;
}

.table-bordered th,
.table-bordered td {
  border: 1px solid #e5e7eb;
}

.sortable {
  cursor: pointer;
  user-select: none;
}

.sort-icon {
  margin-left: 0.25rem;
  display: inline-block;
}

.select-column {
  width: 40px;
  text-align: center;
}

.actions-column {
  width: 120px;
  text-align: center;
}

.empty-row td {
  text-align: center;
  padding: 2rem;
}

.empty-message {
  color: #6b7280;
  font-style: italic;
}

.table-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
}

.spinner {
  font-size: 1.5rem;
  color: #4f46e5;
}

.table-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  font-size: 0.875rem;
}

.pagination-info {
  color: #6b7280;
}

.pagination-controls {
  display: flex;
  align-items: center;
}

.pagination-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  height: 2rem;
  padding: 0 0.5rem;
  margin: 0 0.125rem;
  border: 1px solid #e5e7eb;
  background-color: #fff;
  color: #4b5563;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-button:hover:not(:disabled) {
  background-color: #f3f4f6;
  border-color: #d1d5db;
}

.pagination-button.active {
  background-color: #4f46e5;
  border-color: #4f46e5;
  color: #fff;
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-ellipsis {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  height: 2rem;
  padding: 0 0.5rem;
  margin: 0 0.125rem;
  color: #6b7280;
}
</style>
