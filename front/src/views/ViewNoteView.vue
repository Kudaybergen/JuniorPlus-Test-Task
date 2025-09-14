<template>
  <div class="view-note">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading">
      <div class="loading-spinner">🔄</div>
      <p>Loading note...</p>
    </div>

    <!-- Note Content -->
    <div v-else-if="note" class="note-content">
      <div class="header">
        <div class="header-main">
          <button @click="$router.back()" class="btn btn-secondary btn-back">← Back</button>
          <div class="note-header">
            <h1>{{ note.title }}</h1>
            <div class="note-meta">
              <span v-if="note.category" class="category-badge">{{ note.category.name }}</span>
              <span class="date">Created {{ formatDate(note.createdAt) }}</span>
              <span v-if="note.updatedAt !== note.createdAt" class="date">
                • Updated {{ formatDate(note.updatedAt) }}
              </span>
            </div>
          </div>
        </div>
        
        <div class="header-actions">
          <button @click="editNote" class="btn btn-primary">✏️ Edit</button>
          <div class="action-dropdown">
            <button @click="showActionMenu = !showActionMenu" class="btn btn-secondary">
              ⋮
            </button>
            <div v-if="showActionMenu" class="dropdown-menu" @click="showActionMenu = false">
              <button @click="duplicateNote" class="dropdown-item">
                📋 Duplicate
              </button>
              <button @click="shareNote" class="dropdown-item">
                🔗 Share
              </button>
              <div class="dropdown-separator"></div>
              <button @click="deleteNote" class="dropdown-item danger">
                🗑️ Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="content-card card">
        <div class="formatted-content" v-html="formattedContent"></div>
      </div>

      <!-- Related Notes -->
      <div v-if="relatedNotes.length > 0" class="related-section">
        <h3>More notes in "{{ note.category?.name }}"</h3>
        <div class="related-notes grid grid-2">
          <div
            v-for="relatedNote in relatedNotes"
            :key="relatedNote.id"
            class="related-note card"
            @click="viewRelatedNote(relatedNote.id)"
          >
            <h4>{{ relatedNote.title }}</h4>
            <p>{{ getPreviewText(relatedNote.content) }}</p>
            <div class="related-date">{{ formatDate(relatedNote.updatedAt) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="empty-state">
      <div class="empty-icon">❌</div>
      <h3>Note not found</h3>
      <p>The note you're looking for doesn't exist or has been deleted.</p>
      <button @click="$router.back()" class="btn btn-primary">Go Back</button>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="cancelDelete">
      <div class="modal" @click.stop>
        <h3>Delete Note</h3>
        <p>Are you sure you want to delete "<strong>{{ note?.title }}</strong>"? This action cannot be undone.</p>
        <div class="modal-actions">
          <button @click="cancelDelete" class="btn btn-secondary">Cancel</button>
          <button @click="confirmDelete" class="btn btn-danger">Delete</button>
        </div>
      </div>
    </div>

    <!-- Share Modal -->
    <div v-if="showShareModal" class="modal-overlay" @click="showShareModal = false">
      <div class="modal" @click.stop>
        <h3>Share Note</h3>
        <p>Copy the link below to share this note:</p>
        <div class="share-input-group">
          <input
            :value="shareUrl"
            readonly
            class="share-input"
            ref="shareInput"
          />
          <button @click="copyShareUrl" class="btn btn-primary">Copy</button>
        </div>
        <div class="modal-actions">
          <button @click="showShareModal = false" class="btn btn-secondary">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useNotesStore } from '@/stores/notes'
import { useNotificationStore } from '@/stores/notifications'
import type { Note } from '@/types'

interface Props {
  id: string
}

const props = defineProps<Props>()

const router = useRouter()
const route = useRoute()
const notesStore = useNotesStore()
const notificationStore = useNotificationStore()

const { notes } = storeToRefs(notesStore)

const note = ref<Note | null>(null)
const isLoading = ref(true)
const showActionMenu = ref(false)
const showDeleteModal = ref(false)
const showShareModal = ref(false)
const shareInput = ref()

const relatedNotes = computed(() => {
  if (!note.value) return []
  
  return notes.value
    .filter(n => n.id !== note.value!.id && n.categoryId === note.value!.categoryId)
    .slice(0, 4)
})

const shareUrl = computed(() => {
  return `${window.location.origin}${route.fullPath}`
})

const formattedContent = computed(() => {
  if (!note.value) return ''
  
  let content = note.value.content
  
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

const fetchNote = async () => {
  try {
    isLoading.value = true
    
    // First try to find in store
    let foundNote = notes.value.find(n => n.id === props.id)
    
    if (!foundNote) {
      // If not in store, fetch from API
      foundNote = await notesStore.getNoteByIdAsync(props.id)
    }
    
    note.value = foundNote
  } catch (error) {
    console.error('Failed to fetch note:', error)
    note.value = null
  } finally {
    isLoading.value = false
  }
}

const editNote = () => {
  router.push(`/notes/${props.id}/edit`)
}

const deleteNote = () => {
  showActionMenu.value = false
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (!note.value) return

  try {
    await notesStore.deleteNote(note.value.id)
    router.push('/notes')
  } catch (error) {
    console.error('Failed to delete note:', error)
  }
}

const cancelDelete = () => {
  showDeleteModal.value = false
}

const duplicateNote = async () => {
  if (!note.value) return

  try {
    const duplicatedNote = await notesStore.createNote({
      title: `${note.value.title} (Copy)`,
      content: note.value.content,
      categoryId: note.value.categoryId
    })

    notificationStore.showSuccess('Note duplicated successfully!')
    router.push(`/notes/${duplicatedNote.id}`)
  } catch (error) {
    console.error('Failed to duplicate note:', error)
  }
}

const shareNote = () => {
  showActionMenu.value = false
  showShareModal.value = true
}

const copyShareUrl = async () => {
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    notificationStore.showSuccess('Link copied to clipboard!')
    showShareModal.value = false
  } catch (error) {
    // Fallback for browsers that don't support clipboard API
    shareInput.value?.select()
    document.execCommand('copy')
    notificationStore.showSuccess('Link copied to clipboard!')
    showShareModal.value = false
  }
}

const viewRelatedNote = (noteId: string) => {
  router.push(`/notes/${noteId}`)
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getPreviewText = (content: string) => {
  const maxLength = 100
  const cleanContent = content
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  
  if (cleanContent.length <= maxLength) {
    return cleanContent
  }
  
  return cleanContent.substring(0, maxLength) + '...'
}

// Close action menu when clicking outside
const handleClickOutside = (event: Event) => {
  if (showActionMenu.value) {
    showActionMenu.value = false
  }
}

onMounted(async () => {
  await fetchNote()
  
  // Also fetch all notes if not already loaded
  if (notes.value.length === 0) {
    try {
      await notesStore.fetchNotes()
    } catch (error) {
      console.error('Failed to fetch notes for related content:', error)
    }
  }

  document.addEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.view-note {
  max-width: 800px;
  margin: 0 auto;
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

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 2rem;
}

.header-main {
  flex: 1;
}

.btn-back {
  margin-bottom: 1rem;
}

.note-header h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #333;
  line-height: 1.2;
  word-break: break-word;
}

.note-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
  font-size: 0.9rem;
  color: #666;
  flex-wrap: wrap;
}

.category-badge {
  background: #e3f2fd;
  color: #1976d2;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.action-dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  z-index: 100;
  min-width: 150px;
  overflow: hidden;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 0.9rem;
}

.dropdown-item:hover {
  background: #f5f5f5;
}

.dropdown-item.danger {
  color: #f44336;
}

.dropdown-item.danger:hover {
  background: #ffebee;
}

.dropdown-separator {
  height: 1px;
  background: #eee;
  margin: 0.25rem 0;
}

.content-card {
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.formatted-content {
  line-height: 1.8;
  font-size: 1.1rem;
  color: #333;
}

.formatted-content :deep(strong) {
  font-weight: 600;
  color: #2c3e50;
}

.formatted-content :deep(em) {
  font-style: italic;
  color: #34495e;
}

.formatted-content :deep(code) {
  background: #f1f3f4;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.9em;
  color: #e74c3c;
}

.formatted-content :deep(ul) {
  margin: 1.5rem 0;
  padding-left: 2rem;
}

.formatted-content :deep(li) {
  margin: 0.5rem 0;
  line-height: 1.6;
}

.formatted-content :deep(br) {
  margin-bottom: 0.5rem;
}

.related-section {
  margin-top: 3rem;
}

.related-section h3 {
  margin-bottom: 1.5rem;
  color: #333;
  display: flex;
  align-items: center;
}

.related-section h3:before {
  content: "🔗";
  margin-right: 0.5rem;
}

.related-notes {
  gap: 1rem;
}

.related-note {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.related-note:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

.related-note h4 {
  margin-bottom: 0.5rem;
  color: #333;
  font-size: 1rem;
}

.related-note p {
  color: #666;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  line-height: 1.4;
}

.related-date {
  font-size: 0.8rem;
  color: #888;
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

.share-input-group {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.share-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #f8f9fa;
}

/* Responsive */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: flex-end;
  }
  
  .note-header h1 {
    font-size: 2rem;
  }
  
  .note-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .related-notes {
    grid-template-columns: 1fr;
  }
  
  .share-input-group {
    flex-direction: column;
  }
}
</style>