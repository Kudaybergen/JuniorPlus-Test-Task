<template>
  <div class="create-note">
    <div class="header">
      <div>
        <h2>Create New Note</h2>
        <p>Write your thoughts and ideas</p>
      </div>
      <button @click="handleCancel" class="btn btn-secondary">← Back</button>
    </div>

    <form @submit.prevent="saveNote" class="note-form">
      <div class="form-main card">
        <div class="form-group">
          <label for="title">Title *</label>
          <input
            id="title"
            v-model="noteForm.title"
            type="text"
            placeholder="Enter note title"
            required
            maxlength="255"
            ref="titleInput"
          />
          <div class="char-counter">{{ noteForm.title.length }}/255</div>
        </div>

        <div class="form-group">
          <label for="category">Category *</label>
          <div class="category-input-group">
            <select id="category" v-model="noteForm.categoryId" required>
              <option value="">Select a category</option>
              <option
                v-for="category in categories"
                :key="category.id"
                :value="category.id"
              >
                {{ category.name }}
              </option>
            </select>
            <button 
              type="button" 
              @click="showCreateCategoryModal = true" 
              class="btn btn-secondary btn-sm"
              title="Create new category"
            >
              +
            </button>
          </div>
        </div>

        <div class="form-group">
          <label for="content">Content *</label>
          <div class="editor-toolbar">
            <button type="button" @click="insertText('**', '**')" class="toolbar-btn" title="Bold">
              <strong>B</strong>
            </button>
            <button type="button" @click="insertText('*', '*')" class="toolbar-btn" title="Italic">
              <em>I</em>
            </button>
            <button type="button" @click="insertText('`', '`')" class="toolbar-btn" title="Code">
              &lt;/&gt;
            </button>
            <button type="button" @click="insertText('- ', '')" class="toolbar-btn" title="List">
              • List
            </button>
          </div>
          <textarea
            id="content"
            v-model="noteForm.content"
            placeholder="Start writing your note... 

