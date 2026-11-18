<script setup lang="ts">
import { usePwaUpdate } from '../../composables/usePwaUpdate'

const { needRefresh, offlineReady, updateServiceWorker } = usePwaUpdate()
</script>

<template>
  <div v-if="needRefresh" class="banner" role="status">
    <span>Nouvelle version disponible</span>
    <button @click="updateServiceWorker(true)">Mettre à jour</button>
  </div>
  <div v-else-if="offlineReady" class="banner" role="status">
    <span>Prêt pour une utilisation hors-ligne</span>
    <button @click="offlineReady = false">OK</button>
  </div>
</template>
