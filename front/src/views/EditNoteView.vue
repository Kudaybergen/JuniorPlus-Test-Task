<template>
  <div class="edit-note">
    <div v-if="isLoading" class="loading">
      Loading note...
    </div>

    <div v-else-if="note">
      <div class="header">
        <h2>Edit Note</h2>
        <button @click="handleCancel" class="btn btn-secondary">← Back</button>
      </div>

      <form @submit.prevent="saveNote" class="note-form card">
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
        </div>

        <div class="form-group">
          <label for="category">Category *</label>
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
        </div>

        <div class="form-group">
          <label for="content">Content *</label>
          <textarea
            id="content"
            v-model="noteForm.content"
            placeholder="Start writing your note..."
            required
            rows="15"
          ></textarea>
        </div>

        <div class="form-actions">
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="!isFormValid || loading.updating"
          >
            {{ loading.updating ? 'Updating...' : 'Update Note' }}
          </button>
          <button
            type="button"
            @click="handleCancel"
            class="btn btn-secondary"
            :disabled="loading.updating"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>

    <div v-else class="empty-state">
      <h3>Note not found</h3>
      <p>The note you're trying to edit doesn't exist or has been deleted.</p>
      <button @click="$router.back()" class="btn btn-primary">Go Back</button>
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
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useNotesStore } from '@/stores/notes'
import { useCategoriesStore } from '@/stores/categories'
import type { Note } from '@/types'

interface Props {
  id: string
}

const props = defineProps<Props>()

const router = useRouter()
const notesStore = useNotesStore()
const categoriesStore = useCategoriesStore()

const { notes, loading } = storeToRefs(notesStore)
const { categories } = storeToRefs(categoriesStore)

const note = ref<Note | null>(null)
const isLoading = ref(true)
const noteForm = ref({
  title: '',
  content: '',
  categoryId: ''
})

const originalForm = ref({
  title: '',
  content: '',
  categoryId: ''
})

const showUnsavedModal = ref(false)
const titleInput = ref()

const isFormValid = computed(() => {
  return noteForm.value.title.trim().length >= 2 &&
         noteForm.value.categoryId &&
         noteForm.value.content.trim().length > 0
})

const hasUnsavedChanges = computed(() => {
  return noteForm.value.title !== originalForm.value.title ||
         noteForm.value.content !== originalForm.value.content ||
         noteForm.value.categoryId !== originalForm.value.categoryId
})

const fetchNote = async () => {
  try {
    isLoading.value = true
    
    // First try to find in store
    let foundNote = notes.value.find(n => n.id === props.id)
    
    if (!foundNote) {
      // If not in store, fetch from API
      foundNote = await notesStore.getNoteByIdAsync(props.id)
    }
    
    if (foundNote) {
      note.value = foundNote
      noteForm.value = {
        title: foundNote.title,
        content: foundNote.content,
        categoryId: foundNote.categoryId
      }
      
      // Store original values
      originalForm.value = {
        title: foundNote.title,
        content: foundNote.content,
        categoryId: foundNote.categoryId
      }
    }
  } catch (error) {
    console.error('Failed to fetch note:', error)
    note.value = null
  } finally {
    isLoading.value = false
  }
}

const saveNote = async () => {
  if (!isFormValid.value || !note.value) return

  try {
    const updatedNote = await notesStore.updateNote(note.value.id, {
      title: noteForm.value.title.trim(),
      content: noteForm.value.content.trim(),
      categoryId: noteForm.value.categoryId
    })

    // Update original form values
    originalForm.value = {
      title: updatedNote.title,
      content: updatedNote.content,
      categoryId: updatedNote.categoryId
    }
    
    router.push(`/notes/${updatedNote.id}`)
  } catch (error) {
    console.error('Failed to update note:', error)
  }
}

const handleCancel = () => {
  if (hasUnsavedChanges.value) {
    showUnsavedModal.value = true
  } else {
    router.back()
  }
}

const confirmLeave = () => {
  showUnsavedModal.value = false
  router.back()
}

const cancelLeave = () => {
  showUnsavedModal.value = false
}

onMounted(async () => {
  try {
    await Promise.all([
      fetchNote(),
      categoriesStore.fetchCategories()
    ])
    
    await nextTick()
    titleInput.value?.focus()
  } catch (error) {
    console.error('Failed to load edit data:', error)
  }
})
</script>

<style scoped>
.edit-note {
  max-width: 800px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.note-form {
  max-width: none;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  font-family: inherit;
}

.form-group textarea {
  resize: vertical;
  min-height: 300px;
  font-family: 'Courier New', monospace;
  line-height: 1.5;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #2196F3;
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-start;
}

.form-actions .btn {
  padding: 0.75rem 1.5rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 400px;
  width: 90%;
}

.modal h3 {
  margin-bottom: 1rem;
}

.modal p {
  margin-bottom: 1.5rem;
  color: #666;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}
</style>