You can use Markdown formatting:
**bold text**
*italic text*
`code`
- lists
"
            required
            rows="15"
            ref="contentTextarea"
          ></textarea>
          <div class="editor-help">
            <small>💡 Tip: You can use Markdown formatting for **bold**, *italic*, `code`, and - lists</small>
          </div>
        </div>

        <div class="form-actions">
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="!isFormValid || loading.creating"
          >
            {{ loading.creating ? 'Saving...' : 'Save Note' }}
          </button>
          <button
            type="button"
            @click="handleCancel"
            class="btn btn-secondary"
            :disabled="loading.creating"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="showPreview = true"
            class="btn btn-secondary"
            :disabled="!noteForm.content.trim()"
          >
            Preview
          </button>
        </div>
      </div>
    </form>

    <!-- Auto-save indicator -->
    <div v-if="autoSaveStatus" class="auto-save-indicator">
      <div :class="['auto-save-chip', autoSaveStatus]">
        <span v-if="autoSaveStatus === 'saving'">💾 Auto-saving...</span>
        <span v-else>✅ Draft saved</span>
      </div>
    </div>

    <!-- Preview Modal -->
    <div v-if="showPreview" class="modal-overlay" @click="showPreview = false">
      <div class="modal large-modal" @click.stop>
        <div class="modal-header">
          <h3>Preview</h3>
          <button @click="showPreview = false" class="close-btn">×</button>
        </div>
        <div class="modal-content">
          <h4>{{ noteForm.title || 'Untitled' }}</h4>
          <div class="preview-content" v-html="formattedContent"></div>
        </div>
        <div class="modal-actions">
          <button @click="showPreview = false" class="btn btn-primary">Close</button>
        </div>
      </div>
    </div>

    <!-- Create Category Modal -->
    <div v-if="showCreateCategoryModal" class="modal-overlay" @click="closeCreateCategoryModal">
      <div class="modal" @click.stop>
        <h3>Create New Category</h3>
        <form @submit.prevent="createCategory">
          <div class="form-group">
            <label for="categoryName">Category Name *</label>
            <input
              id="categoryName"
              v-model="newCategoryName"
              type="text"
              placeholder="Enter category name"
              required
              maxlength="50"
              ref="categoryInput"
            />
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeCreateCategoryModal" class="btn btn-secondary">Cancel</button>
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="!newCategoryName.trim() || categoriesLoading"
            >
              {{ categoriesLoading ? 'Creating...' : 'Create' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Unsaved Changes Modal -->
    <div v-if="showUnsavedModal" class="modal-overlay" @click="cancelLeave">
      <div class="modal" @click.stop>
        <h3>Unsaved Changes</h3>
        <p>You have unsaved changes. Are you sure you want to leave without saving?</p>
        <div class="modal-actions">
          <button @click="cancelLeave" class="btn btn-secondary">Stay</button>
          <button @click="confirmLeave" class="btn btn-danger">Leave</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useNotesStore } from '@/stores/notes'
import { useCategoriesStore } from '@/stores/categories'

const router = useRouter()
const notesStore = useNotesStore()
const categoriesStore = useCategoriesStore()

const { loading } = storeToRefs(notesStore)
const { categories, loading: categoriesLoading } = storeToRefs(categoriesStore)

const noteForm = ref({
  title: '',
  content: '',
  categoryId: ''
})

const showPreview = ref(false)
const showCreateCategoryModal = ref(false)
const showUnsavedModal = ref(false)
const newCategoryName = ref('')
const autoSaveStatus = ref<'saving' | 'saved' | null>(null)

const titleInput = ref()
const contentTextarea = ref()
const categoryInput = ref()

const isFormValid = computed(() => {
  return noteForm.value.title.trim().length >= 2 &&
         noteForm.value.categoryId &&
         noteForm.value.content.trim().length > 0
})

const hasUnsavedChanges = computed(() => {
  return noteForm.value.title.trim() || 
         noteForm.value.content.trim() || 
         noteForm.value.categoryId
})

const formattedContent = computed(() => {
  let content = noteForm.value.content
  
  // Simple Markdown-like formatting
  content = content
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Code
    .replace(/`(.*?)`/g, '<code>$1</code>')
    // Line breaks
    .replace(/\n/g, '<br>')
    // Lists
    .replace(/^- (.+)$/gm, '<li>$1</li>')
  
  // Wrap lists
  content = content.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
  
  return content
})

// Auto-save functionality
let autoSaveTimer: NodeJS.Timeout | null = null

const triggerAutoSave = () => {
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer)
  }
  
  autoSaveTimer = setTimeout(() => {
    if (isFormValid.value && hasUnsavedChanges.value) {
      simulateAutoSave()
    }
  }, 3000)
}

const simulateAutoSave = () => {
  autoSaveStatus.value = 'saving'
  
  // Simulate saving to localStorage or draft API
  setTimeout(() => {
    localStorage.setItem('draft_note', JSON.stringify(noteForm.value))
    autoSaveStatus.value = 'saved'
    
    setTimeout(() => {
      autoSaveStatus.value = null
    }, 3000)
  }, 1000)
}

// Watch for form changes
watch([() => noteForm.value.title, () => noteForm.value.content, () => noteForm.value.categoryId], () => {
  triggerAutoSave()
}, { deep: true })

const insertText = (before: string, after: string) => {
  const textarea = contentTextarea.value
  if (!textarea) return
  
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = noteForm.value.content.substring(start, end)
  
  const newText = before + selectedText + after
  noteForm.value.content = 
    noteForm.value.content.substring(0, start) + 
    newText + 
    noteForm.value.content.substring(end)
  
  // Restore cursor position
  nextTick(() => {
    textarea.focus()
    textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length)
  })
}

