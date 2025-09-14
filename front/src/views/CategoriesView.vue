<template>
  <div class="categories-view">
    <!-- Header Section -->
    <div class="header">
      <div>
        <h2>Categories</h2>
        <p>{{ categoriesCount }} categories to organize your notes</p>
      </div>
      <router-link to="/categories/create" class="btn btn-primary">+ New Category</router-link>
    </div>

    <!-- Loading State -->
    <div v-if="loading.categories" class="loading">
      <div class="loading-spinner">🔄</div>
      <p>Loading categories...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="categories.length === 0" class="empty-state">
      <div class="empty-icon">🏷️</div>
      <h3>No categories yet</h3>
      <p>Create your first category to organize your notes</p>
      <router-link to="/categories/create" class="btn btn-primary">Create Category</router-link>
    </div>

    <!-- Categories Grid -->
    <div v-else class="categories-grid grid grid-2">
      <div
        v-for="category in sortedCategories"
        :key="category.id"
        class="category-card card"
      >
        <div class="category-header">
          <h4>{{ category.name }}</h4>
          <div class="category-actions">
            <button @click="editCategory(category)" class="btn btn-sm">Edit</button>
            <button @click="deleteCategory(category)" class="btn btn-sm btn-danger">Delete</button>
          </div>
        </div>
        <div class="category-meta">
          <span class="date">Created {{ formatDate(category.createdAt) }}</span>
        </div>
        <div class="category-footer">
          <router-link 
            :to="`/categories/${category.id}/notes`" 
            class="btn btn-secondary btn-sm"
          >
            View Notes
          </router-link>
        </div>
      </div>
    </div>

    <!-- Edit Category Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click="cancelEdit">
      <div class="modal" @click.stop>
        <h3>Edit Category</h3>
        <form @submit.prevent="updateCategory">
          <div class="form-group">
            <label for="editCategoryName">Category Name *</label>
            <input
              id="editCategoryName"
              v-model="editForm.name"
              type="text"
              placeholder="Enter category name"
              required
              maxlength="50"
              ref="editInput"
            />
          </div>
          <div class="modal-actions">
            <button type="button" @click="cancelEdit" class="btn btn-secondary">Cancel</button>
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="!editForm.name.trim() || loading.updating"
            >
              {{ loading.updating ? 'Updating...' : 'Update' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="cancelDelete">
      <div class="modal" @click.stop>
        <h3>Delete Category</h3>
        <p>Are you sure you want to delete "<strong>{{ categoryToDelete?.name }}</strong>"? This action cannot be undone and will remove the category from all associated notes.</p>
        <div class="modal-actions">
          <button @click="cancelDelete" class="btn btn-secondary">Cancel</button>
          <button @click="confirmDelete" class="btn btn-danger" :disabled="loading.deleting">
            {{ loading.deleting ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useCategoriesStore } from '@/stores/categories'
import type { Category } from '@/types'

const categoriesStore = useCategoriesStore()

const { 
  categories, 
  sortedCategories, 
  categoriesCount, 
  loading 
} = storeToRefs(categoriesStore)

// Local state
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const categoryToEdit = ref<Category | null>(null)
const categoryToDelete = ref<Category | null>(null)
const editForm = ref({
  name: ''
})

const editInput = ref()

// Methods
const editCategory = (category: Category) => {
  categoryToEdit.value = category
  editForm.value.name = category.name
  showEditModal.value = true
  nextTick(() => {
    editInput.value?.focus()
  })
}

const updateCategory = async () => {
  if (!categoryToEdit.value || !editForm.value.name.trim()) return

  try {
    await categoriesStore.updateCategory(categoryToEdit.value.id, {
      name: editForm.value.name.trim()
    })
    cancelEdit()
  } catch (error) {
    console.error('Failed to update category:', error)
  }
}

const cancelEdit = () => {
  showEditModal.value = false
  categoryToEdit.value = null
  editForm.value.name = ''
}

const deleteCategory = (category: Category) => {
  categoryToDelete.value = category
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (categoryToDelete.value) {
    try {
      await categoriesStore.deleteCategory(categoryToDelete.value.id)
    } catch (error) {
      console.error('Failed to delete category:', error)
    }
  }
  cancelDelete()
}

const cancelDelete = () => {
  showDeleteModal.value = false
  categoryToDelete.value = null
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) return 'today'
  if (diffInDays === 1) return 'yesterday'
  if (diffInDays < 7) return `${diffInDays} days ago`
  
  return date.toLocaleDateString()
}

// Lifecycle
onMounted(async () => {
  try {
    await categoriesStore.fetchCategories()
  } catch (error) {
    console.error('Failed to fetch categories:', error)
  }
})
</script>

<style scoped>
.categories-view {
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

.categories-grid {
  margin-top: 1rem;
}

.category-card {
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
}

.category-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.category-header h4 {
  color: #333;
  font-size: 1.1rem;
  margin: 0;
  flex: 1;
}

.category-actions {
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.category-card:hover .category-actions {
  opacity: 1;
}

.category-meta {
  margin-bottom: 1rem;
  font-size: 0.85rem;
}

.date {
  color: #888;
}

.category-footer {
  display: flex;
  justify-content: flex-end;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
}

/* Responsive */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .category-header {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }
  
  .category-actions {
    opacity: 1;
    align-self: flex-end;
  }
}
</style>