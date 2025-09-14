<template>
  <q-item
    :to="to"
    clickable
    v-ripple
    active-class="text-primary"
  >
    <q-item-section avatar>
      <q-icon :name="icon" />
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ title }}</q-item-label>
      <q-item-label caption lines="2">{{ caption }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
interface Props {
  title: string
  caption?: string
  icon: string
  to: string
}

defineProps<Props>()
</script>
