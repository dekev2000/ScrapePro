<template>
  <div class="email-editor">
    <div class="toolbar">
      <div class="toolbar-group">
        <button
          class="toolbar-button"
          @click="execCommand('bold')"
          :class="{ active: isActive('bold') }"
          title="Bold"
        >
          <i class="fas fa-bold"></i>
        </button>
        <button
          class="toolbar-button"
          @click="execCommand('italic')"
          :class="{ active: isActive('italic') }"
          title="Italic"
        >
          <i class="fas fa-italic"></i>
        </button>
        <button
          class="toolbar-button"
          @click="execCommand('underline')"
          :class="{ active: isActive('underline') }"
          title="Underline"
        >
          <i class="fas fa-underline"></i>
        </button>
      </div>

      <div class="toolbar-group">
        <button
          class="toolbar-button"
          @click="execCommand('justifyLeft')"
          :class="{ active: isActive('justifyLeft') }"
          title="Align Left"
        >
          <i class="fas fa-align-left"></i>
        </button>
        <button
          class="toolbar-button"
          @click="execCommand('justifyCenter')"
          :class="{ active: isActive('justifyCenter') }"
          title="Align Center"
        >
          <i class="fas fa-align-center"></i>
        </button>
        <button
          class="toolbar-button"
          @click="execCommand('justifyRight')"
          :class="{ active: isActive('justifyRight') }"
          title="Align Right"
        >
          <i class="fas fa-align-right"></i>
        </button>
      </div>

      <div class="toolbar-group">
        <button
          class="toolbar-button"
          @click="execCommand('insertUnorderedList')"
          :class="{ active: isActive('insertUnorderedList') }"
          title="Bullet List"
        >
          <i class="fas fa-list-ul"></i>
        </button>
        <button
          class="toolbar-button"
          @click="execCommand('insertOrderedList')"
          :class="{ active: isActive('insertOrderedList') }"
          title="Numbered List"
        >
          <i class="fas fa-list-ol"></i>
        </button>
      </div>

      <div class="toolbar-group">
        <button
          class="toolbar-button"
          @click="execCommand('createLink', prompt('Enter link URL'))"
          title="Insert Link"
        >
          <i class="fas fa-link"></i>
        </button>
        <button
          class="toolbar-button"
          @click="insertImage"
          title="Insert Image"
        >
          <i class="fas fa-image"></i>
        </button>
      </div>

      <div class="toolbar-group">
        <select
          class="toolbar-select"
          @change="execCommand('formatBlock', $event.target.value)"
        >
          <option value="">Format</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
          <option value="p">Paragraph</option>
          <option value="blockquote">Quote</option>
        </select>
        <select
          class="toolbar-select"
          @change="execCommand('fontName', $event.target.value)"
        >
          <option value="">Font</option>
          <option value="Arial">Arial</option>
          <option value="Helvetica">Helvetica</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Georgia">Georgia</option>
          <option value="Courier New">Courier New</option>
          <option value="Verdana">Verdana</option>
        </select>
        <select
          class="toolbar-select"
          @change="execCommand('fontSize', $event.target.value)"
        >
          <option value="">Size</option>
          <option value="1">Very Small</option>
          <option value="2">Small</option>
          <option value="3">Normal</option>
          <option value="4">Medium Large</option>
          <option value="5">Large</option>
          <option value="6">Very Large</option>
          <option value="7">Maximum</option>
        </select>
      </div>

      <div class="toolbar-group">
        <input
          type="color"
          class="toolbar-color"
          @change="execCommand('foreColor', $event.target.value)"
          title="Text Color"
        />
        <input
          type="color"
          class="toolbar-color"
          @change="execCommand('hiliteColor', $event.target.value)"
          title="Background Color"
        />
      </div>
    </div>

    <div class="shortcodes-toolbar">
      <span class="shortcodes-label">Insert Shortcode:</span>
      <button
        v-for="shortcode in shortcodes"
        :key="shortcode.code"
        class="shortcode-button"
        @click="insertShortcode(shortcode.code)"
        :title="shortcode.description"
      >
        {{ shortcode.label }}
      </button>
    </div>

    <div
      class="editor-content"
      contenteditable="true"
      ref="editorContent"
      @input="updateContent"
      @blur="updateContent"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const editorContent = ref<HTMLElement | null>(null)

