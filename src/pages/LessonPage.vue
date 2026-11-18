<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { signs } from '../data/signs'
import { useProgressStore } from '../stores/useProgressStore'
import { mediaUrl } from '../composables/useSignMedia'
import { shuffle } from '../composables/useShuffle'
import { firstLetter } from '../composables/useLetters'
import SignMedia from '../components/features/SignMedia.vue'

const route = useRoute()
const store = useProgressStore()

const SESSION_SIZE = 15

const categoryId = String(route.params.cat)
const letter = typeof route.query.letter === 'string' ? route.query.letter.toUpperCase() : null
const pool = signs.filter(
  (sign) => (categoryId === 'all' || sign.category === categoryId) && (!letter || firstLetter(sign.word) === letter),
)

const forceAll = ref(false)
const queue = ref(shuffle(pool.filter((sign) => store.isDue(sign.id))).slice(0, SESSION_SIZE))
const revealed = ref(false)
const done = ref(0)

const current = computed(() => queue.value[0] ?? null)

function answer(known: boolean) {
  if (!current.value) return
  store.rate(current.value.id, known)
  done.value++
  revealed.value = false
  // « À revoir » : la carte repasse en fin de file ; « Je savais » : elle sort
  const [card, ...rest] = queue.value
  queue.value = known ? rest : [...rest, card]
}

function reviewAll() {
  forceAll.value = true
  queue.value = shuffle(pool).slice(0, SESSION_SIZE)
  done.value = 0
}
</script>

<template>
  <RouterLink to="/" class="back">← Accueil</RouterLink>

  <template v-if="current">
    <p class="subtitle">{{ queue.length }} carte(s) restante(s) dans cette séance</p>
    <SignMedia :src="mediaUrl(current.id)" />

    <div v-if="revealed" class="answer">
      <h2>{{ current.word }}</h2>
      <p v-if="current.hint">{{ current.hint }}</p>
      <div class="actions">
        <button class="secondary" @click="answer(false)">À revoir</button>
        <button @click="answer(true)">Je savais</button>
      </div>
    </div>
    <button v-else @click="revealed = true">Afficher le mot</button>
  </template>

  <div v-else class="answer">
    <h2>{{ done ? 'Séance terminée 🎉' : 'Rien à réviser pour le moment' }}</h2>
    <button @click="reviewAll">Nouvelle séance de {{ SESSION_SIZE }} cartes</button>
  </div>
</template>
