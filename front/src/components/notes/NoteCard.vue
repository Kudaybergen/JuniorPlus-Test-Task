<template>
  <q-card class="note-card">
    <q-card-section>
      <div class="row items-start q-gutter-sm">
        <div class="col">
          <div class="text-h6 text-weight-medium q-mb-xs">
            {{ note.title }}
          </div>
          
          <div class="text-body2 text-grey-7 note-content q-mb-sm">
            {{ truncatedContent }}
          </div>

          <div class="row items-center q-gutter-sm">
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
        </div>

        <div class="col-auto">
          <q-btn-dropdown
            flat
            round
            dense
            icon="more_vert"
            dropdown-icon=""
          >
            <q-list>
              <q-item clickable v-close-popup @click="$emit('view', note)">
                <q-item-section avatar>
                  <q-icon name="visibility" />
                </q-item-section>
                <q-item-section>View</q-item-section>
              </q-item>

              <q-item clickable v-close-popup @click="$emit('edit', note)">
                <q-item-section avatar>
                  <q-icon name="edit" />
                </q-item-section>
                <q-item-section>Edit</q-item-section>
              </q-item>

              <q-separator />

              <q-item clickable v-close-popup @click="$emit('delete', note)">
                <q-item-section avatar>
                  <q-icon name="delete" color="negative" />
                </q-item-section>
                <q-item-section class="text-negative">Delete</q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </div>
      </div>
    </q-card-section>

    <q-card-actions class="q-pa-none">
      <q-btn
        flat
        no-caps
        color="primary"
        label="Read more"
        @click="$emit('view', note)"
        class="full-width"
      />
    </q-card-actions>
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
  const maxLength = 150
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
.note-card
  transition: transform 0.2s ease, box-shadow 0.2s ease
  cursor: pointer

  &:hover
    transform: translateY(-2px)
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1)

.note-content
  line-height: 1.4
  max-height: 3.5em
  overflow: hidden
  display: -webkit-box
  -webkit-line-clamp: 2
  -webkit-box-orient: vertical
</style>