const saveNote = async () => {
  if (!isFormValid.value) return

  try {
    const note = await notesStore.createNote({
      title: noteForm.value.title.trim(),
      content: noteForm.value.content.trim(),
      categoryId: noteForm.value.categoryId
    })

    // Clear auto-save draft
    localStorage.removeItem('draft_note')
    
    router.push(`/notes/${note.id}`)
  } catch (error) {
    console.error('Failed to save note:', error)
  }
}

const createCategory = async () => {
  if (!newCategoryName.value.trim()) return

  try {
    const category = await categoriesStore.createCategory({
      name: newCategoryName.value.trim()
    })

    noteForm.value.categoryId = category.id
    closeCreateCategoryModal()
  } catch (error) {
    console.error('Failed to create category:', error)
  }
}

const closeCreateCategoryModal = () => {
  showCreateCategoryModal.value = false
  newCategoryName.value = ''
}

const handleCancel = () => {
  if (hasUnsavedChanges.value) {
    showUnsavedModal.value = true
  } else {
    router.back()
  }
}

const confirmLeave = () => {
  localStorage.removeItem('draft_note')
  router.back()
}

const cancelLeave = () => {
  showUnsavedModal.value = false
}

onMounted(async () => {
  try {
    await categoriesStore.fetchCategories()
    
    // Load draft if exists
    const draft = localStorage.getItem('draft_note')
    if (draft) {
      try {
        const draftData = JSON.parse(draft)
        noteForm.value = { ...noteForm.value, ...draftData }
      } catch (e) {
        localStorage.removeItem('draft_note')
      }
    }
    
    await nextTick()
    titleInput.value?.focus()
  } catch (error) {
    console.error('Failed to fetch categories:', error)
  }
})
</script>

<style scoped>
.create-note {
  max-width: 800px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.header h2 {
  margin-bottom: 0.25rem;
  color: #333;
}

.header p {
  color: #666;
  font-size: 0.9rem;
}

.note-form {
  position: relative;
}

.form-main {
  margin-bottom: 2rem;
}

.char-counter {
  text-align: right;
  font-size: 0.8rem;
  color: #888;
  margin-top: 0.25rem;
}

.category-input-group {
  display: flex;
  gap: 0.5rem;
}

.category-input-group select {
  flex: 1;
}

.editor-toolbar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #e9ecef;
}

.toolbar-btn {
  padding: 0.25rem 0.5rem;
  border: 1px solid #ddd;
  background: white;
  border-radius: 3px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: background 0.2s;
}

.toolbar-btn:hover {
  background: #f0f0f0;
}

.editor-help {
  margin-top: 0.5rem;
  color: #666;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-start;
  flex-wrap: wrap;
}

.auto-save-indicator {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 100;
}

.auto-save-chip {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  animation: slideInUp 0.3s ease;
}

.auto-save-chip.saving {
  background: #fff3cd;
  color: #856404;
}

.auto-save-chip.saved {
  background: #d4edda;
  color: #155724;
}

@keyframes slideInUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.large-modal {
  max-width: 800px;
  width: 95%;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  max-height: 60vh;
  overflow-y: auto;
  margin-bottom: 1rem;
}

.modal-content h4 {
  margin-bottom: 1rem;
  color: #333;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
}

.preview-content {
  line-height: 1.6;
  color: #333;
}

.preview-content :deep(strong) {
  font-weight: 600;
}

.preview-content :deep(em) {
  font-style: italic;
}

.preview-content :deep(code) {
  background: #f1f3f4;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
}

.preview-content :deep(ul) {
  margin: 1rem 0;
  padding-left: 2rem;
}

.preview-content :deep(li) {
  margin: 0.25rem 0;
}

/* Responsive */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .form-actions .btn {
    width: 100%;
  }
  
  .category-input-group {
    flex-direction: column;
  }
  
  .editor-toolbar {
    flex-wrap: wrap;
  }
  
  .auto-save-indicator {
    left: 1rem;
    right: 1rem;
  }
  
  .auto-save-chip {
    width: 100%;
    text-align: center;
  }
}
</style>