<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps<{ src: string | null }>()

const objectUrl = ref<string | null>(null)
const failed = ref(false)

const isVideo = () => /\.(mp4|webm)$/i.test(props.src ?? '')

function release() {
  if (objectUrl.value) URL.revokeObjectURL(objectUrl.value)
  objectUrl.value = null
}

// fetch → blob : passe par le cache du service worker (lecture hors-ligne, compatible Safari iOS)
watch(
  () => props.src,
  async (src) => {
    release()
    failed.value = false
    if (!src) return
    try {
      const response = await fetch(src)
      if (!response.ok) throw new Error(String(response.status))
      objectUrl.value = URL.createObjectURL(await response.blob())
    } catch {
      failed.value = true
    }
  },
  { immediate: true },
)

onBeforeUnmount(release)
</script>

<template>
  <div class="media">
    <video v-if="objectUrl && isVideo()" :src="objectUrl" autoplay loop muted playsinline />
    <img v-else-if="objectUrl" :src="objectUrl" alt="" />
    <p v-else class="placeholder">
      {{ !src || failed ? 'Pas encore de vidéo pour ce signe' : 'Chargement…' }}
    </p>
  </div>
</template>
