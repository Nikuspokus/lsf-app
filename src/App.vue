<script setup lang="ts">
import UpdateBanner from './components/features/UpdateBanner.vue'
</script>

<template>
  <main>
    <RouterView :key="$route.fullPath" />
  </main>
  <UpdateBanner />
</template>
