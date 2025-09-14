<template>
  <div class="category-notes">
    <div v-if="isLoading" class="loading">
      Loading category...
    </div>

    <div v-else-if="category">
      <div class="header">
        <div>
          <button @click="$router.back()" class="btn btn-secondary">← Back</button>
          <h2>{{ category.name }}</h2>
          <p>{{ categoryNotes.length }} notes in this category</p>
        </div>
        <button @click="createNoteInCategory" class="btn btn-primary">New Note</button>
      </div>

      <div class="search-section card">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search notes in this category..."
          class="search-input"
        />
      </div>

      <div v-if="categoryNotes.length === 0" class="empty-state">
        <h3>No notes in this category</h3>
        <p>Start creating notes in the "{{ category.name }}" category</p>
        <button @click="createNoteInCategory" class="btn btn-primary">Create First Note</button>
      </div>

      <div v-else-if="filteredNotes.length === 0" class="empty-state">
        <h3>No notes found</h3>
        <p>No notes match your search criteria</p>
        <button @click="clearSearch" class="btn btn-primary">Clear Search</button>
      </div>

      <div v-else class="notes-grid grid grid-2">
        <div
          v-for="note in filteredNotes"
          :key="note.id"
          class="note-card card"
        >
          <h4>{{ note.title }}</h4>
          <p>{{ getPreview(note.content) }}</p>
          <div class="note-meta">
            <span>{{ formatDate(note.updatedAt) }}</span>
          </div>
          <div class="note-actions">
            <button @click="viewNote(note.id)" class="btn">View</button>
            <button @click="editNote(note.id)" class="btn">Edit</button>
            <button @click="deleteNote(note)" class="btn btn-danger">Delete</button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <h3>Category not found</h3>
      <p>The category you're looking for doesn't exist or has been deleted.</p>
      <button @click="$router.back()" class="btn btn-primary">Go Back</button>
    </div>

    <!-- Delete Note Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="cancelDelete">
      <div class="modal" @click.stop>
        <h3>Delete Note</h3>
        <p>Are you sure you want to delete this note? This action cannot be undone.</p>
        <div class="modal-actions">
          <button @click="cancelDelete" class="btn btn-secondary">Cancel</button>
          <button @click="confirmDelete" class="btn btn-danger">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useNotesStore } from '@/stores/notes'
import { useCategoriesStore } from '@/stores/categories'
import type { Note, Category } from '@/types'

interface Props {
  id: string
}

const props = defineProps<Props>()

const router = useRouter()
const notesStore = useNotesStore()
const categoriesStore = useCategoriesStore()

const { notes } = storeToRefs(notesStore)
const { categories } = storeToRefs(categoriesStore)

const category = ref<Category | null>(null)
const isLoading = ref(true)
const searchQuery = ref('')
const showDeleteModal = ref(false)
const noteToDelete = ref<Note | null>(null)

const categoryNotes = computed(() => {
  return notes.value.filter(note => note.categoryId === props.id)
})

const filteredNotes = computed(() => {
  if (!searchQuery.value.trim()) {
    return categoryNotes.value
  }

  const query = searchQuery.value.toLowerCase()
  return categoryNotes.value.filter(note =>
    note.title.toLowerCase().includes(query) ||
    note.content.toLowerCase().includes(query)
  )
})

const fetchData = async () => {
  try {
    isLoading.value = true
    
    await Promise.all([
      notesStore.fetchNotes(),
      categoriesStore.fetchCategories()
    ])
    
    // Find the category
    category.value = categories.value.find(cat => cat.id === props.id) || null
  } catch (error) {
    console.error('Failed to fetch data:', error)
    category.value = null
  } finally {
    isLoading.value = false
  }
}

const createNoteInCategory = () => {
  router.push({
    path: '/notes/create',
    query: { categoryId: props.id }
  })
}

const viewNote = (id: string) => {
  router.push(`/notes/${id}`)
}

const editNote = (id: string) => {
  router.push(`/notes/${id}/edit`)
}

const deleteNote = (note: Note) => {
  noteToDelete.value = note
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (noteToDelete.value) {
    try {
      await notesStore.deleteNote(noteToDelete.value.id)
    } catch (error) {
      console.error('Failed to delete note:', error)
    }
  }
  cancelDelete()
}

const cancelDelete = () => {
  showDeleteModal.value = false
  noteToDelete.value = null
}

const clearSearch = () => {
  searchQuery.value = ''
}

const getPreview = (content: string) => {
  const text = content.replace(/<[^>]*>/g, '').trim()
  return text.length > 150 ? text.substring(0, 150) + '...' : text
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

onMounted(async () => {
  await fetchData()
})
</script>

<style scoped>
.category-notes {
  max-width: 1000px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.header h2 {
  margin: 1rem 0 0.25rem 0;
}

.header p {
  color: #666;
  font-size: 0.9rem;
}

.search-section {
  margin-bottom: 2rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.search-input:focus {
  outline: none;
  border-color: #2196F3;
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
}

.notes-grid {
  margin-top: 1rem;
}

.note-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.note-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.note-card h4 {
  margin-bottom: 0.5rem;
  color: #333;
}

.note-card p {
  color: #666;
  margin-bottom: 1rem;
  line-height: 1.4;
}

.note-meta {
  margin-bottom: 1rem;
  font-size: 0.85rem;
  color: #888;
}

.note-actions {
  display: flex;
  gap: 0.5rem;
}

.note-actions .btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
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