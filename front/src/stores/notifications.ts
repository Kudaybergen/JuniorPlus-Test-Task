import { defineStore } from 'pinia'
import { ref } from 'vue'

interface Notification {
    id: string
    type: 'positive' | 'negative' | 'warning' | 'info'
    message: string
    timestamp: number
}

export const useNotificationStore = defineStore('notifications', () => {
    const notifications = ref<Notification[]>([])

    const addNotification = (type: Notification['type'], message: string): string => {
        const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const notification: Notification = {
            id,
            type,
            message,
            timestamp: Date.now()
        }

        notifications.value.push(notification)

        // Auto remove after 5 seconds
        setTimeout(() => {
            removeNotification(id)
        }, 5000)

        return id
    }

    const removeNotification = (id: string) => {
        const index = notifications.value.findIndex(n => n.id === id)
        if (index > -1) {
            notifications.value.splice(index, 1)
        }
    }

    const showSuccess = (message: string) => addNotification('positive', message)
    const showError = (message: string) => addNotification('negative', message)
    const showWarning = (message: string) => addNotification('warning', message)
    const showInfo = (message: string) => addNotification('info', message)

    return {
        notifications,
        addNotification,
        removeNotification,
        showSuccess,
        showError,
        showWarning,
        showInfo
    }
})