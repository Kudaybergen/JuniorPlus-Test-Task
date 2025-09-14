<template>
  <div class="create-category">
    <div class="header">
      <div>
        <h2>Create New Category</h2>
        <p>Organize your notes with categories</p>
      </div>
      <button @click="handleCancel" class="btn btn-secondary">← Back</button>
    </div>

    <form @submit.prevent="saveCategory" class="category-form">
      <div class="form-main card">
        <div class="form-group">
          <label for="name">Category Name *</label>
          <input
            id="name"
            v-model="categoryForm.name"
            type="text"
            placeholder="Enter category name"
            required
            maxlength="50"
            ref="nameInput"
          />
          <div class="char-counter">{{ categoryForm.name.length }}/50</div>
          <div class="help-text">
            <small>💡 Choose a descriptive name that will help you organize your notes</small>
          </div>
        </div>

        <div class="form-actions">
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="!isFormValid || loading.creating"
          >
            {{ loading.creating ? 'Creating...' : 'Create Category' }}
          </button>
          <button
            type="button"
            @click="handleCancel"
            class="btn btn-secondary"
            :disabled="loading.creating"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>

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
import { useCategoriesStore } from '@/stores/categories'

const router = useRouter()
const categoriesStore = useCategoriesStore()

const { loading } = storeToRefs(categoriesStore)

const categoryForm = ref({
  name: ''
})

const showUnsavedModal = ref(false)
const nameInput = ref()

const isFormValid = computed(() => {
  return categoryForm.value.name.trim().length >= 2
})

const hasUnsavedChanges = computed(() => {
  return categoryForm.value.name.trim()
})

const saveCategory = async () => {
  if (!isFormValid.value) return

  try {
    const category = await categoriesStore.createCategory({
      name: categoryForm.value.name.trim()
    })

    router.push('/categories')
  } catch (error) {
    console.error('Failed to create category:', error)
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
  router.back()
}

const cancelLeave = () => {
  showUnsavedModal.value = false
}

onMounted(async () => {
  await nextTick()
  nameInput.value?.focus()
})
</script>

<style scoped>
.create-category {
  max-width: 600px;
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

.category-form {
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

.help-text {
  margin-top: 0.5rem;
  color: #666;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-start;
  flex-wrap: wrap;
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
}
</style>
