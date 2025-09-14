<template>
  <div class="dashboard">
    <div class="welcome-section card">
      <h2>Welcome to Notes App</h2>
      <p>Organize your thoughts and ideas efficiently</p>
      <router-link to="/notes/create" class="btn btn-primary">Create New Note</router-link>
    </div>

    <div class="stats-section grid grid-3">
      <div class="stat-card card">
        <h3>{{ notesCount }}</h3>
        <p>Total Notes</p>
        <div class="stat-icon">📝</div>
      </div>
      <div class="stat-card card">
        <h3>{{ categoriesCount }}</h3>
        <p>Categories</p>
        <div class="stat-icon">🏷️</div>
      </div>
      <div class="stat-card card">
        <h3>{{ recentNotes.length }}</h3>
        <p>Recent Notes</p>
        <div class="stat-icon">⏰</div>
      </div>
    </div>

    <div class="recent-notes">
      <div class="section-header">
        <h3>Recent Notes</h3>
        <router-link to="/notes" class="btn btn-secondary">View All</router-link>
      </div>

      <div v-if="loading.notes" class="loading">
        Loading notes...
      </div>

      <div v-else-if="recentNotes.length === 0" class="empty-state">
        <div class="empty-icon">📝</div>
        <h3>No notes yet</h3>
        <p>Create your first note to get started</p>
        <router-link to="/notes/create" class="btn btn-primary">Create Note</router-link>
      </div>

      <div v-else class="notes-grid grid grid-2">
        <div
          v-for="note in recentNotes"
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
    </div>

    <!-- Delete Confirmation Modal -->
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useNotesStore } from '@/stores/notes'
import { useCategoriesStore } from '@/stores/categories'
import type { Note } from '@/types'

const router = useRouter()
const notesStore = useNotesStore()
const categoriesStore = useCategoriesStore()

const { recentNotes, notesCount, loading } = storeToRefs(notesStore)
const { categoriesCount } = storeToRefs(categoriesStore)

const showDeleteModal = ref(false)
const noteToDelete = ref<Note | null>(null)

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

const getPreview = (content: string) => {
  const text = content.replace(/<[^>]*>/g, '').trim()
  return text.length > 100 ? text.substring(0, 100) + '...' : text
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

onMounted(async () => {
  try {
    await Promise.all([
      notesStore.fetchNotes(),
      categoriesStore.fetchCategories()
    ])
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error)
  }
})
</script>

<style scoped>
.dashboard {
  max-width: 1000px;
  margin: 0 auto;
}

.welcome-section {
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  margin-bottom: 2rem;
}

.welcome-section h2 {
  margin-bottom: 0.5rem;
  font-size: 2rem;
}

.welcome-section p {
  margin-bottom: 1.5rem;
  opacity: 0.9;
}

.stats-section {
  margin-bottom: 2rem;
}

.stat-card {
  text-align: center;
  position: relative;
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-card h3 {
  font-size: 2.5rem;
  color: #2196F3;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.stat-card p {
  color: #666;
  font-weight: 500;
}

.stat-icon {
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-size: 2rem;
  opacity: 0.1;
}

.recent-notes {
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h3 {
  color: #333;
  font-size: 1.5rem;
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

.note-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
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

.note-card:hover .note-actions {
  opacity: 1;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.3;
}
</style>