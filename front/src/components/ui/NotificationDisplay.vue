<template>
  <div class="notification-container">
    <q-notification
      v-for="notification in notifications"
      :key="notification.id"
      :type="notification.type"
      :message="notification.message"
      :timeout="0"
      position="top-right"
      class="notification-item"
      @dismiss="removeNotification(notification.id)"
    >
      <template v-slot:action>
        <q-btn
          flat
          round
          dense
          icon="close"
          @click="removeNotification(notification.id)"
        />
      </template>
    </q-notification>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useNotificationStore } from '@/stores/notifications'

const notificationStore = useNotificationStore()
const { notifications } = storeToRefs(notificationStore)
const { removeNotification } = notificationStore
</script>

<style lang="sass" scoped>
.notification-container
  position: fixed
  top: 70px
  right: 16px
  z-index: 9999
  width: 300px

.notification-item
  margin-bottom: 8px
  border-radius: 8px
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1)
</style>
