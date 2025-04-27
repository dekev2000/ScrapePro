<template>
  <button
    :type="type"
    class="btn"
    :class="[
      variant ? `btn-${variant}` : '',
      size ? `btn-${size}` : '',
      { 'btn-block': block, 'btn-icon': icon, 'btn-loading': loading }
    ]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="spinner">
      <i class="fas fa-spinner fa-spin"></i>
    </span>
    <i v-if="icon && !loading" :class="icon"></i>
    <span v-if="$slots.default && !loading" class="btn-text">
      <slot></slot>
    </span>
    <span v-else-if="loading" class="btn-text">{{ loadingText || 'Loading...' }}</span>
  </button>
</template>

<script setup lang="ts">
defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value: string) => ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark', 'link', 'outline-primary', 'outline-secondary', 'outline-success', 'outline-danger', 'outline-warning', 'outline-info'].includes(value)
  },
  size: {
    type: String,
    default: '',
    validator: (value: string) => ['', 'sm', 'lg'].includes(value)
  },
  type: {
    type: String,
    default: 'button'
  },
  block: {
    type: Boolean,
    default: false
  },
  icon: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  loadingText: {
    type: String,
    default: ''
  }
});

defineEmits(['click']);
</script>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  user-select: none;
  border: 1px solid transparent;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  line-height: 1.5;
  border-radius: 0.25rem;
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  cursor: pointer;
}

.btn:focus, .btn:hover {
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(79, 70, 229, 0.25);
}

.btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.btn-block {
  display: flex;
  width: 100%;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  line-height: 1.5;
  border-radius: 0.2rem;
}

.btn-lg {
  padding: 0.75rem 1.5rem;
  font-size: 1.125rem;
  line-height: 1.5;
  border-radius: 0.3rem;
}

.btn-icon {
  padding: 0.5rem;
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
}

.btn-icon.btn-sm {
  width: 2rem;
  height: 2rem;
  padding: 0.375rem;
}

.btn-icon.btn-lg {
  width: 3.5rem;
  height: 3.5rem;
  padding: 0.75rem;
}

.btn i {
  margin-right: 0.5rem;
}

.btn-icon i {
  margin-right: 0;
}

.btn-loading {
  position: relative;
}

.spinner {
  margin-right: 0.5rem;
}

/* Button variants */
.btn-primary {
  color: #fff;
  background-color: #4f46e5;
  border-color: #4f46e5;
}

.btn-primary:hover, .btn-primary:focus {
  background-color: #4338ca;
  border-color: #4338ca;
}

.btn-secondary {
  color: #fff;
  background-color: #6b7280;
  border-color: #6b7280;
}

.btn-secondary:hover, .btn-secondary:focus {
  background-color: #4b5563;
  border-color: #4b5563;
}

.btn-success {
  color: #fff;
  background-color: #10b981;
  border-color: #10b981;
}

.btn-success:hover, .btn-success:focus {
  background-color: #059669;
  border-color: #059669;
}

.btn-danger {
  color: #fff;
  background-color: #ef4444;
  border-color: #ef4444;
}

.btn-danger:hover, .btn-danger:focus {
  background-color: #dc2626;
  border-color: #dc2626;
}

.btn-warning {
  color: #1f2937;
  background-color: #f59e0b;
  border-color: #f59e0b;
}

.btn-warning:hover, .btn-warning:focus {
  background-color: #d97706;
  border-color: #d97706;
}

.btn-info {
  color: #fff;
  background-color: #3b82f6;
  border-color: #3b82f6;
}

.btn-info:hover, .btn-info:focus {
  background-color: #2563eb;
  border-color: #2563eb;
}

.btn-light {
  color: #1f2937;
  background-color: #f9fafb;
  border-color: #f9fafb;
}

.btn-light:hover, .btn-light:focus {
  background-color: #f3f4f6;
  border-color: #f3f4f6;
}

.btn-dark {
  color: #fff;
  background-color: #1f2937;
  border-color: #1f2937;
}

.btn-dark:hover, .btn-dark:focus {
  background-color: #111827;
  border-color: #111827;
}

.btn-link {
  color: #4f46e5;
  background-color: transparent;
  border-color: transparent;
  text-decoration: none;
}

.btn-link:hover, .btn-link:focus {
  color: #4338ca;
  text-decoration: underline;
  background-color: transparent;
  border-color: transparent;
}

/* Outline buttons */
.btn-outline-primary {
  color: #4f46e5;
  background-color: transparent;
  border-color: #4f46e5;
}

.btn-outline-primary:hover, .btn-outline-primary:focus {
  color: #fff;
  background-color: #4f46e5;
  border-color: #4f46e5;
}

.btn-outline-secondary {
  color: #6b7280;
  background-color: transparent;
  border-color: #6b7280;
}

.btn-outline-secondary:hover, .btn-outline-secondary:focus {
  color: #fff;
  background-color: #6b7280;
  border-color: #6b7280;
}

.btn-outline-success {
  color: #10b981;
  background-color: transparent;
  border-color: #10b981;
}

.btn-outline-success:hover, .btn-outline-success:focus {
  color: #fff;
  background-color: #10b981;
  border-color: #10b981;
}

.btn-outline-danger {
  color: #ef4444;
  background-color: transparent;
  border-color: #ef4444;
}

.btn-outline-danger:hover, .btn-outline-danger:focus {
  color: #fff;
  background-color: #ef4444;
  border-color: #ef4444;
}

.btn-outline-warning {
  color: #f59e0b;
  background-color: transparent;
  border-color: #f59e0b;
}

.btn-outline-warning:hover, .btn-outline-warning:focus {
  color: #1f2937;
  background-color: #f59e0b;
  border-color: #f59e0b;
}

.btn-outline-info {
  color: #3b82f6;
  background-color: transparent;
  border-color: #3b82f6;
}

.btn-outline-info:hover, .btn-outline-info:focus {
  color: #fff;
  background-color: #3b82f6;
  border-color: #3b82f6;
}
</style>