// Define available shortcodes
const shortcodes = [
  { code: '{business_name}', label: 'Business Name', description: 'Insert the business name' },
  { code: '{contact_name}', label: 'Contact Name', description: 'Insert the contact name' },
  { code: '{website_url}', label: 'Website URL', description: 'Insert the website URL' },
  { code: '{current_date}', label: 'Current Date', description: 'Insert the current date' },
  { code: '{sender_name}', label: 'Sender Name', description: 'Insert your name' },
  { code: '{company_name}', label: 'Company Name', description: 'Insert your company name' },
]

// Execute editor commands
const execCommand = (command: string, value: string | null = null) => {
  document.execCommand(command, false, value)
  updateContent()
}

// Check if a command is currently active
const isActive = (command: string) => {
  return document.queryCommandState(command)
}

// Insert an image
const insertImage = () => {
  const url = prompt('Enter image URL')
  if (url) {
    execCommand('insertImage', url)
  }
}

// Insert a shortcode
const insertShortcode = (code: string) => {
  // Create a text node with the shortcode
  const text = document.createTextNode(code)
  
  // Get the current selection
  const selection = window.getSelection()
  if (selection && selection.rangeCount > 0) {
    // Get the current range
    const range = selection.getRangeAt(0)
    
    // Delete the contents of the range if there's a selection
    range.deleteContents()
    
    // Insert the shortcode
    range.insertNode(text)
    
    // Move the cursor after the inserted shortcode
    range.setStartAfter(text)
    range.setEndAfter(text)
    selection.removeAllRanges()
    selection.addRange(range)
  } else if (editorContent.value) {
    // If no selection, append to the end
    editorContent.value.appendChild(text)
  }
  
  updateContent()
}

// Update the v-model value
const updateContent = () => {
  if (editorContent.value) {
    emit('update:modelValue', editorContent.value.innerHTML)
  }
}

// Watch for changes in the v-model value
watch(() => props.modelValue, (newValue) => {
  if (editorContent.value && editorContent.value.innerHTML !== newValue) {
    editorContent.value.innerHTML = newValue
  }
})

// Initialize the editor with the v-model value
onMounted(() => {
  if (editorContent.value) {
    editorContent.value.innerHTML = props.modelValue
  }
})
</script>

<style scoped>
.email-editor {
  border: 1px solid #d1d5db;
  border-radius: 8px;
  overflow: hidden;
  background-color: white;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.toolbar-group {
  display: flex;
  gap: 4px;
  border-right: 1px solid #e5e7eb;
  padding-right: 8px;
  margin-right: 8px;
}

.toolbar-group:last-child {
  border-right: none;
  padding-right: 0;
  margin-right: 0;
}

.toolbar-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background-color: white;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.2s;
}

.toolbar-button:hover {
  background-color: #f3f4f6;
}

.toolbar-button.active {
  background-color: #e0e7ff;
  border-color: #6366f1;
  color: #4f46e5;
}

.toolbar-select {
  padding: 6px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background-color: white;
  color: #4b5563;
  font-size: 14px;
  cursor: pointer;
}

.toolbar-color {
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  cursor: pointer;
}

.shortcodes-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px;
  background-color: #eff6ff;
  border-bottom: 1px solid #e5e7eb;
  align-items: center;
}

.shortcodes-label {
  font-size: 14px;
  font-weight: 500;
  color: #1e40af;
  margin-right: 8px;
}

.shortcode-button {
  padding: 6px 10px;
  border: 1px solid #bfdbfe;
  border-radius: 4px;
  background-color: #dbeafe;
  color: #1e40af;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.shortcode-button:hover {
  background-color: #bfdbfe;
}

.editor-content {
  min-height: 300px;
  padding: 16px;
  outline: none;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.5;
  color: #1f2937;
}

.editor-content:focus {
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2) inset;
}

/* Make sure images don't overflow */
.editor-content img {
  max-width: 100%;
  height: auto;
}
</style>
