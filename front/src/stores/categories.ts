import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '@/types'
import { categoriesAPI } from '@/services/api'
import { useNotificationStore } from './notifications'

export const useCategoriesStore = defineStore('categories', () => {
    const categories = ref<Category[]>([])
    const loading = ref({
        categories: false,
        creating: false,
        updating: false,
        deleting: false
    })

    const categoriesCount = computed(() => categories.value.length)
    const sortedCategories = computed(() =>
        [...categories.value].sort((a, b) => a.name.localeCompare(b.name))
    )

    const fetchCategories = async () => {
        const notificationStore = useNotificationStore()

        try {
            loading.value.categories = true
            const response = await categoriesAPI.getAll()
            categories.value = response.data
        } catch (error: any) {
            const message = error.response?.data?.error || 'Failed to fetch categories'
            notificationStore.showError(message)
            throw error
        } finally {
            loading.value.categories = false
        }
    }

    const createCategory = async (categoryData: CreateCategoryRequest) => {
        const notificationStore = useNotificationStore()

        try {
            loading.value.creating = true
            const response = await categoriesAPI.create(categoryData)
            categories.value.push(response.data)
            notificationStore.showSuccess('Category created successfully!')
            return response.data
        } catch (error: any) {
            const message = error.response?.data?.error || 'Failed to create category'
            notificationStore.showError(message)
            throw error
        } finally {
            loading.value.creating = false
        }
    }

    const updateCategory = async (id: string, categoryData: UpdateCategoryRequest) => {
        const notificationStore = useNotificationStore()

        try {
            loading.value.updating = true
            const response = await categoriesAPI.update(id, categoryData)
            const index = categories.value.findIndex(cat => cat.id === id)
            if (index !== -1) {
                categories.value[index] = response.data
            }
            notificationStore.showSuccess('Category updated successfully!')
            return response.data
        } catch (error: any) {
            const message = error.response?.data?.error || 'Failed to update category'
            notificationStore.showError(message)
            throw error
        } finally {
            loading.value.updating = false
        }
    }

    const deleteCategory = async (id: string) => {
        const notificationStore = useNotificationStore()

        try {
            loading.value.deleting = true
            await categoriesAPI.delete(id)
            categories.value = categories.value.filter(cat => cat.id !== id)
            notificationStore.showSuccess('Category deleted successfully!')
        } catch (error: any) {
            const message = error.response?.data?.error || 'Failed to delete category'
            notificationStore.showError(message)
            throw error
        } finally {
            loading.value.deleting = false
        }
    }

    return {
        categories,
        loading,
        categoriesCount,
        sortedCategories,
        fetchCategories,
        createCategory,
        updateCategory,
        deleteCategory
    }
})