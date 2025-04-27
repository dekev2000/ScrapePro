<template>
  <div class="card" :class="[`elevation-${elevation}`, { 'no-padding': noPadding }]">
    <div v-if="title || $slots.header" class="card-header">
      <h3 v-if="title">{{ title }}</h3>
      <slot name="header"></slot>
    </div>
    <div class="card-body" :class="{ 'no-padding': noPadding }">
      <slot></slot>
    </div>
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  title: {
    type: String,
    default: ''
  },
  elevation: {
    type: Number,
    default: 1
  },
  noPadding: {
    type: Boolean,
    default: false
  }
});
</script>

<style scoped>
.card {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 1.5rem;
  transition: box-shadow 0.3s ease;
}

.card-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #edf2f7;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
}

.card-body {
  padding: 1.5rem;
}

.card-body.no-padding {
  padding: 0;
}

.card-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #edf2f7;
}

.elevation-1 {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
}

.elevation-2 {
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
}

.elevation-3 {
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23);
}

.elevation-4 {
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);
}

.elevation-5 {
  box-shadow: 0 19px 38px rgba(0, 0, 0, 0.30), 0 15px 12px rgba(0, 0, 0, 0.22);
}

.no-padding {
  padding: 0;
}
</style>
