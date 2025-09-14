<template>
  <q-card class="note-list-item">
    <q-card-section>
      <div class="row items-start q-gutter-md">
        <div class="col">
          <div class="row items-center q-gutter-sm q-mb-sm">
            <div class="text-h6 text-weight-medium">
              {{ note.title }}
            </div>
            
            <q-chip
              v-if="note.category"
              :label="note.category.name"
              color="secondary"
              text-color="white"
              size="sm"
              icon="label"
            />

            <q-space />

            <div class="text-caption text-grey-6">
              {{ formatDate(note.updatedAt) }}
            </div>
          </div>

          <div class="text-body2 text-grey-7 note-content">
            {{ truncatedContent }}
          </div>
        </div>

        <div class="col-auto">
          <div class="row q-gutter-xs">
            <q-btn
              flat
              round
              dense
              icon="visibility"
              color="primary"
              @click="$emit('view', note)"
            >
              <q-tooltip>View</q-tooltip>
            </q-btn>

            <q-btn
              flat
              round
              dense
              icon="edit"
              color="secondary"
              @click="$emit('edit', note)"
            >
              <q-tooltip>Edit</q-tooltip>
            </q-btn>

            <q-btn
              flat
              round
              dense
              icon="delete"
              color="negative"
              @click="$emit('delete', note)"
            >
              <q-tooltip>Delete</q-tooltip>
            </q-btn>
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Note } from '@/types'

interface Props {
  note: Note
}

const props = defineProps<Props>()

const emit = defineEmits<{
  view: [note: Note]
  edit: [note: Note]
  delete: [note: Note]
}>()

const truncatedContent = computed(() => {
  const maxLength = 200
  const cleanContent = props.note.content
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
  
  if (cleanContent.length <= maxLength) {
    return cleanContent
  }
  
  return cleanContent.substring(0, maxLength) + '...'
})

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours}h ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays}d ago`
  }

  return date.toLocaleDateString()
}
</script>

<style lang="sass" scoped>
.note-list-item
  transition: transform 0.1s ease, box-shadow 0.1s ease

  &:hover
    transform: translateX(4px)
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1)

.note-content
  line-height: 1.5
  max-height: 3em
  overflow: hidden
  display: -webkit-box
  -webkit-line-clamp: 2
  -webkit-box-orient: vertical
</style>
