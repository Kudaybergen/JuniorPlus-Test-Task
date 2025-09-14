<template>
  <div class="notes-view">
    <!-- Header Section -->
    <div class="header">
      <div>
        <h2>All Notes</h2>
        <p>{{ filteredNotes.length }} of {{ notesCount }} notes</p>
      </div>
      <router-link to="/notes/create" class="btn btn-primary">+ New Note</router-link>
    </div>

    <!-- Search and Filter Section -->
    <div class="filters card">
      <div class="filter-row">
        <div class="search-group">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search notes by title, content, or category..."
            class="search-input"
          />
        </div>
        
        <div class="category-group">
          <select v-model="selectedCategoryId" class="category-filter">
            <option value="">All Categories</option>
            <option
              v-for="category in categories"
              :key="category.id"
              :value="category.id"
            >
              {{ category.name }}
            </option>
          </select>
        </div>

        <div class="action-group">
          <button @click="clearFilters" class="btn btn-secondary" :disabled="!hasActiveFilters">
            Clear
          </button>
          
          <div class="view-toggle">
            <button 
              @click="viewMode = 'grid'" 
              :class="['btn', 'btn-sm', { 'btn-primary': viewMode === 'grid', 'btn-secondary': viewMode !== 'grid' }]"
            >
              ⊞
            </button>
            <button 
              @click="viewMode = 'list'" 
              :class="['btn', 'btn-sm', { 'btn-primary': viewMode === 'list', 'btn-secondary': viewMode !== 'list' }]"
            >
              ☰
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading.notes" class="loading">
      <div class="loading-spinner">🔄</div>
      <p>Loading notes...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="notes.length === 0" class="empty-state">
      <div class="empty-icon">📝</div>
      <h3>No notes yet</h3>
      <p>Create your first note to get started</p>
      <router-link to="/notes/create" class="btn btn-primary">Create Note</router-link>
    </div>

    <!-- No Search Results -->
    <div v-else-if="filteredNotes.length === 0" class="empty-state">
      <div class="empty-icon">🔍</div>
      <h3>No notes found</h3>
      <p>Try adjusting your search or filter criteria</p>
      <button @click="clearFilters" class="btn btn-primary">Clear Filters</button>
    </div>

    <!-- Notes Content -->
    <div v-else>
      <!-- Grid View -->
      <div v-if="viewMode === 'grid'" class="notes-grid grid grid-2">
        <div
          v-for="note in filteredNotes"
          :key="note.id"
          class="note-card card"
          @click="viewNote(note.id)"
        >
          <h4>{{ note.title }}</h4>
          <p>{{ getPreview(note.content) }}</p>
          <div class="note-meta">
            <span v-if="note.category" class="category-badge">{{ note.category.name }}</span>
            <span class="date">{{ formatDate(note.updatedAt) }}</span>
          </div>
          <div class="note-actions" @click.stop>
            <button @click="editNote(note.id)" class="btn btn-sm">Edit</button>
            <button @click="deleteNote(note)" class="btn btn-sm btn-danger">Delete</button>
          </div>
        </div>
      </div>

      <!-- List View -->
      <div v-else class="notes-list">
        <div
          v-for="note in filteredNotes"
          :key="note.id"
          class="note-list-item card"
          @click="viewNote(note.id)"
        >
          <div class="note-content">
            <h4>{{ note.title }}</h4>
            <p>{{ getPreview(note.content) }}</p>
            <div class="note-meta">
              <span v-if="note.category" class="category-badge">{{ note.category.name }}</span>
              <span class="date">{{ formatDate(note.updatedAt) }}</span>
            </div>
          </div>
          <div class="note-actions" @click.stop>
            <button @click="editNote(note.id)" class="btn btn-sm">Edit</button>
            <button @click="deleteNote(note)" class="btn btn-sm btn-danger">Delete</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="cancelDelete">
      <div class="modal" @click.stop>
        <h3>Delete Note</h3>
        <p>Are you sure you want to delete "<strong>{{ noteToDelete?.title }}</strong>"? This action cannot be undone.</p>
        <div class="modal-actions">
          <button @click="cancelDelete" class="btn btn-secondary">Cancel</button>
          <button @click="confirmDelete" class="btn btn-danger">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useNotesStore } from '@/stores/notes'
