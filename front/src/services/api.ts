import axios, { AxiosResponse } from 'axios'
import type {
    Note,
    Category,
    CreateNoteRequest,
    UpdateNoteRequest,
    CreateCategoryRequest,
    UpdateCategoryRequest
} from '@/types'

// Create axios instance with base configuration
const api = axios.create({
    baseURL: 'http://localhost:5000',
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 10000
})

// Request interceptor for logging
api.interceptors.request.use(
    (config) => {
        console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`)
        return config
    },
    (error) => {
        console.error('Request error:', error)
        return Promise.reject(error)
    }
)

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => {
        console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`)
        return response
    },
    (error) => {
        console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response?.status}`)
        console.error('Response error:', error.response?.data || error.message)
        return Promise.reject(error)
    }
)

// Notes API
export const notesAPI = {
    // Get all notes
    getAll: (): Promise<AxiosResponse<Note[]>> =>
        api.get('/notes'),

    // Get note by ID
    getById: (id: string): Promise<AxiosResponse<Note>> =>
        api.get(`/notes/${id}`),

    // Get notes by category ID
    getByCategory: (categoryId: string): Promise<AxiosResponse<Note[]>> =>
        api.get(`/notes/category/${categoryId}`),

    // Create new note
    create: (note: CreateNoteRequest): Promise<AxiosResponse<Note>> =>
        api.post('/notes', note),

    // Update note
    update: (id: string, note: UpdateNoteRequest): Promise<AxiosResponse<Note>> =>
        api.put(`/notes/${id}`, note),

    // Delete note
    delete: (id: string): Promise<AxiosResponse<{ message: string }>> =>
        api.delete(`/notes/${id}`),

    // Delete all notes by category
    deleteByCategory: (categoryId: string): Promise<AxiosResponse<{ message: string }>> =>
        api.delete(`/notes/category/${categoryId}`)
}

// Categories API
export const categoriesAPI = {
    // Get all categories
    getAll: (): Promise<AxiosResponse<Category[]>> =>
        api.get('/notes-category'),

    // Get category by ID
    getById: (id: string): Promise<AxiosResponse<Category>> =>
        api.get(`/notes-category/${id}`),

    // Create new category
    create: (category: CreateCategoryRequest): Promise<AxiosResponse<Category>> =>
        api.post('/notes-category', category),

    // Update category
    update: (id: string, category: UpdateCategoryRequest): Promise<AxiosResponse<Category>> =>
        api.put(`/notes-category/${id}`, category),

    // Delete category
    delete: (id: string): Promise<AxiosResponse<{ message: string }>> =>
        api.delete(`/notes-category/${id}`)
}

// Health check API
export const healthAPI = {
    check: (): Promise<AxiosResponse<any>> =>
        api.get('/health')
}

export default api
