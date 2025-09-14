import { createPinia } from 'pinia'

// Create pinia instance
export const pinia = createPinia()

// Export all stores
export { useNotesStore } from './notes'
export { useCategoriesStore } from './categories'
export { useNotificationStore } from './notifications'