import { useCategoriesStore } from '@/stores/categories'
import type { Note } from '@/types'

const router = useRouter()
const notesStore = useNotesStore()
const categoriesStore = useCategoriesStore()

const { 
  notes, 
  filteredNotes, 
  notesCount, 
  loading 
} = storeToRefs(notesStore)

const { categories } = storeToRefs(categoriesStore)

// Local state
const viewMode = ref<'grid' | 'list'>('grid')
const searchQuery = ref('')
const selectedCategoryId = ref<string>('')
const showDeleteModal = ref(false)
const noteToDelete = ref<Note | null>(null)

// Computed
const hasActiveFilters = computed(() => {
  return searchQuery.value.trim() || selectedCategoryId.value
})

// Watchers - sync local state with store
watch([searchQuery, selectedCategoryId], () => {
  notesStore.setSearchQuery(searchQuery.value)
  notesStore.setCategoryFilter(selectedCategoryId.value || null)
})

// Methods
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

const clearFilters = () => {
  searchQuery.value = ''
  selectedCategoryId.value = ''
  notesStore.clearFilters()
}

const getPreview = (content: string) => {
  const text = content.replace(/<[^>]*>/g, '').trim()
  return text.length > 150 ? text.substring(0, 150) + '...' : text
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) return 'Today'
  if (diffInDays === 1) return 'Yesterday'
  if (diffInDays < 7) return `${diffInDays} days ago`
  
  return date.toLocaleDateString()
}

// Lifecycle
onMounted(async () => {
  try {
    await Promise.all([
      notesStore.fetchNotes(),
      categoriesStore.fetchCategories()
    ])
  } catch (error) {
    console.error('Failed to fetch notes:', error)
  }
})
</script>

<style scoped>
.notes-view {
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
  margin-bottom: 0.25rem;
  color: #333;
}

.header p {
  color: #666;
  font-size: 0.9rem;
}

.filters {
  margin-bottom: 2rem;
}

.filter-row {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-group {
  flex: 1;
  min-width: 250px;
}

.search-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.search-input:focus {
  outline: none;
  border-color: #2196F3;
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
}

.category-group {
  min-width: 150px;
}

.category-filter {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  font-size: 0.9rem;
}

.action-group {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.view-toggle {
  display: flex;
  gap: 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.view-toggle .btn {
  border: none;
  border-radius: 0;
  margin: 0;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.loading-spinner {
  font-size: 2rem;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #666;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.3;
}

.empty-state h3 {
  margin-bottom: 1rem;
  color: #333;
}

.notes-grid {
  margin-top: 1rem;
}

.note-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
}

.note-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.note-card h4 {
  margin-bottom: 0.5rem;
  color: #333;
  font-size: 1.1rem;
}

.note-card p {
  color: #666;
  margin-bottom: 1rem;
  line-height: 1.4;
  font-size: 0.9rem;
}

.notes-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.note-list-item {
  cursor: pointer;
  transition: transform 0.1s, box-shadow 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
}

.note-list-item:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.note-content {
  flex: 1;
}

.note-content h4 {
  margin-bottom: 0.25rem;
  color: #333;
}

.note-content p {
  color: #666;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.note-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
  font-size: 0.85rem;
}

.category-badge {
  background: #e3f2fd;
  color: #1976d2;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.date {
  color: #888;
}

.note-actions {
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.note-card:hover .note-actions,
.note-list-item:hover .note-actions {
  opacity: 1;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
}

/* Responsive */
@media (max-width: 768px) {
  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-group,
  .category-group {
    min-width: auto;
  }
  
  .action-group {
    justify-content: space-between;
  }
  
  .header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .note-list-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .note-actions {
    opacity: 1;
    align-self: flex-end;
  }
}
</style>