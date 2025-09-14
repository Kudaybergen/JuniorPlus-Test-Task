<template>
  <div class="not-found">
    <div class="empty-state">
      <h2>404 - Page Not Found</h2>
      <p>The page you're looking for doesn't exist.</p>
      <button @click="$router.push('/')" class="btn btn-primary">Go Home</button>
    </div>
  </div>
</template>

<script setup lang="ts">
// Empty setup - simple component
</script>

<style scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
}

.empty-state {
  text-align: center;
}

.empty-state h2 {
  margin-bottom: 1rem;
  color: #333;
}

.empty-state p {
  margin-bottom: 2rem;
  color: #666;
}
</style>