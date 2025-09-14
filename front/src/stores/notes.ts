import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Note, CreateNoteRequest, UpdateNoteRequest } from '@/types'
import { notesAPI } from '@/services/api'
import { useNotificationStore } from './notifications'

export const useNotesStore = defineStore('notes', () => {
    const notes = ref<Note[]>([])
    const searchQuery = ref('')
    const selectedCategoryId = ref<string | null>(null)
    const loading = ref({
        notes: false,
        creating: false,
        updating: false,
        deleting: false
    })

    const notesCount = computed(() => notes.value.length)

    const recentNotes = computed(() =>
        [...notes.value]
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .slice(0, 5)
    )

    const filteredNotes = computed(() => {
        let filtered = notes.value

        if (selectedCategoryId.value) {
            filtered = filtered.filter(note => note.categoryId === selectedCategoryId.value)
        }

        if (searchQuery.value.trim()) {
            const query = searchQuery.value.toLowerCase()
            filtered = filtered.filter(note =>
                note.title.toLowerCase().includes(query) ||
                note.content.toLowerCase().includes(query) ||
                note.category?.name.toLowerCase().includes(query)
            )
        }

        return filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    })

    const getNotesByCategory = computed(() => (categoryId: string) =>
        notes.value.filter(note => note.categoryId === categoryId)
    )

    const fetchNotes = async () => {
        const notificationStore = useNotificationStore()

        try {
            loading.value.notes = true
            const response = await notesAPI.getAll()
            notes.value = response.data
        } catch (error: any) {
            const message = error.response?.data?.error || 'Failed to fetch notes'
            notificationStore.showError(message)
            throw error
        } finally {
            loading.value.notes = false
        }
    }

    const createNote = async (noteData: CreateNoteRequest) => {
        const notificationStore = useNotificationStore()

        try {
            loading.value.creating = true
            const response = await notesAPI.create(noteData)
            notes.value.unshift(response.data)
            notificationStore.showSuccess('Note created successfully!')
            return response.data
        } catch (error: any) {
            const message = error.response?.data?.error || 'Failed to create note'
            notificationStore.showError(message)
            throw error
        } finally {
            loading.value.creating = false
        }
    }

    const updateNote = async (id: string, noteData: UpdateNoteRequest) => {
        const notificationStore = useNotificationStore()

        try {
            loading.value.updating = true
            const response = await notesAPI.update(id, noteData)
            const index = notes.value.findIndex(note => note.id === id)
            if (index !== -1) {
                notes.value[index] = response.data
            }
            notificationStore.showSuccess('Note updated successfully!')
            return response.data
        } catch (error: any) {
            const message = error.response?.data?.error || 'Failed to update note'
            notificationStore.showError(message)
            throw error
        } finally {
            loading.value.updating = false
        }
    }

    const deleteNote = async (id: string) => {
        const notificationStore = useNotificationStore()

        try {
            loading.value.deleting = true
            await notesAPI.delete(id)
            notes.value = notes.value.filter(note => note.id !== id)
            notificationStore.showSuccess('Note deleted successfully!')
        } catch (error: any) {
            const message = error.response?.data?.error || 'Failed to delete note'
            notificationStore.showError(message)
            throw error
        } finally {
            loading.value.deleting = false
        }
    }

    const deleteNotesByCategory = async (categoryId: string) => {
        const notificationStore = useNotificationStore()

        try {
            loading.value.deleting = true
            await notesAPI.deleteByCategory(categoryId)
            notes.value = notes.value.filter(note => note.categoryId !== categoryId)
            notificationStore.showSuccess('All notes in category deleted successfully!')
        } catch (error: any) {
            const message = error.response?.data?.error || 'Failed to delete notes by category'
            notificationStore.showError(message)
            throw error
        } finally {
            loading.value.deleting = false
        }
    }

    const getNoteByIdAsync = async (id: string) => {
        const notificationStore = useNotificationStore()

        try {
            const response = await notesAPI.getById(id)
            return response.data
        } catch (error: any) {
            const message = error.response?.data?.error || 'Failed to fetch note'
            notificationStore.showError(message)
            throw error
        }
    }

    const setSearchQuery = (query: string) => {
        searchQuery.value = query
    }

    const setCategoryFilter = (categoryId: string | null) => {
        selectedCategoryId.value = categoryId
    }

    const clearFilters = () => {
        searchQuery.value = ''
        selectedCategoryId.value = null
    }

    return {
        notes,
        searchQuery,
        selectedCategoryId,
        loading,
        notesCount,
        recentNotes,
        filteredNotes,
        getNotesByCategory,
        fetchNotes,
        createNote,
        updateNote,
        deleteNote,
        deleteNotesByCategory,
        getNoteByIdAsync,
        setSearchQuery,
        setCategoryFilter,
        clearFilters
    }
})