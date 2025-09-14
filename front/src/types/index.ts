// Base entity interface matching backend BaseEntity
export interface BaseEntity {
    id: string
    createdAt: string
    updatedAt: string
}

// Category interface matching backend NotesCategoryEntity
export interface Category extends BaseEntity {
    name: string
}

// Note interface matching backend NotesEntity
export interface Note extends BaseEntity {
    title: string
    content: string
    categoryId: string
    category?: Category
}

// API request/response types
export interface CreateCategoryRequest {
    name: string
}

export interface UpdateCategoryRequest {
    name: string
}

export interface CreateNoteRequest {
    title: string
    content: string
    categoryId: string
}

export interface UpdateNoteRequest {
    title: string
    content: string
    categoryId: string
}

export interface ApiError {
    error: string
}

// UI state types
export interface NotificationOptions {
    type: 'positive' | 'negative' | 'warning' | 'info'
    message: string
    timeout?: number
}

export interface ConfirmDialogOptions {
    title: string
    message: string
    confirmText?: string
    cancelText?: string
}

export interface LoadingState {
    notes: boolean
    categories: boolean
    creating: boolean
    updating: boolean
    deleting: boolean
}
