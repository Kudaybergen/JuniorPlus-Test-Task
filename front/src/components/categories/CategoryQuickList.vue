<template>
  <div>
    <q-item-label header class="text-grey-7">
      <q-icon name="category" size="sm" class="q-mr-xs" />
      Categories
    </q-item-label>

    <div v-if="loading.categories" class="q-pa-md text-center">
      <q-spinner-dots size="md" color="primary" />
    </div>

    <div v-else-if="categories.length === 0" class="q-pa-md text-center text-grey-6">
      <div class="text-body2">No categories yet</div>
      <q-btn
        flat
        size="sm"
        color="primary"
        label="Create one"
        @click="$router.push('/categories')"
        class="q-mt-sm"
      />
    </div>

    <div v-else>
      <q-item
        v-for="category in categories"
        :key="category.id"
        clickable
        v-ripple
        @click="goToCategoryNotes(category.id)"
        class="q-pl-lg"
      >
        <q-item-section avatar>
          <q-icon name="label" size="sm" color="secondary" />
        </q-item-section>

        <q-item-section>
          <q-item-label lines="1" class="text-body2">
            {{ category.name }}
          </q-item-label>
          <q-item-label caption>
            {{ getNoteCount(category.id) }} notes
          </q-item-label>
        </q-item-section>
      </q-item>

      <q-item
        clickable
        v-ripple
        @click="$router.push('/categories')"
        class="q-pl-lg"
      >
        <q-item-section avatar>
          <q-icon name="settings" size="sm" color="grey-6" />
        </q-item-section>

        <q-item-section>
          <q-item-label class="text-body2 text-grey-7">
            Manage Categories
          </q-item-label>
        </q-item-section>
      </q-item>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useCategoriesStore } from '@/stores/categories'
import { useNotesStore } from '@/stores/notes'

const router = useRouter()
const categoriesStore = useCategoriesStore()
const notesStore = useNotesStore()

const { categories, loading } = storeToRefs(categoriesStore)
const { getNotesByCategory } = storeToRefs(notesStore)

const getNoteCount = computed(() => (categoryId: string) => {
  return getNotesByCategory.value(categoryId).length
})

const goToCategoryNotes = (categoryId: string) => {
  router.push(`/categories/${categoryId}/notes`)
}

onMounted(async () => {
  try {
    await categoriesStore.fetchCategories()
  } catch (error) {
    console.error('Failed to fetch categories:', error)
  }
})
</script>
